import { t } from "$lib/services/language.svelte";
import { DB } from "$lib/DB";
import * as env from "$env/static/public";
import * as pako from "pako";
import { OnlineDB } from "$lib/OnlineDB";
import type Files from "$lib/services/files.svelte";
import type { User } from "firebase/auth";
import { getApp, initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default class Backup {
  private readonly file: Files;
  private readonly user: User;

  constructor(file: Files, user: User) {
    this.file = file;
    this.user = user;
  }

  private getFirebaseStorage() {
    const firebaseConfig = {
      apiKey: env.PUBLIC_FIREBASE_API_KEY,
      authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.PUBLIC_FIREBASE_APP_ID,
    };

    const BACKUP_APP_NAME = "[DEFAULT]";
    let app;

    try {
      app = getApp(BACKUP_APP_NAME);
    } catch {
      app = initializeApp(firebaseConfig, BACKUP_APP_NAME);
    }

    return getStorage(app);
  }

  async createBackup(): Promise<SimpleResult> {
    try {
      if (!this.user) throw new Error("User not signed in");

      const tasks = await DB.Task.getAll({ selector: { archived: { $ne: true } } });
      const categories = await DB.Category.getAll({ selector: { archived: { $ne: true } } });
      const encrypted_data = await Backup.compressAndEncrypt({ tasks, categories });

      // Create a Blob from the encrypted data
      const encrypted_blob = new Blob([encrypted_data], { type: "application/octet-stream" });
      const sha256 = await Backup.sha256FromBlob(encrypted_blob);

      // Direct Firebase Storage upload
      const storage = this.getFirebaseStorage();
      const file_path = `users/${this.user.uid}/snapshots/${new Date().toISOString()}.bin`;
      const storageRef = ref(storage, file_path);

      console.log("Uploading to Firebase Storage:", file_path);
      const uploadResult = await uploadBytes(storageRef, encrypted_blob);
      console.log("Upload successful:", uploadResult);

      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log("Download URL:", downloadURL);

      alert("Saving backup metadata...");
      // Save backup metadata to OnlineDB
      const onlineDb = OnlineDB.getInstance();
      await onlineDb.BackupManifest.create({
        file_path: file_path,
        timestamp: new Date().toISOString(),
        user_id: this.user.uid,
        size: encrypted_blob.size,
        sha256: sha256,
        device: navigator.userAgent,
      });

      alert("Backup created successfully!");
      return { success: true };
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Rugsteun het misluk: " + (error as Error).message || "Something went wrong");
      return { success: false, error_message: (error as Error).message || "Something went wrong" };
    }
  }

  async restoreBackup(manifest: BackupManifest): Promise<SimpleResult> {
    try {
      if (!this.user) throw new Error("User not signed in");
      if (!manifest) throw new Error("No backup data found");

      const blob = await this.file.download(manifest.file_path);
      const encrypted_data = await blob.text();
      if (!encrypted_data) throw new Error("Failed to read backup data");

      const data_string = await this.decryptAndDecompress(encrypted_data);
      const data = JSON.parse(data_string);
      if (!data.tasks || !data.categories) {
        throw new Error("Invalid backup data format");
      }

      // Clear data.
      await DB.Task.clear();
      await DB.Category.clear();

      // Restore data.
      await DB.Task.createMany(data.tasks);
      await DB.Category.createMany(data.categories);

      return { success: true };
    } catch (error) {
      console.error("Backup restoration failed:", error);
      return { success: false, error_message: (error as Error).message || "Something went wrong" };
    }
  }

  async listBackups() {
    try {
      if (!this.user) throw new Error("User not signed in");

      const onlineDb = OnlineDB.getInstance();
      const backup_manifests = await onlineDb.BackupManifest.getAll({
        filters: [{ field: "user_id", operator: "==", value: this.user.uid }],
        sort: [{ field: "created_at", direction: "desc" }],
      });

      return { success: true, data: backup_manifests };
    } catch (error) {
      console.error("Listing backups failed:", error);
      return { success: false, error_message: (error as Error).message || "Something went wrong" };
    }
  }

  /**
   * Helper function to derive a crypto key from string
   */
  private static async deriveKey(): Promise<CryptoKey> {
    const keyString = `${env.PUBLIC_ENCRYPTION_KEY || ""}`.padEnd(32, "0").substring(0, 32);
    const keyData = new TextEncoder().encode(keyString);
    return crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }

  private static async compressAndEncrypt(data: any): Promise<string> {
    try {
      // Convert data to JSON string
      const jsonString = JSON.stringify(data);

      // Compress the data
      const compressed = pako.gzip(jsonString);

      // Convert compressed data to base64
      const compressedBase64 = btoa(String.fromCharCode(...compressed));
      const data_to_encrypt = new TextEncoder().encode(compressedBase64);

      // Encrypt the compressed data using Web Crypto API
      const key = await Backup.deriveKey();

      // Generate a random IV (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the data
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data_to_encrypt);

      // Combine IV and encrypted data, then convert to base64
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      const result = btoa(String.fromCharCode(...combined));

      return result;
    } catch (error) {
      console.error("Error compressing and encrypting data:", error);
      alert("Error during compression and encryption: " + (error.stack || error));
      throw new Error("Failed to compress and encrypt data" + (error.stack || error));
    }
  }

  private async decryptAndDecompress(encryptedData: string): Promise<any> {
    try {
      // Convert base64 back to buffer
      const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Decrypt the data
      const key = await Backup.deriveKey();
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, encrypted);

      // Convert decrypted data back to string
      const decoder = new TextDecoder();
      const compressedBase64 = decoder.decode(decrypted);

      // Convert base64 back to buffer
      const compressed = Uint8Array.from(atob(compressedBase64), (c) => c.charCodeAt(0));

      // Decompress the data
      const decompressed = pako.ungzip(compressed, { to: "string" });

      // Parse JSON and return
      return JSON.parse(decompressed);
    } catch (error) {
      console.error("Error decrypting and decompressing data:", error);
      throw new Error("Failed to decrypt and decompress data");
    }
  }

  private static async sha256FromBlob(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
  }
}

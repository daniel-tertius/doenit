import { deleteObject, getBlob, getStorage, ref, uploadBytes } from "firebase/storage";
import { BACKUP_APP_NAME, FIREBASE_CONFIG } from "$lib";
import { getApp, initializeApp } from "firebase/app";

class Files {
  static async upload(path: string, blob: Blob): Promise<SimpleResult> {
    try {
      const storage = Files.getFirebaseStorage();
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, blob);

      return { success: true };
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      alert(`Upload failed: ${errorMessage}`);
      return { success: false, error_message: errorMessage };
    }
  }

  static async download(path: string): Promise<Blob> {
    try {
      const storage = Files.getFirebaseStorage();
      const storageRef = ref(storage, path);

      const blob = await getBlob(storageRef);
      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Download failed";
      throw new Error(`Download failed: ${errorMessage}`);
    }
  }

  static async delete(path: string): Promise<boolean> {
    try {
      const storage = Files.getFirebaseStorage();
      const storageRef = ref(storage, path);

      await deleteObject(storageRef);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Delete failed";
      console.error(`Delete failed: ${errorMessage}`);
      return false;
    }
  }

  private static getFirebaseStorage() {
    let app;

    try {
      app = getApp(BACKUP_APP_NAME);
    } catch {
      app = initializeApp(FIREBASE_CONFIG, BACKUP_APP_NAME);
    }

    return getStorage(app);
  }
}

export default Files;

import { ref, uploadBytes, getDownloadURL, deleteObject, getBlob } from "firebase/storage";
import type { User } from "firebase/auth";
import { FirebaseStorage } from "@capacitor-firebase/storage";

class Files {
  private user: User;
  // private storage: FirebaseStorage;

  constructor(/* storage: FirebaseStorage, */ user: User) {
    this.user = user;
    // this.storage = storage;
  }

  async upload(path: string, blob: Blob): Promise<SimpleResult> {
    const uri = await this.blobToUri(blob);
    const result = await new Promise(async (resolve, reject) => {
      await FirebaseStorage.uploadFile({ path, blob, uri }, (event, error) => {
        if (error) {
          alert(`Upload error: ${typeof error === "string" ? error : error.message || JSON.stringify(error)}`);
          reject(error);
        } else if (event?.completed) {
          resolve({ success: true });
        }
      });
    });

    alert(result);
    return { success: true };
    // try {
    //   const storageRef = ref(this.storage, path);

    //   const uploadMetadata = {
    //     contentType: blob.type || "application/octet-stream",
    //   };

    //   console.log(`Starting upload of ${blob.size.toFixed(2)} bytes...`);
    //   alert(`Uploading file (${blob.size.toFixed(2)} bytes)...`);

    //   // Add timeout to prevent hanging indefinitely
    //   const uploadPromise = uploadBytes(storageRef, blob, uploadMetadata);
    //   const timeoutPromise = new Promise<never>((_, reject) =>
    //     setTimeout(() => reject(new Error("Upload timeout after 10 minutes")), 600000)
    //   );

    //   await Promise.race([uploadPromise, timeoutPromise]);

    //   console.log("Upload successful! Download URL obtained.");
    //   alert("Upload successful!");
    //   return { success: true };
    // } catch (error) {
    //   console.error("Upload failed:", error);
    //   const errorMessage = error instanceof Error ? error.message : "Upload failed";
    //   alert(`Upload failed: ${errorMessage}`);
    //   return { success: false, error_message: errorMessage };
    // }
  }

  // async download(path: string): Promise<Blob> {
  //   try {
  //     const fullPath = `users/${this.user.uid}/snapshots/${path}`;
  //     const storageRef = ref(this.storage, fullPath);

  //     const blob = await getBlob(storageRef);
  //     return blob;
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : "Download failed";
  //     throw new Error(`Download failed: ${errorMessage}`);
  //   }
  // }

  // async delete(path: string): Promise<boolean> {
  //   try {
  //     const fullPath = `users/${this.user.uid}/snapshots/${path}`;
  //     const storageRef = ref(this.storage, fullPath);

  //     await deleteObject(storageRef);
  //     return true;
  //   } catch (error) {
  //     const errorMessage = error instanceof Error ? error.message : "Delete failed";
  //     console.error(`Delete failed: ${errorMessage}`);
  //     return false;
  //   }
  // }

  private async blobToUri(blob: Blob): Promise<string> {
    // Create a temporary file URL that Capacitor can work with
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert blob to data URI"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read blob"));
      reader.readAsDataURL(blob);
    });
  }
}

export default Files;

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type WhereFilterOp,
  getFirestore,
} from "firebase/firestore";
import { getApp, initializeApp } from "firebase/app";
import { FIREBASE_CONFIG } from "$lib";

interface QueryOptions {
  filters?: { field: string; operator: WhereFilterOp; value: any }[];
  sort?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
}

type SnapshotCallback<T> = (docs: T[]) => void;

export class Table<T extends Task | Room | Category | BackupManifest> {
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  async create(data: Omit<T, "id" | "created_at">): Promise<SimpleResult> {
    try {
      if (!data) throw new Error("Data is required");

      const created_at = new Date().toISOString();
      const db = this.getFirestore();
      const colRef = collection(db, this.name);

      // Convert to plain object and ensure all values are serializable
      const doc_data = JSON.parse(JSON.stringify({ ...data, created_at }));
      await addDoc(colRef, doc_data);

      return { success: true };
    } catch (error) {
      console.error("Error creating document in " + this.name + ":", error);
      return {
        success: false,
        error_message: (error as Error).message || "Failed to create document",
      };
    }
  }

  async read(id: string): Promise<T | null> {
    const db = this.getFirestore();
    const docRef = doc(db, this.name, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    return { id: snapshot.id, ...snapshot.data() } as T;
  }
  async getAll(options?: QueryOptions): Promise<T[]> {
    const q = this.buildQuery(options);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
  }

  async update(id: string, data: T) {
    const db = this.getFirestore();
    const docRef = doc(db, this.name, id);
    await updateDoc(docRef, data);
    return { ...data, id };
  }

  async delete(id: string) {
    const db = this.getFirestore();
    const docRef = doc(db, this.name, id);
    await deleteDoc(docRef);
  }

  private buildQuery(options?: QueryOptions) {
    const db = this.getFirestore();
    let colRef = collection(db, this.name);
    let q = query(colRef);

    if (options?.filters) {
      for (const f of options.filters) {
        q = query(q, where(f.field, f.operator, f.value));
      }
    }

    if (options?.sort) {
      for (const s of options.sort) {
        q = query(q, orderBy(s.field, s.direction));
      }
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    return q;
  }

  subscribe(callback: SnapshotCallback<T>, options?: QueryOptions) {
    try {
      const q = this.buildQuery(options);

      console.log("Attempting to subscribe to", this.name);

      return onSnapshot(
        q,
        (snapshot) => {
          console.log("Successfully received snapshot for", this.name, "- docs count:", snapshot.docs.length);
          const docs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
          callback(docs);
        },
        (error) => {
          console.error("Firestore subscription error for", this.name, ":");
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Full error:", error);

          // Handle specific error cases
          if (error.code === "permission-denied") {
            console.error("Permission denied - check Firestore security rules and authentication");
          } else if (error.code === "unauthenticated") {
            console.error("User not authenticated - make sure to sign in before accessing Firestore");
          }
        }
      );
    } catch (error) {
      console.error("Error setting up subscription for", this.name, ":", error);
      throw error;
    }
  }

  private getFirestore() {
    let app;

    try {
      app = getApp();
    } catch {
      app = initializeApp(FIREBASE_CONFIG);
    }

    return getFirestore(app, "doenitdb");
  }
}

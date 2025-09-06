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
  Firestore,
  type WhereFilterOp,
} from "firebase/firestore";

interface QueryOptions {
  filters?: { field: string; operator: WhereFilterOp; value: any }[];
  sort?: { field: string; direction: "asc" | "desc" }[];
  limit?: number;
}

type SnapshotCallback<T> = (docs: T[]) => void;

export class Table<T extends Task | Room | Category | BackupManifest> {
  private db: Firestore;
  private collectionName: string;

  constructor(db: Firestore, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  async create(data: Omit<T, "id" | "created_at">): Promise<T> {
    if (!data) throw new Error("Data is required");

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    const colRef = collection(this.db, this.collectionName);
    const docRef = await addDoc(colRef, { ...data, id, created_at } as T);
    return { ...data, id: docRef.id, created_at } as T;
  }

  async read(id: string): Promise<T | null> {
    const docRef = doc(this.db, this.collectionName, id);
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
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, data);
    return { ...data, id };
  }

  async delete(id: string) {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  private buildQuery(options?: QueryOptions) {
    let colRef = collection(this.db, this.collectionName);
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

      console.log("Attempting to subscribe to", this.collectionName);

      return onSnapshot(
        q,
        (snapshot) => {
          console.log("Successfully received snapshot for", this.collectionName, "- docs count:", snapshot.docs.length);
          const docs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as T[];
          callback(docs);
        },
        (error) => {
          console.error("Firestore subscription error for", this.collectionName, ":");
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
      console.error("Error setting up subscription for", this.collectionName, ":", error);
      throw error;
    }
  }
}

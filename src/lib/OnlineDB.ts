import { getFirestore } from "firebase/firestore";
import { auth } from "$lib/services/auth.svelte";
import { Table } from "./DB/_OnlineTable";

export class OnlineDB {
  private static instance: OnlineDB | null = null;
  public BackupManifest: Table<BackupManifest>;
  private db;

  private constructor() {
    if (!auth.app) throw new Error("Firebase app not initialized");

    this.db = getFirestore(auth.app);
    this.BackupManifest = new Table(this.db, "backups");
  }

  static getInstance() {
    if (!OnlineDB.instance) {
      OnlineDB.instance = new OnlineDB();
    }
    return OnlineDB.instance;
  }
}

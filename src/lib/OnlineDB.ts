import { Table } from "./DB/_OnlineTable";

class OnlineDBClass {
  public BackupManifest: Table<BackupManifest>;

  constructor() {
    this.BackupManifest = new Table("backups");
  }
}

export const OnlineDB = new OnlineDBClass();

import { Table } from "./DB/_OnlineTable";
import { ChangeLogTable } from "./DB/Changelog";

class OnlineDBClass {
  public Changelog: ChangeLogTable;
  public BackupManifest: Table<BackupManifest>;
  public Invite: Table<Invite>;

  constructor() {
    this.BackupManifest = new Table("backups");
    this.Invite = new Table("invites");
    this.Changelog = new ChangeLogTable();
  }
}

export const OnlineDB = new OnlineDBClass();

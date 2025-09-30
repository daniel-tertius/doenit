import { Table } from "./DB/_OnlineTable";
import { ChangeLogTable } from "./DB/Changelog";

class OnlineDBClass {
  public Changelog: ChangeLogTable;
  public BackupManifest: Table<BackupManifest>;
  public Invite: Table<Invite>;
  public User: Table<Users>;

  constructor() {
    this.BackupManifest = new Table("backups");
    this.Invite = new Table("invites");
    this.Changelog = new ChangeLogTable();
    this.User = new Table("users");
  }
}

export const OnlineDB = new OnlineDBClass();

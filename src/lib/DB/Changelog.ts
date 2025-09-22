import { arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { Table } from "./_OnlineTable";

export class ChangeLogTable extends Table<Changelog> {
  constructor() {
    super("changelog");
  }

  async incrementUserReads(id: string, user_email: string) {
    const doc_ref = this.getDoc(id);
    return setDoc(doc_ref, { user_reads_list: arrayUnion(user_email) }, { merge: true });
  }

  async decrementUserReads(id: string, user_email: string) {
    const doc_ref = this.getDoc(id);
    return setDoc(doc_ref, { user_reads_list: arrayRemove(user_email) }, { merge: true });
  }

  async leaveRooms(ids: string | string[], user_email: string) {
    if (!Array.isArray(ids)) ids = [ids];
    if (!ids.length) return;

    try {
      const changelogs = await this.getAll({
        filters: [{ field: "room_id", operator: "in", value: ids }],
      });

      for (const changelog of changelogs) {
        this.decrementUserReads(changelog.id, user_email);
      }
    } catch (e) {
      alert("Failed to leave rooms in changelog: " + e);
    }
  }
}

import { arrayUnion, arrayRemove, setDoc } from "firebase/firestore";
import { Table } from "./_OnlineTable";
import user from "$lib/core/user.svelte";
import { Notify } from "$lib/services/notifications/notifications";
import { t } from "$lib/services/language.svelte";
import { DB } from "$lib/DB";

export class ChangeLogTable extends Table<Changelog> {
  constructor() {
    super("changelog");
  }

  async create(data: Omit<Changelog, "id" | "archived" | "created_at">): Promise<SimpleResult> {
    return super.create(data);
  }

  async createCreateEntry(room: Room, task: Task) {
    if (!room || !task) return;
    const email_address = user.value?.email;
    if (!email_address) return;

    const create_promise = this.create({
      type: "create",
      data: JSON.stringify(task), // TODO Encrypt/Decrypt
      room_id: task.room_id || "",
      total_reads_needed: room.users.length,
      user_reads_list: [email_address],
    });

    const email_addresses = DB.Room.getNotificationEmails(room);
    const notify_promise = Notify.Push.send({
      title: t("task_created"),
      body: t("task_was_created", { task_name: task.name }),
      email_address: email_addresses,
    });

    await Promise.all([create_promise, notify_promise]);
  }

  async createCompleteEntry(room: Room, task: Task) {
    if (!room || !task) return;
    const email_address = user.value?.email;
    if (!email_address) return;

    const create_promise = this.create({
      type: "complete",
      task_id: task.id,
      room_id: task.room_id || "",
      total_reads_needed: room.users.length,
      user_reads_list: [email_address],
    });

    const email_addresses = DB.Room.getNotificationEmails(room);
    const notify_promise = Notify.Push.send({
      title: t("task_completed"),
      body: t("task_was_completed", { task_name: task.name }),
      email_address: email_addresses,
    });

    await Promise.all([create_promise, notify_promise]);
  }

  async createUpdateEntry(room: Room, task: Task) {
    if (!room || !task) return;
    const email_address = user.value?.email;
    if (!email_address) return;

    const create_promise = this.create({
      type: "update",
      update: task,
      room_id: task.room_id || "",
      total_reads_needed: room.users.length,
      user_reads_list: [email_address],
    });

    // const email_addresses = DB.Room.getNotificationEmails(room);
    // const notify_promise = Notify.Push.send({
    //   title: t("task_updated"),
    //   body: t("task_was_updated", { task_name: task.name }),
    //   email_address: email_addresses,
    // });

    await Promise.all([create_promise, /* notify_promise */]);
  }

  async createUnshareUpdateEntry(room: Room, task: Task) {
    if (!room || !task) return;
    const email_address = user.value?.email;
    if (!email_address) return;

    const create_promise = this.create({
      type: "unshare",
      task_id: task.id,
      room_id: task.room_id || "",
      total_reads_needed: room.users.length,
      user_reads_list: [email_address],
    });

    const email_addresses = DB.Room.getNotificationEmails(room);
    const notify_promise = Notify.Push.send({
      title: t("task_unshared"),
      body: t("task_was_unshared", { task_name: task.name }),
      email_address: email_addresses,
    });

    await Promise.all([create_promise, notify_promise]);
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

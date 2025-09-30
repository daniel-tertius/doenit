import type { RxCollection } from "rxdb";
import { Table } from "./_Table";
import { OnlineDB } from "$lib/OnlineDB";
import user from "$lib/core/user.svelte";

export class RoomTable extends Table<Room> {
  constructor(collection: RxCollection<Room>) {
    super(collection);
  }

  async getByUser(email: string): Promise<Room[]> {
    return this.getAll({
      selector: {
        users: {
          $in: [email],
        },
      },
    });
  }

  async implementChange(change: Changelog) {
    switch (change.type) {
      case "left_room":
        if (true) {
          const room = await this.get(change.room_id);
          if (!room) break;

          const created_email = change.user_reads_list[0];
          room.users = room.users.filter((u) => u.email !== created_email);
          if (room.users.length < 2) {
            await this.delete(room.id);
          } else {
            await this.update(room.id, room);
          }
          break;
        }
      case "invite_accepted":
        if (true) {
          const room = await this.get(change.room_id);
          if (!room) break;

          const created_email = change.user_reads_list[0];
          room.users = room.users.map((u) => (u.email === created_email ? { ...u, pending: false } : u));
          await this.update(room.id, room);
          break;
        }
      case "invite_declined":
        if (true) {
          const room = await this.get(change.room_id);
          if (!room) break;

          const created_email = change.user_reads_list[0];
          const users = room.users.filter((u) => u.email !== created_email);
          if (users.length < 2) {
            await this.delete(room.id);
          } else {
            await this.update(room.id, { ...room, users });
          }
          break;
        }
      default:
        // Ignore other change types
        break;
    }
  }

  async delete(ids: string[] | string) {
    try {
      if (!Array.isArray(ids)) ids = [ids];
      if (!ids.length) return;

      await super.delete(ids);

      const invites = await OnlineDB.Invite.getAll({
        filters: [{ field: "room_id", operator: "in", value: ids }],
      });

      for (const invite of invites) {
        invite.status = "cancelled";
        OnlineDB.Invite.update(invite.id, invite);
      }

      if (!user.value) return;

      await OnlineDB.Changelog.leaveRooms(ids, user.value.email);
    } catch (e) {
      alert(e.stack);
    }
  }

  async addUser(roomId: string, email: string): Promise<Room> {
    const room = await this.get(roomId);
    const user_emails = room.users.map((u) => u.email);
    if (!user_emails.includes(email)) {
      room.users.push({ email, pending: false });
      const updated = await this.update(roomId, room);
      if (!updated) throw new Error("Failed to update room");
      return updated;
    }
    return room;
  }

  async removeUser(roomId: string, email: string): Promise<Room> {
    const room = await this.get(roomId);
    room.users = room.users.filter((u) => u.email !== email);
    const updated = await this.update(roomId, room);
    if (!updated) throw new Error("Failed to update room");
    return updated;
  }
}

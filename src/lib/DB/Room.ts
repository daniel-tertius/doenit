import type { RxCollection } from "rxdb";
import { Table } from "./_Table";

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

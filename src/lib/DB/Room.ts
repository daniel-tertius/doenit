import type { RxCollection } from "rxdb";
import { Table } from "./_Table";

export type Room = {
  id: string;
  name: string;
  users: string[];
  created_at: string;
  archived: boolean;
};

export class RoomTable extends Table<Room> {
  constructor(collection: RxCollection<Room>) {
    super(collection);
  }

  async getByUser(email: string): Promise<Room[]> {
    return this.getAll({
      selector: {
        users: {
          $in: [email]
        }
      }
    });
  }

  async addUser(roomId: string, email: string): Promise<Room> {
    const room = await this.get(roomId);
    if (!room.users.includes(email)) {
      room.users.push(email);
      const updated = await this.update(roomId, room);
      if (!updated) throw new Error("Failed to update room");
      return updated;
    }
    return room;
  }

  async removeUser(roomId: string, email: string): Promise<Room> {
    const room = await this.get(roomId);
    room.users = room.users.filter((u: string) => u !== email);
    const updated = await this.update(roomId, room);
    if (!updated) throw new Error("Failed to update room");
    return updated;
  }
}

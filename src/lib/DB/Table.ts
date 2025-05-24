import type { Task, Category } from "$lib/DB/DB";
import { Preferences } from "@capacitor/preferences";

export class Table<T extends Task | Category> {
  private lock = Promise.resolve(); // Mutex for synchronization
  private table_name: string;

  constructor(table_name: string) {
    this.table_name = table_name;
    this.initialize();
  }

  get data(): Promise<T[]> {
    return new Promise(async (resolve) => {
      const items = await this.readAll();
      resolve(Object.values(items));
    });
  }

  async initialize(): Promise<void> {
    if (typeof window === "undefined") {
      throw Error("Storage is not available in this environment");
    }

    try {
      const { value } = await Preferences.get({ key: this.table_name });
      if (value) return;

      await Preferences.set({
        key: this.table_name,
        value: JSON.stringify({}),
      });
    } catch (error) {
      console.error("Failed to initialize storage:", error);
    }
  }

  async readAll(): Promise<Record<string, T>> {
    try {
      const { value } = await Preferences.get({ key: this.table_name });
      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.error("Failed to read data:", error);
      return {};
    }
  }

  private generateUUID(all_data: Record<string, T>): string {
    const new_id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      // Correct UUID format
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return all_data[new_id] ? this.generateUUID(all_data) : new_id;
  }

  async create(item: Omit<T, "id" | "created_at" | "archived">): Promise<T> {
    if (!item) throw new Error("Item is required");

    const data = await this.readAll();
    const new_item = { ...item, created_at: new Date().toString(), id: this.generateUUID(data) } as T;
    data[new_item.id] = new_item;

    try {
      await Preferences.set({
        key: this.table_name,
        value: JSON.stringify(data, null, 2),
      });
      return new_item;
    } catch (error) {
      throw new Error(`Failed to write to storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async read(id: string): Promise<T | undefined> {
    if (typeof window === "undefined") return undefined;

    const data = await this.readAll();
    return data[id];
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const data = await this.readAll();
    if (!data[id]) throw new Error(`Item with id ${id} not found`);

    data[id] = { ...data[id], ...updates };

    await Preferences.set({
      key: this.table_name,
      value: JSON.stringify(data, null, 2),
    });

    return data[id];
  }

  async delete(id: string | string[]): Promise<void> {
    if (typeof window === "undefined") return;

    const data = await this.readAll();

    let ids = Array.isArray(id) ? id : [id];
    let ids_not_there = ids.filter((id) => !data[id]);
    console.log("ids_not_there", ids_not_there);
    if (!!ids_not_there.length) {
      console.error(`Item(s) with id(s) ${ids_not_there.join(", ")} not found`);
      return;
    }

    ids.forEach((id) => delete data[id]);

    await Preferences.set({
      key: this.table_name,
      value: JSON.stringify(data, null, 2),
    });
  }

  async archive(id: string): Promise<void> {
    if (typeof window === "undefined") return;

    const data = await this.readAll();
    if (!data[id]) console.error(`Item with id ${id} not found`);

    data[id].archived = true;

    await Preferences.set({
      key: this.table_name,
      value: JSON.stringify(data, null, 2),
    });
  }

  async unarchive(id: string): Promise<void> {
    if (typeof window === "undefined") return;

    const data = await this.readAll();
    if (!data[id]) console.error(`Item with id ${id} not found`);

    data[id].archived = false;

    await Preferences.set({
      key: this.table_name,
      value: JSON.stringify(data, null, 2),
    });
  }
}

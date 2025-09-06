import type { MangoQuery, RxCollection } from "rxdb";

export class Table<T extends Task | Category | Room> {
  collection: RxCollection<T>;

  constructor(collection: RxCollection<T>) {
    this.collection = collection;
  }

  async create(item: Omit<T, "id" | "created_at" | "archived" | "updated_at">): Promise<T> {
    if (!item) throw new Error("Item is required");

    const new_item = {
      ...item,
      archived: false,
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      id: crypto.randomUUID(),
    } as T;

    return this.collection.insert(new_item);
  }

  async createMany(items: Omit<T, "id" | "created_at" | "archived" | "updated_at">[]): Promise<{ success: T[] }> {
    if (!items || !items.length) throw new Error("Items are required");

    const created_at = new Date().toString();
    const updated_at = new Date().toString();
    const new_items = items.map((item) => ({ ...item, created_at, updated_at, id: crypto.randomUUID() }) as T);

    return this.collection.bulkInsert(new_items);
  }

  async getAll(filter: MangoQuery<T> = {}): Promise<T[]> {
    const docs = await this.collection.find(filter).exec();

    return docs.map((d) => d.toJSON() as T);
  }

  async get(id: string): Promise<T> {
    if (typeof id !== "string") throw new Error(`Cannot fetch ${this.collection.name} with id: ${id}`);

    const doc = await this.collection.findOne(id).exec();
    if (!doc) throw new Error(`${this.collection.name} with id ${id} not found`);

    return doc.toJSON() as T;
  }

  async getOne(filter: MangoQuery<T> = {}): Promise<T> {
    const doc = await this.collection.findOne(filter).exec();
    if (!doc) throw new Error(`${this.collection.name} not found`);

    return doc.toJSON() as T;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const doc = await this.collection.findOne(id).exec();
    if (!doc) throw new Error(`${this.collection.name} with id ${id} not found`);

    updates.updated_at = new Date().toString();

    await doc.patch(updates);
    return doc.toJSON() as T;
  }

  async delete(id: string | string[]): Promise<void> {
    const ids = Array.isArray(id) ? id : [id];
    await this.collection.find({ selector: { id: { $in: ids } } }).remove();
  }

  async archive(id: string): Promise<void> {
    const doc = await this.collection.findOne(id).exec();
    if (doc) await doc.patch({ archived: true, updated_at: new Date().toString() } as Partial<T>);
  }

  async unarchive(id: string): Promise<void> {
    const doc = await this.collection.findOne(id).exec();
    if (doc) await doc.patch({ archived: false, updated_at: new Date().toString() } as Partial<T>);
  }

  async overwriteMany(items: T[]): Promise<{ success: T[]; error: any[] }> {
    if (!items || !items.length) throw new Error("Items are required");

    return this.collection.bulkUpsert(items);
  }

  /**
   * Remove all data from the collection (use with caution)
   */
  async clear() {
    const docs = await this.collection.find().exec();
    await this.collection.bulkRemove(docs.map(({ id }) => id));
  }

  subscribe(callback: (p0: T[]) => any, filter: MangoQuery<T> = {}) {
    return this.collection.find(filter).$.subscribe((docs) => {
      const jsonDocs = docs.map((d) => d.toJSON() as T);
      callback(jsonDocs);
    });
  }
}

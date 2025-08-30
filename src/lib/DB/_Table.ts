import type { MangoQuery, RxCollection } from "rxdb";

export class Table<T extends Task | Category> {
  collection: RxCollection<T>;

  constructor(collection: RxCollection<T>) {
    this.collection = collection;
  }

  async create(item: Omit<T, "id" | "created_at" | "archived">): Promise<T> {
    if (!item) throw new Error("Item is required");

    const new_item = {
      ...item,
      archived: false,
      created_at: new Date().toString(),
      id: crypto.randomUUID(),
    } as T;

    return this.collection.insert(new_item);
  }

  async createMany(items: Omit<T, "id" | "created_at" | "archived">[]): Promise<{ success: T[] }> {
    if (!items || !items.length) throw new Error("Items are required");

    const created_at = new Date().toString();
    const new_items = items.map((item) => ({ ...item, created_at, id: crypto.randomUUID() }) as T);

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

    await doc.patch(updates);
    return doc.toJSON() as T;
  }

  async delete(id: string | string[]): Promise<void> {
    const ids = Array.isArray(id) ? id : [id];
    await this.collection.find({ selector: { id: { $in: ids } } }).remove();
  }

  async archive(id: string): Promise<void> {
    const doc = await this.collection.findOne(id).exec();
    if (doc) await doc.patch({ archived: true } as Partial<T>);
  }

  async unarchive(id: string): Promise<void> {
    const doc = await this.collection.findOne(id).exec();
    if (doc) await doc.patch({ archived: false } as Partial<T>);
  }

  subscribe(callback: (p0: T[]) => any, filter: MangoQuery<T> = {}) {
    return this.collection.find(filter).$.subscribe((docs) => {
      const jsonDocs = docs.map((d) => d.toJSON() as T);
      callback(jsonDocs);
    });
  }
}

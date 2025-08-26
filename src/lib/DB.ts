import { createRxDatabase, type RxDatabase } from "rxdb";
import type { MangoQuery, RxCollection } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

export const CATEGORY_SCHEMA = {
  title: "category",
  version: 0,
  description: "describes a category",
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    is_default: { type: "boolean" },
    archived: { type: "boolean" },
    created_at: { type: "string" },
  },
  required: ["id", "name", "archived", "created_at"],
  primaryKey: "id",
};

export const TASK_SCHEMA = {
  title: "task",
  version: 0,
  description: "describes a task",
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    completed: { type: "number" },
    completed_at: { type: ["string", "null"] },
    due_date: { type: ["string", "null"] },
    start_date: { type: ["string", "null"] },
    repeat_interval: { type: "string" },
    repeat_specific_days: { type: "array", items: { type: "number" } },
    repeat_interval_number: { type: "number" },
    important: { type: "boolean" },
    urgent: { type: "boolean" },
    category_id: { type: "string" },
    archived: { type: "boolean" },
    created_at: { type: "string" },
  },
  required: ["id", "name", "archived", "created_at"],
  primaryKey: "id",
};

async function initDB() {
  const DB = await createRxDatabase({
    name: "doenitDb",
    storage: getRxStorageDexie({
      allowEmptyDB: true,
    }),
    multiInstance: false,
  });

  await DB.addCollections({
    Task: {
      schema: {
        title: "task",
        version: 0,
        description: "describes a task",
        type: "object",
        properties: {
          id: {
            type: "string",
            maxLength: 50,
          },
          name: { type: "string" },
          description: { type: "string" },
          completed: { type: "number" },
          completed_at: { type: ["string", "null"] },
          due_date: { type: ["string", "null"] },
          start_date: { type: ["string", "null"] },
          repeat_interval: { type: "string" },
          repeat_specific_days: { type: "array", items: { type: "number" } },
          repeat_interval_number: { type: "number" },
          important: { type: "boolean" },
          urgent: { type: "boolean" },
          category_id: { type: "string" },
          archived: { type: "boolean" },
          created_at: { type: "string" },
        },
        required: ["id", "name", "archived", "created_at"],
        primaryKey: "id",
      },
    },
    Category: {
      schema: {
        title: "category",
        version: 0,
        description: "describes a category",
        type: "object",
        properties: {
          id: {
            type: "string",
            maxLength: 50,
          },
          name: { type: "string" },
          is_default: { type: "boolean" },
          archived: { type: "boolean" },
          created_at: { type: "string" },
        },
        required: ["id", "name", "archived", "created_at"],
        primaryKey: "id",
      },
    },
  });

  return DB;
}

class DBClass {
  readonly Task: Table<Task>;
  readonly Category: Table<Category>;
  constructor(db: RxDatabase) {
    this.Task = new Table<Task>(db.collections.Task);
    this.Category = new Table<Category>(db.collections.Category);
  }
}

class Table<T extends Task | Category> {
  collection: RxCollection<T>;

  constructor(collection: RxCollection<T>) {
    this.collection = collection;
  }

  async create(item: Omit<T, "id" | "created_at" | "archived">): Promise<T> {
    if (!item) throw new Error("Item is required");

    const new_item = {
      ...item,
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

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const doc = await this.collection.findOne(id).exec();
    if (!doc) throw new Error(`${this.collection.name} with id ${id} not found`);

    await doc.patch(updates);
    return doc.toJSON() as T;
  }

  async delete(id: string | string[]): Promise<void> {
    const ids = Array.isArray(id) ? id : [id];
    for (const _id of ids) {
      const doc = await this.collection.findOne(_id).exec();
      if (doc) await doc.remove();
    }
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

export const DB = new DBClass(await initDB());

import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { TaskTable } from "./DB/Task";
import { CategoryTable } from "./DB/Category";

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
  #Task: TaskTable | undefined;
  #Category: CategoryTable | undefined;

  async init() {
    const db = await initDB();
    this.#Task = new TaskTable(db.collections.Task);
    this.#Category = new CategoryTable(db.collections.Category);
  }

  get Task(): TaskTable {
    if (!this.#Task) throw new Error("Task table not initialized");
    return this.#Task;
  }

  get Category(): CategoryTable {
    if (!this.#Category) throw new Error("Category table not initialized");
    return this.#Category;
  }
}

export const DB = new DBClass();

import { RxDBMigrationSchemaPlugin } from "rxdb/plugins/migration-schema";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { addRxPlugin, createRxDatabase } from "rxdb";
import { CategoryTable } from "./DB/Category";
import { TaskTable } from "./DB/Task";
import { RoomTable } from "./DB/Room";

async function initDB() {
  addRxPlugin(RxDBMigrationSchemaPlugin);

  const DB = await createRxDatabase({
    name: "doenitDb",
    storage: getRxStorageDexie({
      allowEmptyDB: true,
    }),
    multiInstance: false,
  });

  await DB.addCollections({
    Task: {
      migrationStrategies: {
        1: (oldData) => {
          // Migrate from version 0 to 1
          return oldData;
        }
      },
      schema: {
        title: "task",
        version: 1,
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
          room_id: { type: ["string", "null"] },
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
    Room: {
      schema: {
        title: "room",
        version: 0,
        description: "describes a room for shared tasks",
        type: "object",
        properties: {
          id: {
            type: "string",
            maxLength: 50,
          },
          name: { type: "string" },
          users: { type: "array", items: { type: "string" } },
          archived: { type: "boolean" },
          created_at: { type: "string" },
        },
        required: ["id", "name", "users", "archived", "created_at"],
        primaryKey: "id",
      },
    },
  });

  return DB;
}

class DBClass {
  #Task: TaskTable | undefined;
  #Category: CategoryTable | undefined;
  #Room: RoomTable | undefined;

  async init() {
    if (!!this.#Task && !!this.#Category && !!this.#Room) return;

    const db = await initDB();
    this.#Task = new TaskTable(db.collections.Task);
    this.#Category = new CategoryTable(db.collections.Category);
    this.#Room = new RoomTable(db.collections.Room);
  }

  get Task(): TaskTable {
    if (!this.#Task) throw new Error("Task table not initialized");
    return this.#Task;
  }

  get Category(): CategoryTable {
    if (!this.#Category) throw new Error("Category table not initialized");
    return this.#Category;
  }

  get Room(): RoomTable {
    if (!this.#Room) throw new Error("Room table not initialized");
    return this.#Room;
  }
}

export const DB = new DBClass();

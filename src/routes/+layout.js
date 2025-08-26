import { DB as old_DB } from "$lib/DB_old/DB";
import { DB } from "$lib/DB";

export const ssr = false;

export async function load() {
  // await migratePreferenceToRxDB();
}

async function migratePreferenceToRxDB() {
  const db = old_DB.getInstance();
  const tasks_obj = await db.Task.readAll();
  const tasks = Object.values(tasks_obj);

  await DB.Task.createMany(tasks);

  const categories_obj = await db.Category.readAll();
  const categories = Object.values(categories_obj);

  await DB.Category.createMany(categories);
}

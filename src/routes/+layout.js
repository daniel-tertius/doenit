import { DB as old_DB } from "$lib/DB_old/DB";
import { DB } from "$lib/DB";

export const ssr = false;

export async function load() {
  await DB.init();

  await migratePreferenceToRxDB();
}

async function migratePreferenceToRxDB() {
  const db = old_DB.getInstance();
  const tasks_obj = await db.Task.readAll();
  if (tasks_obj) {
    const tasks = Object.values(tasks_obj);
    await DB.Task.createMany(tasks);
    await db.Task.destroy();
  }

  const categories_obj = await db.Category.readAll();
  if (categories_obj) {
    const categories = Object.values(categories_obj);
    await DB.Category.createMany(categories);
    await db.Category.destroy();
  }
}

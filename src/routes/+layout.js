import { notifications } from "$lib/services/notification.svelte";
import { SplashScreen } from "@capacitor/splash-screen";
import { DB as old_DB } from "$lib/DB_old/DB";
import { DB } from "$lib/DB";
import { theme } from "$lib/services/theme.svelte";
import { text } from "$lib/services/text.svelte";
import Backup from "$lib/services/backup.svelte";
import { auth } from "$lib/services/auth.svelte";

export const ssr = false;

export async function load() {
  try {
    SplashScreen.show({
      autoHide: true,
      showDuration: 1000,
    });

    await DB.init();
    await migratePreferenceToRxDB();

    auth.init().then(() => {
      Backup.init();
    });
    theme.init();
    text.init();
    notifications.init();
  } catch (error) {
    console.error("Initialization error:", error);
    notifications.send("Failed", "Failed to initialize the app. Please try again.");
  }
}

async function migratePreferenceToRxDB() {
  const db = old_DB.getInstance();
  const categories_obj = await db.Category.readAll();
  if (categories_obj) {
    const categories = Object.values(categories_obj);
    await DB.Category.createMany(categories);
    await db.Category.destroy();
  }

  const tasks_obj = await db.Task.readAll();
  if (tasks_obj) {
    const tasks = Object.values(tasks_obj);
    await DB.Task.createMany(tasks);
    await db.Task.destroy();
  }
}

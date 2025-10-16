import { notifications } from "$lib/services/notification.svelte";
import { theme } from "$lib/services/theme.svelte";
import { text } from "$lib/services/text.svelte";
import { RateApp } from "$lib/services/rateApp";
import { Alert } from "$lib/core/alert";
import { DB } from "$lib/DB";

// Keep this
import { Cached } from "$lib/core/cache.svelte";

export const ssr = false;

export async function load() {
  try {
    await DB.init();

    RateApp.checkDailyUsage();
    theme.init();
    text.init();
    notifications.init();
  } catch (error) {
    const error_message = error instanceof Error ? error.message : String(error);
    Alert.error("Fout met inisialisering van die toepassing. Probeer asseblief weer: " + error_message);
  }
}

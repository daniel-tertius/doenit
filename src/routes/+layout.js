import { notifications } from "$lib/services/notification.svelte";
import { SplashScreen } from "@capacitor/splash-screen";
import { text } from "$lib/services/text.svelte";
import { theme } from "$lib/services/theme.svelte";
import { Alert } from "$lib/core/alert";
import { DB } from "$lib/DB";

// Keep this
import { Cached } from "$lib/core/cache.svelte";

export const ssr = false;

export async function load() {
  try {
    SplashScreen.show({
      autoHide: true,
      showDuration: 1000,
    });

    await DB.init();

    theme.init();
    text.init();
    notifications.init();
  } catch (error) {
    const error_message = error instanceof Error ? error.message : String(error);
    Alert.error("Fout met inisialisering van die toepassing. Probeer asseblief weer: " + error_message);
  }
}

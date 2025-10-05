import { notifications } from "$lib/services/notification.svelte";
import { SplashScreen } from "@capacitor/splash-screen";
import { text } from "$lib/services/text.svelte";
import { theme } from "$lib/services/theme.svelte";
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
    console.error("Initialization error:", error);
    notifications.send("Failed", "Failed to initialize the app. Please try again.");
  }
}

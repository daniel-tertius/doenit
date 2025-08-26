<script>
  import { notifications, theme } from "$lib/services";
  import { Capacitor } from "@capacitor/core";
  import Heading from "./Heading.svelte";
  import { goto } from "$app/navigation";
  import Footer from "./Footer.svelte";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import "../app.css";

  let { children, data } = $props();

  const is_home = $derived(page.url.pathname === "/");

  onMount(() => {
    notifications.init();
  });

  onMount(() => {
    // Re-schedule when app comes to foreground
    if (Capacitor.isNativePlatform()) {
      App.addListener("appStateChange", (state) => {
        if (state.isActive) {
          // Re-schedule when app becomes active to ensure continuity
          notifications.scheduleNotifications();
        }
      });
    }
  });

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        if (is_home) {
          App.exitApp();
        } else {
          goto("/", { invalidateAll: false });
        }
      });
    }
  });
</script>

<div
  data-theme={theme.value}
  class="h-dvh flex flex-col bg-t-primary-400 text-t-secondary **:select-none **:transition-all **:duration-300"
>
  <Heading />

  <main class="max-w-[1000px] w-full md:mx-auto grow overflow-y-auto p-2 bg-t-primary-400">
    {@render children()}
  </main>

  <Footer />
</div>

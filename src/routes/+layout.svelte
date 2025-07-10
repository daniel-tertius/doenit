<script>
  import { notifications } from "$lib/services";
  import { Capacitor } from "@capacitor/core";
  import Heading from "./Heading.svelte";
  import { goto } from "$app/navigation";
  import Footer from "./Footer.svelte";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import "../app.css";

  let { children } = $props();

  const is_home = $derived(page.url.pathname === "/");

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        if (is_home) {
          App.exitApp();
        } else {
          goto("/");
        }
      });
    }

    return () => {
      App.removeAllListeners();
    };
  });

  onMount(async () => {
    // Re-schedule when app comes to foreground
    if (Capacitor.isNativePlatform()) {
      App.addListener("appStateChange", async (state) => {
        if (state.isActive) {
          // Re-schedule when app becomes active to ensure continuity
          await notifications.refreshNotification();
        }
      });
    }
  });
</script>

<div class="h-dvh flex flex-col bg-t-primary-400 text-t-secondary **:select-none">
  <Heading />

  <main class="max-w-[1000px] w-full md:mx-auto grow overflow-y-auto p-2 bg-t-primary-400">
    {@render children()}
  </main>

  <Footer />
</div>

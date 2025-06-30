<script>
  import CreateItemButton from "$lib/components/CreateItemButton.svelte";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import NavbarButton from "$lib/components/NavbarButton.svelte";
  import PageHeading from "$lib/components/PageHeading.svelte";
  import HomeButton from "$lib/components/HomeButton.svelte";
  import { Capacitor } from "@capacitor/core";
  import { goto } from "$app/navigation";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import "../app.css";

  /* INIT CACHE */
  import { theme, notifications } from "$lib/services";

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

<div
  class="h-dvh flex flex-col bg-t-primary-400 text-t-secondary"
  style="padding-bottom: env(safe-area-inset-bottom, 0px);"
>
  <PageHeading />

  <main class="max-w-[1000px] w-full md:mx-auto grow overflow-y-auto p-2 bg-t-primary-400">
    {@render children()}
  </main>

  <nav class="flex gap-2 p-4 border-t border-border bg-t-primary justify-between">
    <NavbarButton />

    {#if is_home}
      <CategoryFilter />
    {/if}

    <CreateItemButton />
    <HomeButton />
  </nav>
</div>

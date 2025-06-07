<script>
  import CreateItemButton from "$lib/components/CreateItemButton.svelte";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import NavbarButton from "$lib/components/NavbarButton.svelte";
  import PageHeading from "$lib/components/PageHeading.svelte";
  import HomeButton from "$lib/components/HomeButton.svelte";
  import { Capacitor } from "@capacitor/core";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import "../app.css";
  // import { NotificationService } from "$lib/NotificationService";

  let { children } = $props();

  const is_home = $derived(page.url.pathname === "/");

  let platform = $state("Unknown");

  $effect(() => {
    if (browser) {
      const userAgent = navigator.userAgent;
      platform = userAgent;
    }
  });

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

  // onMount(async () => {
  //   // Schedule notifications when app starts
  //   await notificationService.scheduleDailyTask();

  //   // Re-schedule when app comes to foreground
  //   if (Capacitor.isNativePlatform()) {
  //     App.addListener("appStateChange", async (state) => {
  //       if (state.isActive) {
  //         // Re-schedule when app becomes active to ensure continuity
  //         await notificationService.scheduleDailyTask();
  //       }
  //     });
  //   }
  // });

  // const notificationService = new NotificationService();

  // onMount(async () => {
  //   // Schedule the daily notification when app starts
  //   await notificationService.scheduleDailyTask();
  // });

  // async function toggleNotifications() {
  //   // You can add buttons to enable/disable notifications
  //   await notificationService.scheduleDailyTask();
  // }

  // async function cancelNotifications() {
  //   await notificationService.cancelDailyTask();
  // }
</script>

<PageHeading />
<!-- NOTIFICATIONS COMING SOON -->
<!-- <div class="flex gap-1">
  <button type="button" onclick={toggleNotifications}>Enable Daily Reminders</button>
  <button type="button" onclick={cancelNotifications}>Disable Daily Reminders</button>
</div> -->
<main class="grow flex flex-col overflow-y-auto max-w-[1000px] w-full md:mx-auto p-2">
  {@render children()}
</main>

<nav class="flex gap-2 shadow-sm text-tertiary p-4 border-t border-tertiary bg-primary justify-between">
  <NavbarButton />

  {#if is_home}
    <CategoryFilter />
  {/if}

  <CreateItemButton />
  <HomeButton />
</nav>

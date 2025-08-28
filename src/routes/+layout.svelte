<script>
  import { notifications } from "$lib/services/notification.svelte";
  import { theme } from "$lib/services/theme.svelte";
  import { Widget } from "$lib/services/widget";
  import { Capacitor } from "@capacitor/core";
  import Heading from "./Heading.svelte";
  import { goto } from "$app/navigation";
  import Footer from "./Footer.svelte";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";
  import "../app.css";

  let { children } = $props();

  const is_home = $derived(page.url.pathname === "/");

  onMount(() => {
    const sub = DB.Task.subscribe((tasks) => handleTasksUpdate(tasks), {
      selector: { archived: { $ne: true } },
    });

    return () => sub.unsubscribe();
  });

  onMount(() => {
    if (!Capacitor.isNativePlatform()) return;

    App.addListener("backButton", (event) => {
      if (is_home) {
        App.exitApp();
      } else {
        goto("/", { invalidateAll: false });
      }
    });
  });

  /**
   * @param {Task[]} tasks
   */
  function handleTasksUpdate(tasks) {
    notifications.scheduleNotifications(tasks);
    Widget.updateWidget(tasks);
  }
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

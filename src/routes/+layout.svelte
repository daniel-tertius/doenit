<script>
  import { pushNotificationService } from "$lib/services/pushNotifications.svelte";
  import { notifications } from "$lib/services/notification.svelte";
  import { inviteService } from "$lib/services/invites.svelte";
  import { SplashScreen } from "@capacitor/splash-screen";
  import { onDestroy, onMount, setContext, untrack } from "svelte";
  import Backup from "$lib/services/backup.svelte";
  import { Widget } from "$lib/services/widget";
  import user from "$lib/core/user.svelte";
  import { OnlineDB } from "$lib/OnlineDB";
  import Heading from "./Heading.svelte";
  import { goto } from "$app/navigation";
  import Footer from "./Footer.svelte";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { DB } from "$lib/DB";
  import "../app.css";
  import { Value } from "$lib/utils.svelte";
  import { cached_rate_us_setting } from "$lib/cached";
  import { Cached } from "$lib/core/cache.svelte";

  let { children } = $props();

  /** @type {string[]} */
  let room_ids = $state([]);
  const search_text = new Value("");

  setContext("search_text", search_text);

  /** @type {import('firebase/auth').Unsubscribe?} */
  let unsubscribeChangelog = null;
  /** @type {import('firebase/auth').Unsubscribe?} */
  let unsubscribeInvites = null;

  $effect(() => {
    if (!user.value) return;

    untrack(async () => {
      Backup.init();
      await pushNotificationService.init();
    });
  });

  $effect(() => {
    if (!user.value) return;
    if (!room_ids.length) return;

    // Clean up existing subscription before creating a new one
    if (unsubscribeChangelog) unsubscribeChangelog();
    unsubscribeChangelog = OnlineDB.Changelog.subscribe(consumeChangelog, {
      filters: [
        { field: "archived", operator: "==", value: false },
        { field: "room_id", operator: "in", value: room_ids },
      ],
      sort: [{ field: "created_at", direction: "desc" }],
    });
  });

  $effect(() => {
    if (!user.value) return;

    untrack(() => {
      if (!user.value) return;

      if (unsubscribeInvites) unsubscribeInvites();
      unsubscribeInvites = OnlineDB.Invite.subscribe((i) => inviteService.handleNewInvites(i), {
        filters: [
          { field: "status", operator: "==", value: "pending" },
          { field: "recipient_email_address", operator: "==", value: user.value.email },
        ],
        sort: [{ field: "created_at", direction: "desc" }],
      });
    });
  });

  onMount(() => {
    const sub = DB.Room.subscribe((rooms) => {
      room_ids = rooms.map((r) => r.id);
    });

    return () => sub.unsubscribe();
  });

  onMount(() => {
    const sub = DB.Task.subscribe(handleTasksUpdate, { selector: { archived: { $ne: true } } });
    return () => sub.unsubscribe();
  });

  onMount(() => {
    SplashScreen.hide();

    App.addListener("backButton", (event) => {
      if (page.url.pathname === "/") {
        App.exitApp();
      } else {
        goto("/", { invalidateAll: false });
      }
    });

    // Listen for task completion events from native side
    window.addEventListener("taskCompleted", async (event) => {
      console.log("[💬 Doenit] Task completed event received");
      Widget.finishTasks(event.detail.task_ids);
    });
  });

  onDestroy(() => {
    unsubscribeChangelog?.();
    unsubscribeInvites?.();
  });

  /**
   * @param {Task[]} tasks
   */
  async function handleTasksUpdate(tasks) {
    await notifications.scheduleNotifications(tasks);
    await Widget.updateWidget(tasks);
  }

  /**
   * @param {Changelog[]} changes
   */
  async function consumeChangelog(changes) {
    try {
      if (!changes.length) return;

      if (!user.value) return;

      for (const change of changes) {
        if (!room_ids.includes(change.room_id)) continue;
        if (change.user_reads_list.includes(user.value.email)) continue;

        await DB.Task.implementChange(change);
        await DB.Room.implementChange(change);

        if (change.user_reads_list.length >= change.total_reads_needed) {
          await OnlineDB.Changelog.delete(change.id);
        } else {
          await OnlineDB.Changelog.incrementUserReads(change.id, user.value.email);
        }
      }
    } catch (error) {
      console.error("❌ Error processing changelog changes:", error);
      alert("Error processing changelog changes: " + error);
    }
  }
</script>

<div class="text-md h-dvh relative flex flex-col text-normal bg-page **:select-none **:transition-all **:duration-300">
  <Heading />

  <main class="max-w-[1000px] overflow-x-hidden w-full md:mx-auto grow overflow-y-auto p-2">
    <!-- {JSON.stringify(Cached.rateUs.value, null, 2)}
    <button
      type="button"
      class="px-2 py-1"
      onclick={() => {
        if (Cached.rateUs.value) {
          Cached.rateUs.value.last_dismissed_date = null;
          Cached.rateUs.value.task_completions = 0;
        }
      }}
    >
      Clear
    </button> -->
    {@render children()}
  </main>

  <Footer />
</div>

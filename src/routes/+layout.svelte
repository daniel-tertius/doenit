<script>
  import { pushNotificationService } from "$lib/services/pushNotifications.svelte";
  import { notifications } from "$lib/services/notification.svelte";
  import { onDestroy, onMount, setContext, untrack } from "svelte";
  import { inviteService } from "$lib/services/invites.svelte";
  import { SplashScreen } from "@capacitor/splash-screen";
  import { Photos } from "$lib/services/photos.svelte";
  import Backup from "$lib/services/backup.svelte";
  import { Widget } from "$lib/services/widget";
  import { Value } from "$lib/utils.svelte";
  import user from "$lib/core/user.svelte";
  import { OnlineDB } from "$lib/OnlineDB";
  import { Alert } from "$lib/core/alert";
  import Heading from "./Heading.svelte";
  import { goto } from "$app/navigation";
  import Footer from "./Footer.svelte";
  import { App } from "@capacitor/app";
  import { DB } from "$lib/DB";
  import "../app.css";
  import { CAT_FILTER_KEY } from "$lib";
  import { page } from "$app/state";
  import { Selected } from "$lib/selected";

  let { children } = $props();

  /** @type {string[]} */
  let room_ids = $state([]);

  const is_cat_filter_showing = new Value(false);
  setContext(CAT_FILTER_KEY, is_cat_filter_showing);

  const search_text = new Value("");
  setContext("search_text", search_text);

  /** @type {FirebaseUnsubscribe?} */
  let unsubscribeChangelog = null;
  /** @type {FirebaseUnsubscribe?} */
  let unsubscribeInvites = null;

  $effect(() => {
    if (!user.value?.is_backup_enabled) return;

    untrack(async () => {
      Backup.init();
    });
  });

  $effect(() => {
    if (unsubscribeChangelog) unsubscribeChangelog();
    if (!user.value?.is_friends_enabled) return;
    if (!room_ids.length) return;

    untrack(async () => {
      await pushNotificationService.init();
    });

    // Clean up existing subscription before creating a new one
    unsubscribeChangelog = OnlineDB.Changelog.subscribe(consumeChangelog, {
      filters: [
        { field: "archived", operator: "==", value: false },
        { field: "room_id", operator: "in", value: room_ids },
      ],
      sort: [{ field: "created_at", direction: "desc" }],
    });
  });

  $effect(() => {
    if (!user.value?.is_friends_enabled) return;

    /** @param {Invite[]} invites */
    const handleInvites = (invites) => untrack(() => inviteService.handleNewInvites(invites));

    if (unsubscribeInvites) unsubscribeInvites();
    unsubscribeInvites = OnlineDB.Invite.subscribe(handleInvites, {
      filters: [
        { field: "status", operator: "==", value: "pending" },
        { field: "recipient_email_address", operator: "==", value: user.value.email },
      ],
      sort: [{ field: "created_at", direction: "desc" }],
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
    cleanupOrphanedPhotos();
  });

  onMount(() => {
    SplashScreen.hide();

    App.addListener("backButton", () => {
      if (is_cat_filter_showing.value) {
        is_cat_filter_showing.value = false;
      } else if (Selected.tasks.size) {
        Selected.tasks.clear();
      } else if (page.url.pathname !== "/") {
        goto("/");
      } else {
        App.exitApp();
      }
    });

    // Listen for task completion events from native side
    window.addEventListener("taskCompleted", async (event) => {
      console.log("[💬 Doenit] Task completed event received");
      Widget.finishTasks(event.detail.task_ids);
    });
  });

  onDestroy(() => {
    if (unsubscribeChangelog) unsubscribeChangelog();
    if (unsubscribeInvites) unsubscribeInvites();
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
      const error_message = error instanceof Error ? error.message : String(error);
      Alert.error(`Fout met verwerking van changelog veranderinge: ${error_message}`);
    }
  }

  /**
   * Cleanup orphaned photos (photos not referenced by any task)
   */
  async function cleanupOrphanedPhotos() {
    if (!Photos.PHOTOS_ENABLED) return;

    try {
      const tasks = await DB.Task.getAll();
      const photo_ids = tasks.flatMap((task) => task.photo_ids || []).filter(Boolean);

      await Photos.cleanupOrphanedPhotos(photo_ids);
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      Alert.error(`Fout tydens wees-foto skoonmaak: ${error_message}`);
    }
  }
</script>

<div class="text-md h-dvh relative flex flex-col text-normal bg-page **:select-none **:transition-all **:duration-300">
  <Heading />

  <main class="max-w-[1000px] overflow-x-hidden w-full md:mx-auto grow overflow-y-auto p-2">
    {@render children()}
  </main>

  <Footer />
</div>

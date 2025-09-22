<script>
  import { t } from "$lib/services/language.svelte";
  import { fade } from "svelte/transition";
  import { Selected } from "$lib/selected";
  import Modal from "./modal/Modal.svelte";
  import { Trash } from "$lib/icon";
  import { page } from "$app/state";
  import { untrack } from "svelte";
  import { DB } from "$lib/DB";
  import { OnlineDB } from "$lib/OnlineDB";
  import { auth } from "$lib/services/auth.svelte";
  import { normalize } from "$lib";

  let is_deleting = $state(false);

  const page_route = $derived(page.route.id);

  $effect(() => {
    page_route;

    untrack(() => {
      Selected.tasks.clear();
    });
  });

  function deleteAll() {
    const ids = [...Selected.tasks.values()];
    Selected.tasks.clear();

    DB.Task.delete(ids);

    updateChangelog(ids);

    is_deleting = false;
  }

  /**
   * @param {string[]} ids
   */
  async function updateChangelog(ids) {
    const user = auth.getUser();
    if (!user || !user.email) return;
    const user_email = normalize(user.email);

    const tasks = await DB.Task.getAll({ selector: { id: { $in: ids } } });
    /** @type {string[]} */
    const room_ids = [];

    for (const task of tasks) {
      if (task.room_id && !room_ids.includes(task.room_id)) {
        room_ids.push(task.room_id);
      }
    }
    if (!room_ids.length) return;

    const rooms = await DB.Room.getAll({ selector: { id: { $in: room_ids } } });
    if (!rooms.length) return;

    for (const task of tasks) {
      if (!task.room_id) continue;

      const room = rooms.find((r) => r.id === task.room_id);
      if (!room) continue;

      await OnlineDB.Changelog.create({
        type: "delete",
        task_id: task.id,
        room_id: task.room_id || "",
        total_reads_needed: room.users.length,
        user_reads_list: [user_email],
        user_id: user.uid,
      });
    }
  }
</script>

<div class="h-full aspect-square flex items-end justify-between top-1">
  <!-- TODO Translation -->
  {#if Selected.tasks.size}
    <button
      transition:fade
      aria-label="Delete tasks label"
      class="aspect-square bg-error text-alt h-full rounded-md w-fit max-h-12 my-auto"
      onclick={() => (is_deleting = true)}
      type="button"
    >
      <Trash class="text-xl m-auto" />
    </button>
  {/if}
</div>

<Modal bind:is_open={is_deleting} onclose={() => (is_deleting = false)} class="space-y-4">
  <h2 class="font-bold text-lg">{t("delete")}</h2>
  <p>
    {Selected.tasks.size > 1 ? t("delete_confirmation_multiple") : t("delete_confirmation_single")}
  </p>
  <button
    class="bg-error flex gap-1 items-center text-alt ml-auto px-4 py-2 rounded-md"
    type="button"
    onclick={deleteAll}
  >
    <Trash class="h-full" size={18} />
    <span>{t("delete")}</span>
  </button>
</Modal>

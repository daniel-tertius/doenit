<script>
  import { t } from "$lib/services/language.svelte";
  import { fade } from "svelte/transition";
  import { Selected } from "$lib/selected";
  import Modal from "./modal/Modal.svelte";
  import { Trash } from "$lib/icon";
  import { DB } from "$lib/DB";
  import { OnlineDB } from "$lib/OnlineDB";
  import user from "$lib/core/user.svelte";
  import { onNavigate } from "$app/navigation";
  import { page } from "$app/state";

  let is_deleting = $state(false);

  const is_completed_page = $derived(page.url.pathname === "/complete");

  onNavigate(() => {
    Selected.tasks.clear();
  });

  async function deleteAll() {
    const ids = [...Selected.tasks.values()];
    Selected.tasks.clear();

    if (is_completed_page) {
      const tasks = await DB.Task.getAll({ selector: { id: { $in: ids } } });
      const promises = tasks.map(async (task) => {
        const is_repeat_task = task.repeat_interval && task.due_date;
        if (is_repeat_task) {
          await DB.Task.update(task.id, { ...task, completed: 0 });
        } else {
          await DB.Task.delete(task.id);
        }
      });
      await Promise.all(promises);
    } else {
      await DB.Task.delete(ids);
    }

    updateChangelog(ids);

    is_deleting = false;
  }

  /**
   * @param {string[]} ids
   */
  async function updateChangelog(ids) {
    if (!user.value) return;

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

      OnlineDB.Changelog.create({
        type: "delete",
        task_id: task.id,
        room_id: task.room_id || "",
        total_reads_needed: room.users.length,
        user_reads_list: [user.value.email],
      });
    }
  }
</script>

<div class="h-full aspect-square flex items-end justify-between top-1">
  {#if Selected.tasks.size}
    <button
      transition:fade
      aria-label={t("delete_tasks")}
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
    type="submit"
    onclick={deleteAll}
  >
    <Trash class="h-full" size={18} />
    <span>{t("delete")}</span>
  </button>
</Modal>

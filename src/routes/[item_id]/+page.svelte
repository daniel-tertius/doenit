<script>
  import { fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { Trash } from "$lib/icon";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { InputCheckbox } from "$lib/components/element/input";
  import EditTask from "$lib/components/EditTask.svelte";
  import { t } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB.js";

  let { data } = $props();

  let task = $state(data.task);
  let is_deleting = $state(false);
  let error = $state({});
  let other_interval = $state(data.task.repeat_interval_number > 1 ? data.task.repeat_interval : "");

  $effect(() => {
    if (!!task.due_date) return;

    task.repeat_interval = "";
    task.repeat_interval_number = 1;
    task.start_date = null;
  });

  $effect(() => {
    if (task.repeat_interval !== "weekly_custom_days") return;

    task.start_date = task.due_date;
  });

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (task.repeat_interval_number > 1) {
      task.repeat_interval = other_interval;
    }

    const result = await DB.Task.update(task.id, task);
    if (!result) {
      error = { message: t("error_updating_task") };
      return;
    }

    goto("/");
  }

  async function deleteTask() {
    await DB.Task.delete(task.id);
    await goto("/");
  }

  /**
   * @param {Event} event
   */
  async function handleSelectTask(event) {
    event.stopPropagation();
    if (task.archived) {
      task.completed = 0;
      task.archived = false;
    } else {
      task.completed++;
    }

    await DB.Task.update(task.id, task);
  }
</script>

<button
  type="button"
  class="fixed top-3 right-3"
  onclick={() => {
    is_deleting = true;
  }}
  aria-label={t("close")}
>
  <Trash class="w-6 h-6 text-error" />
</button>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-4 text-tertiary relative">
  <EditTask bind:error bind:task bind:other_interval />

  <div class="h-12 flex">
    <div class="font-bold text-left my-auto w-full">{t("complete")}</div>

    <InputCheckbox
      class="static! top-0! translate-0! left-0! bottom-0! right-0! p-2!"
      onselect={handleSelectTask}
      is_selected={!!task.archived}
      tick_animation={!!task.archived}
    />
  </div>
</form>

<Modal bind:is_open={is_deleting} {footer} title={t("delete_task")}>
  <p class="p-4">{t("delete_task_confirmation")}</p>
</Modal>

{#snippet footer()}
  <button
    class="bg-error flex gap-1 items-center text-tertiary px-4 py-2 rounded-md"
    type="button"
    onclick={deleteTask}
  >
    <Trash class="h-full" size={18} />
    <span>{t("delete")}</span>
  </button>
{/snippet}

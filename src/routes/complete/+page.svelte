<script>
  import TaskCompleted from "$lib/components/task/TaskCompleted.svelte";
  import { Haptics } from "@capacitor/haptics";
  import { Selected } from "$lib/selected";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";
  import { t } from "$lib/services/language.svelte";

  Selected.tasks.clear();

  /** @type {Task[]}*/
  let tasks = $state([]);

  onMount(() => {
    const sub = DB.Task.subscribe((result) => (tasks = result), {
      selector: { $or: [{ archived: { $eq: true } }, { completed: { $gt: 0 } }] },
    });

    return () => sub.unsubscribe();
  });

  /**
   * Handles long press on a task to toggle its selection state.
   * @param {Task} task
   */
  function handleLongPress(task) {
    Haptics.vibrate({ duration: 100 });
    if (Selected.tasks.has(task.id)) {
      Selected.tasks.delete(task.id);
    } else {
      Selected.tasks.add(task.id);
    }
  }

  /**
   * Handles long press on a task to toggle its selection state.
   * @param {Task} task
   */
  async function handleClick(task) {
    if (!Selected.tasks.size) return goto(`/${task.id}`);

    if (Selected.tasks.has(task.id)) {
      Selected.tasks.delete(task.id);
    } else {
      Selected.tasks.add(task.id);
      Haptics.vibrate({ duration: 50 });
    }
  }

  /**
   * Handles the selection of a completed task.
   * @param {Task} task
   */
  async function handleSelect(task) {
    await DB.Task.uncomplete(task);
  }
</script>

<div class="space-y-1.5">
  {#each tasks as task (task.id)}
    <TaskCompleted
      {task}
      onclick={() => handleClick(task)}
      onselect={() => handleSelect(task)}
      onlongpress={() => handleLongPress(task)}
    />
  {:else}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-t-secondary">{t("no_completed_tasks")}</div>
    </div>
  {/each}
</div>

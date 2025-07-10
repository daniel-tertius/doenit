<script>
  import { goto } from "$app/navigation";
  import TaskCompleted from "$lib/components/task/TaskCompleted.svelte";
  import { data } from "$lib/Data.svelte";
  import { Haptics } from "@capacitor/haptics";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  data.selected_tasks_hash.clear();
  data.refreshTasks();

  /**
   * Handles long press on a task to toggle its selection state.
   * @param {Task} task
   */
  function handleLongPress(task) {
    Haptics.vibrate({ duration: 100 });
    if (data.selected_tasks_hash.has(task.id)) {
      data.selected_tasks_hash.delete(task.id);
    } else {
      data.selected_tasks_hash.add(task.id);
    }
  }

  /**
   * Handles long press on a task to toggle its selection state.
   * @param {Task} task
   */
  async function handleClick(task) {
    if (!data.selected_tasks_hash.size) return goto(`/${task.id}`);

    if (data.selected_tasks_hash.has(task.id)) {
      data.selected_tasks_hash.delete(task.id);
    } else {
      data.selected_tasks_hash.add(task.id);
      Haptics.vibrate({ duration: 50 });
    }
  }

  /**
   * Handles the selection of a completed task.
   * @param {Task} task
   */
  function handleSelect(task) {
    data.unCompleteTask(task);
    data.selected_tasks_hash.delete(task.id);
  }
</script>

<div class="space-y-1.5">
  {#if data.completed_tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-t-secondary">Nog geen voltooide take</div>
    </div>
  {/if}

  {#each data.completed_tasks as task (task.id)}
    <TaskCompleted
      {task}
      onselect={() => handleSelect(task)}
      onlongpress={() => handleLongPress(task)}
      onclick={() => handleClick(task)}
    />
  {/each}
</div>

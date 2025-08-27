<script>
  import { goto } from "$app/navigation";
  import TaskCompleted from "$lib/components/task/TaskCompleted.svelte";
  import { Selected } from "$lib/Data.svelte";
  import { DB } from "$lib/DB";
  import { Haptics } from "@capacitor/haptics";
  import { onMount } from "svelte";

  Selected.tasks.clear();

  /** @type {Task[]}*/
  let tasks = $state([]);

  onMount(() => {
    const sub = DB.Task.subscribe((result) => (tasks = result), { selector: { archived: { $eq: true } } });

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
  function handleSelect(task) {
    DB.Task.uncomplete(task);
    Selected.tasks.delete(task.id);
  }
</script>

<div class="space-y-1.5 overflow-x-hidden">
  {#if tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-t-secondary">Nog geen voltooide take</div>
    </div>
  {/if}

  {#each tasks as task (task.id)}
    <TaskCompleted
      {task}
      onselect={() => handleSelect(task)}
      onlongpress={() => handleLongPress(task)}
      onclick={() => handleClick(task)}
    />
  {/each}
</div>

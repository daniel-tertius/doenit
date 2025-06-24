<script>
  import { goto } from "$app/navigation";
  import TaskCompleted from "$lib/components/item/TaskCompleted.svelte";
  import { data } from "../Data.svelte";
  import { Haptics } from "@capacitor/haptics";

  data.selected_tasks_hash.clear();
  data.refreshTasks();
</script>

<div class="space-y-1.5">
  {#if data.completed_tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-tertiary">Jou lys is skoon!</div>
    </div>
  {/if}

  {#each data.completed_tasks as task (task.id)}
    <TaskCompleted
      {task}
      onselect={async () => {
        data.unCompleteTask(task);
        data.selected_tasks_hash.delete(task.id);
      }}
      onlongpress={() => {
        // if (data.selected_tasks_hash.size) return;

        Haptics.vibrate({ duration: 100 });
        if (data.selected_tasks_hash.has(task.id)) {
          data.selected_tasks_hash.delete(task.id);
        } else {
          data.selected_tasks_hash.add(task.id);
        }
      }}
      onclick={async () => {
        if (!data.selected_tasks_hash.size) return goto(`/${task.id}`);

        if (data.selected_tasks_hash.has(task.id)) {
          data.selected_tasks_hash.delete(task.id);
        } else {
          data.selected_tasks_hash.add(task.id);
          Haptics.vibrate({ duration: 50 });
        }
      }}
    />
  {/each}
</div>

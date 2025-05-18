<script>
  import Item from "$lib/components/Item.svelte";
  import { data } from "../Data.svelte";

  data.refreshTasks();
  // $inspect(data.selected_tasks_hash);
</script>

<div class="space-y-1.5">
  {#each data.tasks as task, i (task.id)}
    <Item
      item={task}
      onselect={async () => {
        data.unCompleteTask(task);
      }}
      onlongpress={() => {
        if (data.selected_tasks_hash.size) return;

        data.selected_tasks_hash.add(task.id);
      }}
      onclick={() => {
        if (!data.selected_tasks_hash.size) return;

        if (data.selected_tasks_hash.has(task.id)) {
          data.selected_tasks_hash.delete(task.id);
        } else {
          data.selected_tasks_hash.add(task.id);
        }
      }}
    />
  {/each}
</div>

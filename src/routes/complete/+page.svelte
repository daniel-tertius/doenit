<script>
  import { goto } from "$app/navigation";
  import Item from "$lib/components/item/Item.svelte";
  import { data } from "../Data.svelte";

  data.refreshTasks();

  function deleteAll() {
    data.deleteTasks([...data.selected_tasks_hash.values()]);
    data.selected_tasks_hash.clear();
  }
</script>

<div class="space-y-1.5">
  {#if data.selected_tasks_hash.size}
    <div>
      <div class="text-sm font-semibold pt-1 text-gray-200">{data.selected_tasks_hash.size} Gekies</div>
      <button class="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors" onclick={deleteAll}>
        Vee uit
      </button>
    </div>
  {/if}

  {#if data.tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-gray-400">Jou lys is skoon!</div>
    </div>
  {/if}

  {#each data.tasks as task (task.id)}
    <Item
      {task}
      onselect={async () => {
        data.unCompleteTask(task);
      }}
      onlongpress={() => {
        if (data.selected_tasks_hash.size) return;

        data.selected_tasks_hash.add(task.id);
      }}
      onclick={async () => {
        if (!data.selected_tasks_hash.size) return goto(`/${task.id}`);

        if (data.selected_tasks_hash.has(task.id)) {
          data.selected_tasks_hash.delete(task.id);
        } else {
          data.selected_tasks_hash.add(task.id);
        }
      }}
    />
  {/each}
</div>

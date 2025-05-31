<script>
  import { goto } from "$app/navigation";
  import Item from "$lib/components/item/Item.svelte";
  import { slide } from "svelte/transition";
  import { data } from "../Data.svelte";
  import { Haptics } from "@capacitor/haptics";
  import Trash from "$lib/icon/Trash.svelte";

  data.selected_tasks_hash.clear();
  data.refreshTasks();

  function deleteAll() {
    data.deleteTasks([...data.selected_tasks_hash.values()]);
    data.selected_tasks_hash.clear();
  }
</script>

<div class="space-y-1.5">
  {#if data.selected_tasks_hash.size}
    <div transition:slide class="flex items-end justify-between pt-2">
      <div class="text-sm font-semibold pt-1 text-gray-200">{data.selected_tasks_hash.size} Gekies</div>
      <button
        class="px-4 py-2 flex gap-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        onclick={deleteAll}
      >
        <Trash />
        <span>Vee permanent uit</span>
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

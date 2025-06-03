<script>
  import Item from "$lib/components/item/Item.svelte";
  import { displayPrettyDate } from "$lib";
  import { Plus } from "$lib/icon";
  import { goto } from "$app/navigation";
  import Undo from "$lib/components/Undo.svelte";
  import { fade } from "svelte/transition";
  import { data } from "./Data.svelte";
  import { navigating } from "$app/state";
  import { onMount } from "svelte";
  import { Haptics } from "@capacitor/haptics";
  import DeleteAll from "$lib/components/DeleteAll.svelte";

  data.selected_tasks_hash.clear();
  data.refreshTasks();

  onMount(() => {
    const from = navigating.from?.params?.item_id;
    if (!!from) {
      const element = document.getElementById(from);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }
  });
</script>

<div class="space-y-1.5">
  <DeleteAll />

  {#if data.tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-gray-400">Jou lys is skoon!</div>
      <button
        type="button"
        class="rounded-md bg-[#5b758e] px-12 py-6 flex justify-center items-center gap-2 text-sm font-medium text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
        onclick={() => goto("/create")}
      >
        <Plus size={40} />
        <span class="text-[20px]">Skep 'n nuwe taak</span>
      </button>
    </div>
  {/if}

  {#each data.tasks as task, i (task.id)}
    {@const display_date = displayPrettyDate(task.due_date)}
    {@const last_display_date = displayPrettyDate(data.tasks[i - 1]?.due_date)}
    {@const is_same_display_date = display_date === last_display_date}
    {@const onselect = () => data.completeTask(task)}

    {#if !is_same_display_date}
      {#key display_date}
        <div in:fade={{ delay: 700 }} class="text-sm font-semibold pt-1 text-gray-200">
          {display_date}
        </div>
      {/key}
    {/if}

    <div id={task.id}>
      <Item
        {task}
        {onselect}
        onclick={() => {
          if (!data.selected_tasks_hash.size) return goto(`/${task.id}`);

          if (data.selected_tasks_hash.has(task.id)) {
            data.selected_tasks_hash.delete(task.id);
          } else {
            data.selected_tasks_hash.add(task.id);
            Haptics.vibrate({ duration: 50 });
          }
        }}
        onlongpress={() => {
          Haptics.vibrate({ duration: 100 });
          if (data.selected_tasks_hash.has(task.id)) {
            data.selected_tasks_hash.delete(task.id);
          } else {
            data.selected_tasks_hash.add(task.id);
          }
        }}
      />
    </div>
  {/each}
</div>

<Undo show={!!data.just_completed_task} onclick={data.undoCompleteTask} />

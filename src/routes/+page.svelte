<script>
  import Item from "$lib/components/Item.svelte";
  import { displayPrettyDate } from "$lib";
  import { Plus } from "$lib/icon";
  import { goto } from "$app/navigation";
  import Undo from "$lib/components/Undo.svelte";
  import { slide } from "svelte/transition";
  import { data } from "./Data.svelte";

  data.refreshTasks();
</script>

{#if data}
  <div class="space-y-1.5">
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

    {#each data.tasks as item, i (item.id)}
      {@const prev_due_date = data.tasks[i - 1]?.due_date}
      {@const is_same_date = item.due_date === prev_due_date}
      {@const today = new Date().setUTCHours(0, 0, 0, 0)}
      {@const is_past_due = new Date(item.due_date).setUTCHours(0, 0, 0, 0) < today}
      {@const is_still_past = i > 0 && new Date(prev_due_date).setUTCHours(0, 0, 0, 0) < today && is_past_due}
      {@const has_due_date = !!item.due_date}

      {#if !is_same_date && !has_due_date}
        <div in:slide={{ delay: 300 }} class="text-sm font-semibold pt-1 text-gray-200">Geen datum</div>
      {:else if is_past_due && !is_still_past}
        <div in:slide={{ delay: 300 }} class="text-sm font-semibold pt-1 text-red-600">Verby</div>
      {:else if !is_same_date && !is_past_due}
        <div in:slide={{ delay: 300 }} class="text-gray-200 text-sm font-semibold">
          {displayPrettyDate(item.due_date) || "Geen datum"}
        </div>
      {/if}

      {#key item.due_date}
        {@const onselect = () => {
          data.completeTask(item);
        }}
        <Item {item} {onselect} onclick={() => goto(`/${item.id}`)} />
      {/key}
    {/each}
  </div>

  <Undo show={!!data.just_completed_task} onclick={data.undoCompleteTask} />
{/if}

<script>
  import { slide } from "svelte/transition";
  import { data } from "../../routes/Data.svelte";
  import { Trash } from "$lib/icon";

  function deleteAll() {
    data.deleteTasks([...data.selected_tasks_hash.values()]);
    data.selected_tasks_hash.clear();
  }
</script>

{#if data.selected_tasks_hash.size}
  <div transition:slide class="flex items-end justify-between pt-2">
    <div class="text-sm font-semibold pt-1 text-tertiary">{data.selected_tasks_hash.size} Gekies</div>
    <button
      class="px-4 py-2 flex gap-1 bg-red-600 text-tertiary rounded-md hover:bg-red-700 transition-colors"
      onclick={deleteAll}
    >
      <Trash />
      <span>Vee permanent uit</span>
    </button>
  </div>
{/if}

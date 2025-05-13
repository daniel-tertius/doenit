<script>
  import { displayDate } from "$lib";
  import { fly } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {Object} item
   * @property {string} item.id
   * @property {string} item.name
   * @property {boolean} item.completed
   * @property {boolean} item.archived
   * @property {string} item.due_date
   */

  /** @type {Props} */
  const { item, oncomplete, onclick } = $props();
  const is_past = $derived(new Date(item.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0));
</script>

<div class="relative min-h-9">
  <button
    transition:fly={{ x: "100%" }}
    class="border rounded-lg flex flex-col items-start p-2 w-full h-full {is_past
      ? 'border-red-600/40 border-2 bg-red-500/10'
      : ''}"
    {onclick}
  >
    <span class="h-full ml-7 text-left text-gray-200 font-semibold line-clamp-1 my-auto {item.name || 'opacity-50'}">
      {item.name || "Geen beskrywing…"}
    </span>

    {#if item.due_date}
      <div
        class="ml-7 text-left rounded-full bg-[#223a51] {is_past
          ? 'bg-red-700/70'
          : ''} px-1.5 w-fit flex items-center h-fit"
      >
        <span class="text-gray-200">{displayDate(item.due_date)}</span>
      </div>
    {/if}
  </button>

  <button
    type="button"
    aria-label="check"
    class="absolute top-1/2 -translate-y-1/2 left-2 rounded-sm border-2 border-[#d6dde3] h-5 w-5"
    onclick={() => oncomplete(item)}
  >
  </button>
</div>

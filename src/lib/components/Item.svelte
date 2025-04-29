<script>
  import { fly } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {Object} item
   * @property {string} item.id
   * @property {string} item.name
   * @property {boolean} item.completed
   * @property {string} item.due_date
   */

  /** @type {Props} */
  const { item, oncomplete } = $props();

  function toggleComplete() {
    item.completed = !item.completed;
    oncomplete(item);
  }
</script>

<div
  transition:fly={{ x: "100%" }}
  class="border-[#d6dde3] border rounded-lg flex justify-between items-center p-2 h-15"
>
  <div class="flex gap-4 item-center">
    <button
      type="button"
      aria-label="check"
      class="rounded-sm border-2 border-[#d6dde3] h-5 w-5"
      onclick={toggleComplete}
    >
    </button>
    <span class="text-gray-200 font-semibold">{item.name}</span>
  </div>

  {#if item.due_date}
    <div class="rounded-full bg-[#223a51] px-2 py-1 flex items-center h-fit">
      <span class="text-gray-200">{item.due_date}</span>
    </div>
  {/if}
</div>

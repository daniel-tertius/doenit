<script>
  import { displayDate } from "$lib";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { longpress } from "./long";
  import { data } from "../../routes/Data.svelte";

  /**
   * @typedef {import('$lib/DB/DB').Category} Category
   * @typedef {import('$lib/DB/DB').Task} Item
   */

  /**
   * @typedef {Object} Props
   * @property {Item} item
   * @property {(_: Item) => (void | Promise<void>)} [onselect]
   * @property {() => (void | Promise<void>)} [onclick]
   * @property {() => (void | Promise<void>)} [onlongpress]
   */

  /** @type {Props} */
  const { item, onselect = () => {}, onclick = () => {}, onlongpress = () => {} } = $props();
  const is_past = $derived(new Date(item.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0));
  const is_selected = $derived(data.selected_tasks_hash.has(item.id));
  let category = $state();

  onMount(async () => {
    if (!item.category_id) return;
    const Db = DB.getInstance();

    category = await Db.Category.read(item.category_id);
  });
</script>

<div class="relative min-h-10" out:fade in:slide={{ delay: 300 }}>
  <button
    class="border border-white rounded-lg flex flex-col items-start p-3 w-full h-full {is_past && !item.completed
      ? 'border-red-600/40! border-2 bg-red-500/10'
      : ''}"
    class:bg-[#223a51]={is_selected}
    {onclick}
    use:longpress
    {onlongpress}
  >
    <span
      class="h-full ml-7 text-left text-gray-200 font-semibold line-clamp-1 my-auto {item.name ||
        'opacity-50'} overflow-hidden"
      class:line-through={item.completed}
      class:opacity-50={item.completed}
    >
      {item.name || "Geen beskrywing…"}
    </span>

    <div class="ml-7 flex flex-wrap gap-1.5">
      {#if item.due_date}
        <div
          class="text-left rounded-full bg-[#223a51] px-1.5 w-fit flex items-center h-fit"
          class:bg-red-800={is_past}
        >
          <span class="text-gray-200">{displayDate(item.due_date)}</span>
        </div>
      {/if}

      {#if category}
        <div
          class="text-left rounded-full bg-[#223a51] border border-[#28425b] px-3 w-fit flex items-center h-fit overflow-hidden"
        >
          <span class="text-gray-200">{category.name}</span>
        </div>
      {/if}
    </div>
  </button>

  <button
    type="button"
    aria-label="check"
    class="absolute top-1/2 -translate-y-1/2 left-2 rounded-sm border-2 border-[#d6dde3] h-6 w-6"
    onclick={() => onselect(item)}
  >
  </button>
</div>

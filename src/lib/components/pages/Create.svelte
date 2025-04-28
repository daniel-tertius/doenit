<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import PageHeading from "../PageHeading.svelte";
  import Fab from "../FAB.svelte";
  import { onDestroy } from "svelte";

  /**
   * @typedef {Object} Props
   * @property {Function} onclose
   */

  /** @type {Props} */
  let { onclose } = $props();

  let name = $state("");
  let due_date = $state("");

  async function createItem() {
    const Db = DB.getInstance();
    await Db.Item.create({ name, due_date });
    onclose();
  }

  onDestroy(() => {
    name = due_date = "";
  });
</script>

<div transition:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white">
  <PageHeading>Create a new Item</PageHeading>
  <div>
    <label class="font-bold" for="name">Name</label>
    <input id="name" bind:value={name} class="bg-[#233a50]/50 p-2 w-full" />
  </div>

  <div>
    <label class="font-bold" for="date">Due Date</label>
    <input id="date" type="date" bind:value={due_date} class="bg-[#233a50]/50 p-2 w-full" />
  </div>

  <button class="p-2 border rounded-lg bg-[#233a50]/50" onclick={createItem}>
    <span class="font-bold">Create</span>
  </button>
</div>

<Fab onclick={onclose} class="top-4 right-4 bg-[#5b758e] hover:bg-[#476480]">
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#ffff"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
</Fab>

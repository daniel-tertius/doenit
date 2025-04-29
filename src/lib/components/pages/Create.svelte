<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import PageHeading from "../PageHeading.svelte";
  import Fab from "../FAB.svelte";
  import { onDestroy } from "svelte";
  import { safeArea } from "$lib/SafeArea.svelte";

  /**
   * @typedef {Object} Props
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} onclose
   */

  /** @type {Props} */
  let { onclose } = $props();

  let name = $state("");
  let due_date = $state("");
  let error_message = $state("");

  async function createItem() {
    if (!name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    const Db = DB.getInstance();
    await Db.Item.create({ name, due_date });
    onclose();
  }

  onDestroy(() => {
    name = due_date = "";
  });
</script>

<form onsubmit={createItem} transition:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white h-full relative">
  <PageHeading>Skep 'n taak</PageHeading>
  <div>
    <label class="font-bold" for="name">Naam</label>
    <input
      id="name"
      autofocus
      oninput={() => (error_message = "")}
      bind:value={name}
      type="text"
      placeholder="Gee jou taak 'n naam"
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] invalid:border-red-500"
    />
    {#if error_message}
      <div class="text-red-500 text-sm mt-1 flex justify-end">
        {error_message}
      </div>
    {/if}
  </div>

  <div>
    <label class="font-bold" for="date">Sperdatum</label>

    <input
      id="date"
      type="date"
      placeholder="Kies 'n datum"
      bind:value={due_date}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51]"
    />
  </div>

  <button class="absolute bottom-2 p-2 w-full border border-[#233a50]/50 hover: rounded-lg bg-[#476480]">
    <span class="font-bold">Skep</span>
  </button>
</form>

<Fab
  onclick={onclose}
  class="mt-4 mr-4 bg-[#5b758e] hover:bg-[#476480]"
  style="top: {safeArea.top}; right: {safeArea.right}"
  size="small"
>
  <svg
    width="20"
    height="20"
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

<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import PageHeading from "../PageHeading.svelte";
  import Fab from "../FAB.svelte";
  import { onDestroy, onMount } from "svelte";
  import { safeArea } from "$lib/SafeArea.svelte";
  import { Capacitor } from "@capacitor/core";
  import { App } from "@capacitor/app";

  /**
   * @typedef {Object} Props
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} onclose
   * @property {import('$lib/DB/DB').Item} [item]
   */

  /** @type {Props} */
  let { onclose, item } = $props();

  let name = $state(item?.name || "");
  let due_date = $state(item?.due_date || "");
  let completed = $state(!!item?.completed);

  let priority = $state(item?.priority || 0);
  let error_message = $state("");

  function onsubmit(event) {
    event.preventDefault();
    if (item) {
      updateItem(item);
    } else {
      createItem();
    }
  }

  /**
   * @param {Item} item
   */
  async function updateItem(item) {
    if (!name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    const Db = DB.getInstance();
    await Db.Item.update(item.id, { name, due_date });
    onclose();
  }

  async function createItem() {
    if (!name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    const Db = DB.getInstance();
    await Db.Item.create({ name, due_date, completed });
    onclose();
  }

  onDestroy(() => {
    name = due_date = "";
  });

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        onclose(event);
      });
    }

    return () => {
      App.removeAllListeners();
    };
  });
</script>

<form {onsubmit} transition:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white h-full relative">
  <PageHeading>{item ? "Verander die taak" : "Skep 'n taak"}</PageHeading>
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
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    />
  </div>

  <div class="flex justify-between items-center">
    <label class="font-bold" for="completed">Voltooi</label>
    <input
      id="completed"
      type="checkbox"
      bind:checked={completed}
      class="bg-[#233a50]/50 p-2 w-5 h-5 rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    />
  </div>

  <div>
    <label class="font-bold" for="priority">Prioriteit</label>
    <select
      id="priority"
      bind:value={priority}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    >
      <option value="low">Laag</option>
      <option value="medium">Medium</option>
      <option value="high">Hoog</option>
    </select>
  </div>

  <button class="absolute bottom-2 p-2 w-full border border-[#233a50]/50 hover: rounded-lg bg-[#476480]">
    <span class="font-bold">{item ? "Stoor" : "Skep"}</span>
  </button>
</form>

<Fab
  onclick={onclose}
  class="mt-4 mr-4 bg-[#5b758e] hover:bg-[#476480]"
  style="top: {safeArea.top}px; right: {safeArea.right}px"
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

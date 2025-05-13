<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import PageHeading from "../PageHeading.svelte";
  import Fab from "../FAB.svelte";
  import { onDestroy, onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { App } from "@capacitor/app";
  import { Plus, Save, Times } from "$lib/icon";

  /** @typedef {import('$lib/DB/DB').Item} Item */

  /**
   * @typedef {Object} Props
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} onclose
   * @property {Item} [item]
   */

  /** @type {Props} */
  let { onclose, item } = $props();

  let name = $state(item?.name || "");
  let due_date = $state(item?.due_date || "");
  let completed = $state(!!item?.completed);

  // let priority = $state(item?.priority || 0);
  let error_message = $state("");

  /**
   * @param {Event} event
   */
  function onsubmit(event) {
    event.preventDefault();

    if (!name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    if (item) {
      updateItem(item);
    } else {
      createItem();
    }

    //@ts-ignore
    onclose(event);
  }

  /**
   * @param {Item} item
   */
  async function updateItem(item) {
    const Db = DB.getInstance();
    await Db.Item.update(item.id, { name, due_date, completed, archived: completed });
  }

  async function createItem() {
    const Db = DB.getInstance();

    /** @type {Omit<Item, "id" | "created_at">}*/
    const new_item = {
      name,
      due_date,
      completed,
      archived: completed,
    };
    await Db.Item.create(new_item);
  }

  onDestroy(() => {
    name = due_date = "";
  });

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        //@ts-ignore
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

  <!-- <div>
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
  </div> -->

  <button
    class="absolute bottom-2 p-2 w-full flex gap-1 justify-center border border-[#233a50]/50 hover: rounded-lg bg-[#476480]"
  >
    {#if item}
      <Save />
      <span class="font-bold text-gray-200">Stoor</span>
    {:else}
      <Plus size={20} />
      <span class="font-bold text-gray-200">Skep</span>
    {/if}
  </button>
</form>

<Fab onclick={onclose} class="top-4 right-4 bg-[#5b758e] hover:bg-[#476480]" size="small" area_label="Sluit">
  <Times size={20} />
</Fab>

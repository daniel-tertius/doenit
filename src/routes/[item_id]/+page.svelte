<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import PageHeading from "$lib/components/PageHeading.svelte";
  import Fab from "$lib/components/FAB.svelte";
  import { onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { App } from "@capacitor/app";
  import { Plus, Save, Times } from "$lib/icon";
  import { goto } from "$app/navigation";

  /** @typedef {import('$lib/DB/DB').Item} Item */

  let { data } = $props();
  let item = data.item;
  if (!item) goto("/");

  let name = $state(item?.name || "");
  let due_date = $state(item?.due_date || "");
  let completed = $state(!!item?.completed);
  let error_message = $state("");

  // let priority = $state(item?.priority || 0);

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (!name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    const Db = DB.getInstance();
    await Db.Item.update(item.id, { name, due_date, completed, archived: completed });

    //@ts-ignore
    onclose(event);
  }

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

  async function onclose() {
    await goto("/");
  }
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

  <div class="flex justify-between items-center h-11">
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
    class="absolute bottom-2 p-4 w-full flex gap-1 justify-center border border-[#233a50]/50 hover: rounded-lg bg-[#476480]"
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

<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { App } from "@capacitor/app";
  import { Plus, Save } from "$lib/icon";
  import { goto } from "$app/navigation";

  let { data } = $props();
  let item = data.item;
  if (!item) goto("/");

  let name = $state(item?.name || "");
  let due_date = $state(item?.due_date);
  let completed = $state(!!item?.completed);
  let error_message = $state("");
  let repeat_interval = $state(item?.repeat_interval || "");
  let repeat_interval_number = $state(item?.repeat_interval_number || 1);

  /** @type {import('$lib/DB/DB').Category[]} */
  let categories = $state([]);
  let category_id = $state(item?.category_id || "");

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
    await Db.Task.update(item.id, {
      name,
      due_date,
      completed,
      archived: completed,
      category_id,
      repeat_interval,
      repeat_interval_number,
    });

    //@ts-ignore
    onclose(event);
  }

  onMount(async () => {
    const Db = DB.getInstance();
    categories = await Db.Category.data;
    categories = categories.filter(({ archived }) => !archived);
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

  async function onclose() {
    await goto("/");
  }
</script>

<form {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white grow relative">
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

  <div>
    <label class="font-bold" for="category">Kategorie</label>
    <select
      id="category"
      bind:value={category_id}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    >
      {#each categories as category (category.id)}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  {#if due_date}
    <div>
      <div>
        <label class="font-bold" for="repeat">Herhaling</label>
        <select
          id="repeat"
          bind:value={repeat_interval}
          class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
        >
          <option value="">Geen herhaling</option>
          <option value="daily">Daagliks</option>
          <option value="workdaily">Daagliks (Ma-Vr)</option>
          <option value="weekly">Weekliks</option>
          <option value="monthly">Maandeliks</option>
          <option value="yearly">Jaarliks</option>
          <option value="other">Ander</option>
        </select>
      </div>
    </div>
  {/if}

  <div class="flex justify-between items-center h-11">
    <label class="font-bold" for="completed">Voltooi</label>
    <input
      id="completed"
      type="checkbox"
      bind:checked={completed}
      class="bg-[#233a50]/50 p-2 w-5 h-5 rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    />
  </div>

  <button
    class="absolute bottom-0 p-4 w-full flex gap-1 justify-center border border-[#233a50]/50 hover: rounded-lg bg-[#476480]"
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

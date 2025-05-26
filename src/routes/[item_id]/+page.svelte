<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { App } from "@capacitor/app";
  import { goto } from "$app/navigation";
  import { data as Data } from "../Data.svelte.js";
  import Herhaling from "$lib/components/item/Herhaling.svelte";

  /** @typedef {import('$lib/DB/DB').Category} Category */

  let { data } = $props();
  let task = data.task;
  if (!task) goto("/");

  /** @type {Record<string, string>}*/
  const repeat_intervals = {
    daily: "dae",
    weekly: "weke",
    monthly: "maande",
    yearly: "jare",
  };

  let name = $state(task?.name || "");
  let due_date = $state(task?.due_date ? new Date(task?.due_date).toLocaleDateString("en-CA") : null);
  let completed = $state(!!task?.completed);
  let error_message = $state("");
  let repeat_interval = $state(task?.repeat_interval_number > 1 ? "other" : task?.repeat_interval || "");
  let repeat_interval_number = $state(task?.repeat_interval_number || 1);
  let other_period = $state(task?.repeat_interval_number > 1 ? task?.repeat_interval : "daily");

  /** @type {Category[]} */
  let categories = $state([]);
  let category_id = $state(task?.category_id);
  let is_dialog_open = $state(false);
  let is_focused = $state(false);
  let other_period_display = $derived(repeat_intervals[other_period]);
  let other_period_description = $derived(
    repeat_interval === "other" && repeat_interval_number > 1
      ? ` (elke ${repeat_interval_number} ${other_period_display})`
      : ""
  );

  onMount(async () => {
    const Db = DB.getInstance();
    const all_categories = await Db.Category.data;
    categories = all_categories.filter(({ archived }) => !archived);
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

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (!name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    if (repeat_interval === "other") {
      repeat_interval = other_period;
    }

    console.log("Update", { repeat_interval_number, repeat_interval });

    await Data.updateTask({
      ...task,
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

  async function onclose() {
    await goto("/");
  }
</script>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white grow relative">
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

  {#if due_date}
    <div>
      <label class="font-bold" for="repeat">Herhaling</label>
      <select
        id="repeat"
        bind:value={repeat_interval}
        class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
        onfocus={() => setTimeout(() => (is_focused = true), 100)}
        onclick={() => {
          if (is_focused && repeat_interval === "other") {
            is_dialog_open = true;
          }
        }}
        onblur={() => {
          is_focused = false;
        }}
      >
        <option value="">Geen herhaling</option>
        <option value="daily">Daagliks</option>
        <option value="workdaily">Daagliks (Ma-Vr)</option>
        <option value="weekly">Weekliks</option>
        <option value="monthly">Maandeliks</option>
        <option value="yearly">Jaarliks</option>
        <option value="other">Ander{other_period_description}</option>
      </select>
    </div>
  {/if}

  <div>
    <label class="font-bold" for="category">Kategorie</label>
    <select
      id="category"
      bind:value={category_id}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto open:text-gray-100"
      class:text-gray-400={!category_id}
    >
      <option value="">Kies 'n kategorie (opsioneel)</option>
      {#each categories as category (category.id)}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
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
</form>

<Herhaling bind:open={is_dialog_open} bind:other_period bind:repeat_interval_number />

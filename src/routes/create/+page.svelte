<script>
  import { fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data } from "../Data.svelte";
  import Herhaling from "$lib/components/item/Herhaling.svelte";
  import { onMount } from "svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  /** @type {Omit<Task, "id" | "created_at">}*/
  let task = $state({
    name: "",
    due_date: null,
    completed: false,
    repeat_interval: "",
    repeat_interval_number: 1,
    archived: false,
    category_id: undefined,
  });

  /** @type {HTMLElement?}*/
  let name_input = $state(null);
  let other_interval = $state("");
  let error_message = $state("");

  onMount(() => {
    init(name_input);
  });

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (!task.name?.trim()) {
      error_message = "Benoem jou taak";
      init(name_input);
      return;
    }

    if (task.repeat_interval_number > 1) {
      task.repeat_interval = other_interval;
    }

    await data.createTask(task);

    await goto("/");
  }

  /**
   * @param {HTMLElement?} el
   */
  function init(el) {
    setTimeout(() => el?.focus());
  }
</script>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white grow relative">
  <div>
    <label class="font-bold" for="name">Naam</label>
    <input
      id="name"
      bind:this={name_input}
      oninput={() => (error_message = "")}
      bind:value={task.name}
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
      bind:value={task.due_date}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    />
  </div>

  {#if task.due_date}
    <Herhaling
      bind:repeat_interval_number={task.repeat_interval_number}
      bind:repeat_interval={task.repeat_interval}
      bind:other_interval
    />
  {/if}

  <div>
    <label class="font-bold" for="category">Kategorie</label>
    <select
      id="category"
      placeholder="Kies 'n kategorie (opsioneel)"
      bind:value={task.category_id}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto open:text-gray-100"
      class:text-gray-400={!task.category_id}
    >
      <option value="">Kies 'n kategorie (opsioneel)</option>
      {#each data.categories as category (category.id)}
        <option value={category.id ?? ""}>{category.name}</option>
      {/each}
    </select>
  </div>
</form>

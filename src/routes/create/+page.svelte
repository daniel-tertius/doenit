<script>
  import { fly, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data } from "../Data.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";

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

  let error_message = $state("");

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (!task.name?.trim()) {
      error_message = "Benoem jou taak";
      return;
    }

    await data.createTask(task);

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

  {#if task.due_date}
    <div in:slide>
      <div>
        <label class="font-bold" for="repeat">Herhaling</label>
        <select
          id="repeat"
          bind:value={task.repeat_interval}
          class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
        >
          <option value="">Geen herhaling</option>
          <option value="daily">Daagliks</option>
          <option value="workdaily">Daagliks (Ma-Vr)</option>
          <option value="weekly">Weekliks</option>
          <option value="monthly">Maandeliks</option>
          <option value="yearly">Jaarliks</option>
          <!-- <option value="other">Ander</option> -->
        </select>
      </div>
    </div>
  {/if}
</form>
<!-- 
<Modal
  open={task.repeat_interval === "other"}
  onclose={() => {
    task.repeat_interval = "";
  }}
>
  <div class="p-4 space-y-4">
    <h2 class="text-xl font-bold text-white">Aangepaste Herhaling</h2>
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <label for="repeat_interval_number" class="block text-sm font-medium text-white mb-1"> Elke </label>
        <input
          id="repeat_interval_number"
          type="number"
          min="1"
          bind:value={task.repeat_interval_number}
          class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51]"
        />
      </div>
      <div class="flex-1">
        <label for="custom_interval" class="block text-sm font-medium text-white mb-1"> Periode </label>
        <select
          id="custom_interval"
          bind:value={task.repeat_interval}
          class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51]"
        >
          <option value="daily">Dae</option>
          <option value="weekly">Weke</option>
          <option value="monthly">Maande</option>
          <option value="yearly">Jare</option>
        </select>
      </div>
    </div>
    <div class="flex justify-end">
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        onclick={() => {
          if (task.repeat_interval_number < 1) {
            task.repeat_interval_number = 1;
          }
        }}
      >
        Bevestig
      </button>
    </div>
  </div>
</Modal> -->

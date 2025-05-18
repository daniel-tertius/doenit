<script>
  import { fly } from "svelte/transition";
  import { DB } from "$lib/DB/DB";
  import { Plus } from "$lib/icon";
  import { goto } from "$app/navigation";
  import { data } from "../Data.svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  /** @type {Omit<Task, "id" | "created_at">}*/
  let task = {
    name: "",
    due_date: null,
    completed: false,
    repeat_interval: "",
    repeat_interval_number: 1,
    archived: false,
    category_id: "",
  };

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

<form {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-2 text-white grow relative">
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
      bind:value={task.category_id}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    >
      {#each data.categories as category (category.id)}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <button
    class="absolute bottom-2 p-4 w-full flex gap-1 justify-center border border-[#233a50]/50 hover: rounded-lg bg-[#476480]"
  >
    <Plus size={20} />
    <span class="font-bold text-gray-200">Skep</span>
  </button>
</form>

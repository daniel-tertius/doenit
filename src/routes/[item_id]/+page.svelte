<script>
  import { fade, fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data as Data } from "../Data.svelte.js";
  import Herhaling from "$lib/components/item/Herhaling.svelte";
  import Trash from "$lib/icon/Trash.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { onMount } from "svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  let { data } = $props();
  const origin_task = data.origin_task;
  if (!origin_task) throw new Error("No origin_task provided");

  /** @type {Task}*/
  let task = $state({
    id: origin_task.id,
    created_at: origin_task.created_at,
    name: origin_task.name,
    due_date: origin_task.due_date ? new Date(origin_task.due_date).toLocaleDateString("en-CA") : null,
    completed: !!origin_task.completed,
    repeat_interval: origin_task.repeat_interval_number > 1 ? "other" : origin_task.repeat_interval || "",
    repeat_interval_number: origin_task.repeat_interval_number || 1,
    archived: origin_task.archived || false,
    category_id: origin_task.category_id || undefined,
  });

  let name_input = $state(null);
  let is_deleting = $state(false);
  let other_interval = $state(origin_task.repeat_interval_number > 1 ? origin_task.repeat_interval : "");
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

    await Data.updateTask(task);

    //@ts-ignore
    onclose(event);
  }

  async function onclose() {
    await goto("/");
  }

  async function deleteTask() {
    await Data.deleteTasks([task.id]);
    await goto("/");
  }

  function init(el) {
    setTimeout(() => el.focus());
  }
</script>

<!-- transition:fade={{ delay: 300, duration: 300 }} -->
<button
  type="button"
  class="fixed top-5 right-6"
  onclick={() => {
    is_deleting = true;
  }}
  aria-label="Sluit"
>
  <Trash class="w-6 h-6" color="#E01D1D" />
</button>
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
      bind:value={task.category_id}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto open:text-gray-100"
      class:text-gray-400={!task.category_id}
    >
      <option value="">Kies 'n kategorie (opsioneel)</option>
      {#each Data.categories as category (category.id)}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>

  <div class="flex justify-between items-center h-11">
    <label class="font-bold" for="completed">Voltooi</label>
    <input
      id="completed"
      type="checkbox"
      bind:checked={task.completed}
      class="bg-[#233a50]/50 p-2 w-5 h-5 rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    />
  </div>
</form>

<Modal bind:open={is_deleting} {footer} title="Skrap Taak?">
  <p class="p-4">Is u seker u wil hierdie taak skrap?</p>
</Modal>

{#snippet footer()}
  <button
    class="bg-[#E01D1D] flex gap-1 items-center text-white px-4 py-2 rounded-md"
    type="button"
    onclick={deleteTask}
  >
    <Trash class="h-full" size={18} />
    <span>Skrap</span>
  </button>
{/snippet}

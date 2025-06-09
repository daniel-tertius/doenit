<script>
  import { fly, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data } from "../Data.svelte";
  import Herhaling from "$lib/components/item/Herhaling.svelte";
  import { onMount } from "svelte";
  import DueDatePicker from "$lib/components/DueDatePicker.svelte";
  import CategoryPicker from "$lib/components/CategoryPicker.svelte";
  import Important from "$lib/icon/Important.svelte";
  import Urgent from "$lib/icon/Urgent.svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  /** @type {Omit<Task, "id" | "created_at">}*/
  let task = $state({
    name: "",
    due_date: null,
    start_date: null,
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

    if (!task.start_date) {
      task.start_date = task.due_date;
    }

    const new_task = await data.createTask(task);
    if (!new_task) {
      error_message = "Kon nie taak skep nie";
      init(name_input);
      return;
    }

    await goto(`/?new_id=${new_task.id}`);
  }

  /**
   * @param {HTMLElement?} el
   */
  function init(el) {
    setTimeout(() => el?.focus());
  }
</script>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-4 text-tertiary grow relative">
  <div>
    <label class="font-bold" for="name">Naam</label>
    <input
      id="name"
      bind:this={name_input}
      oninput={() => (error_message = "")}
      bind:value={task.name}
      type="text"
      placeholder="Gee jou taak 'n naam"
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary invalid:border-red-500"
    />
    {#if error_message}
      <div class="text-red-500 text-sm mt-1 flex justify-end">
        {error_message}
      </div>
    {/if}
  </div>

  <div class="flex gap-2">
    {#if task.due_date}
      <div class="w-1/2" transition:slide={{ axis: "x" }}>
        <label class="font-bold" for="date">Begindatum</label>

        <DueDatePicker bind:date={task.start_date} max={task.due_date} />
      </div>
    {/if}
    <div class={!!task.due_date ? "w-1/2" : "w-full"}>
      <label class="font-bold" for="date">Sperdatum</label>

      <DueDatePicker bind:date={task.due_date} shorthand={true} />
    </div>
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

    <CategoryPicker bind:category_id={task.category_id} />
  </div>

  <div>
    <label class="font-bold" for="category">Die vier kwadrante</label>

    <div class="flex gap-2">
      <button
        type="button"
        class="{task.important
          ? 'bg-primary border-primary-10d'
          : 'bg-primary-20l border-primary '} text-tertiary p-3 rounded-lg border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center"
        onclick={() => {
          task.important = !task.important;
        }}
      >
        <Important />
        <span>Belangrik</span>
      </button>
      <button
        type="button"
        class="{task.urgent
          ? 'bg-red-100 border-red-400 text-red-700'
          : 'bg-primary-20l border-primary text-tertiary'} p-2.5 rounded-lg border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center"
        onclick={() => {
          task.urgent = !task.urgent;
        }}
      >
        <Urgent />
        Dringend
      </button>
    </div>
  </div>
</form>

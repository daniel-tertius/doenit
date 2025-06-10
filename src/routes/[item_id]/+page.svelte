<script>
  import { fly, slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data as Data } from "../Data.svelte.js";
  import Herhaling from "$lib/components/item/Herhaling.svelte";
  import Trash from "$lib/icon/Trash.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { onMount } from "svelte";
  import DueDatePicker from "$lib/components/DueDatePicker.svelte";
  import ItemCheckbox from "$lib/components/item/ItemCheckbox.svelte";
  import CategoryPicker from "$lib/components/CategoryPicker.svelte";
  import Important from "$lib/icon/Important.svelte";
  import Urgent from "$lib/icon/Urgent.svelte";

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
    start_date: origin_task.start_date,
    important: !!origin_task.important,
    urgent: !!origin_task.urgent,
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

  $effect(() => {
    if (!task.due_date) {
      task.repeat_interval = "";
      task.repeat_interval_number = 1;
      task.start_date = null;
    }
  });

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

    task.archived = task.completed;
    if (task.completed) {
      task.completed_at = new Date().toLocaleString("af-ZA");
    }

    if (task.repeat_interval_number > 1) {
      task.repeat_interval = other_interval;
    }

    if (!task.start_date) {
      task.start_date = task.due_date;
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
  class="fixed"
  style="top: calc(12px + env(safe-area-inset-top, 0px)); right: calc(12px + env(safe-area-inset-right, 0px));"
  onclick={() => {
    is_deleting = true;
  }}
  aria-label="Sluit"
>
  <Trash class="w-6 h-6" color="#E01D1D" />
</button>

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
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary invalid:border-red-500 placeholder:text-tertiary-30d"
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
    <label class="font-bold" for="category">Prioriteit</label>

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

  <div class="grid gap-2 grid-cols-[auto_min-content] w-full h-11 items-center">
    <span class="font-bold text-left">Voltooi</span>
    <button
      class="relative w-11 h-11"
      type="button"
      onclick={() => {
        task.completed = !task.completed;
      }}
    >
      <ItemCheckbox is_selected={task.completed} checkoff_animation={task.completed} class="left-auto right-2.5" />
    </button>
  </div>
</form>

<Modal bind:open={is_deleting} {footer} title="Skrap Taak?">
  <p class="p-4">Is u seker u wil hierdie taak skrap?</p>
</Modal>

{#snippet footer()}
  <button
    class="bg-red-600 flex gap-1 items-center text-tertiary px-4 py-2 rounded-md"
    type="button"
    onclick={deleteTask}
  >
    <Trash class="h-full" size={18} />
    <span>Skrap</span>
  </button>
{/snippet}

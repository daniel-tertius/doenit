<script>
  import { slide } from "svelte/transition";
  import Herhaling from "$lib/components/item/Herhaling.svelte";
  import DueDatePicker from "$lib/components/DueDatePicker.svelte";
  import CategoryPicker from "$lib/components/CategoryPicker.svelte";
  import Important from "$lib/icon/Important.svelte";
  import Urgent from "$lib/icon/Urgent.svelte";
  import InputName from "$lib/components/InputName.svelte";
  import DateTimeRangePicker from "./DateTimeRangePicker.svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  let { task = $bindable(), error_message = $bindable(), other_interval = $bindable() } = $props();
</script>

<InputName bind:name={task.name} bind:description={task.description} bind:error_message />

<div class="w-full">
  <label class="font-bold" for="date">Sperdatum</label>
  {task.start_date} –
  {task.due_date}
  <DateTimeRangePicker
    start={task.start_date}
    end={task.due_date}
    onchange={({ start_date = "", start_time = "", end_date = "", end_time = "" }) => {
      task.start_date = start_date ? `${start_date} ${start_time}`.trim() : null;
      task.due_date = end_date ? `${end_date} ${end_time}`.trim() : null;
    }}
  />
</div>

<!-- <div class="flex gap-2">
  {#if task.due_date}
    <div class="w-1/2" transition:slide={{ axis: "x" }}>
      <label class="font-bold" for="date">Begindatum</label>

      <DueDatePicker
        bind:date={task.start_date}
        max={task.due_date}
        type="start"
        disabled={task.repeat_interval === "weekly_custom_days"}
      />
    </div>
  {/if}
  <div class={!!task.due_date ? "w-1/2" : "w-full"}>
    <label class="font-bold" for="date">Sperdatum</label>

    <DueDatePicker bind:date={task.due_date} shorthand={true} type="end" />
  </div>
</div> -->

{#if task.due_date}
  <Herhaling
    bind:repeat_interval_number={task.repeat_interval_number}
    bind:repeat_interval={task.repeat_interval}
    bind:specific_days={task.repeat_specific_days}
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
        ? 'bg-yellow-100 border-yellow-700 text-yellow-700'
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

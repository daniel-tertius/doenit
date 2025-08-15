<script>
  import Herhaling from "$lib/components/task/Herhaling.svelte";
  import CategoryPicker from "$lib/components/CategoryPicker.svelte";
  import { Important, Urgent } from "$lib/icon";
  import InputName from "$lib/components/InputName.svelte";
  import DateTimeRangePicker from "./DateTimeRangePicker.svelte";
  import DatePickerShortcut from "./DatePickerShortcut.svelte";

  let { task = $bindable(), error = $bindable(), other_interval = $bindable() } = $props();

  const title = $derived(!!task.start_date ? "Datum" : "Sperdatum");
</script>

<InputName bind:name={task.name} bind:description={task.description} bind:error_message={error.name} />

<div class="w-full">
  <label class="font-bold" for="date">{title}</label>
  <DateTimeRangePicker
    start={task.start_date}
    end={task.due_date}
    onchange={({ start_date = "", start_time = "", end_date = "", end_time = "" }) => {
      task.start_date = start_date ? `${start_date} ${start_time}`.trim() : null;
      task.due_date = end_date ? `${end_date} ${end_time}`.trim() : null;
    }}
    bind:error_message={error.date}
  />
  <DatePickerShortcut bind:date={task.due_date} />
</div>

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
      class={{
        "text-t-secondary p-3 rounded border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center": true,
        "bg-yellow-100 border-yellow-700 text-yellow-700": task.important,
        "bg-t-primary border-dark-400 ": !task.important,
      }}
      onclick={() => {
        task.important = !task.important;
      }}
    >
      <Important />
      <span>Belangrik</span>
    </button>
    <button
      type="button"
      class={{
        "text-t-secondary p-3 rounded border w-full text-sm shadow-sm transition-colors flex gap-1 justify-center items-center": true,
        "bg-error-30d border-error-invert-30d ": task.urgent,
        "bg-t-primary border-dark-400": !task.urgent,
      }}
      onclick={() => {
        task.urgent = !task.urgent;
      }}
    >
      <Urgent />
      Dringend
    </button>
  </div>
</div>

<script>
  import Herhaling from "$lib/components/task/Herhaling.svelte";
  import CategoryPicker from "$lib/components/CategoryPicker.svelte";
  import { Important } from "$lib/icon";
  import { InputTaskName } from "$lib/components/element/input";
  import DateTimeRangePicker from "./DateTimeRangePicker.svelte";
  import DatePickerShortcut from "./DatePickerShortcut.svelte";
  import { t } from "$lib/services/language.svelte";
  import { Button } from "./element/button";
  import ShareTask from "./ShareTask.svelte";

  let { task = $bindable(), error = $bindable(), other_interval = $bindable() } = $props();

  const title = $derived(!!task.start_date ? t("date") : t("due_date"));
</script>

<InputTaskName bind:name={task.name} bind:description={task.description} bind:error_message={error.name} />

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
  <label class="font-bold" for="category">{t("category")}</label>

  <CategoryPicker bind:category_id={task.category_id} />
</div>

<div>
  <div class="grid grid-cols-[40px_auto_128px] py-2 border-t border-dark-800">
    <Important size={32} class="m-auto" />
    <div class="flex flex-col">
      <span class="font-bold">Is dit belangrik?</span>
      <span class="italic">Dit sal hoër in lys verskyn</span>
    </div>
    <Button
      class={{
        "bg-yellow-100! border-yellow-700! text-yellow-700!": task.important,
      }}
      type="button"
      aria-label="Belangrik"
      onclick={() => {
        task.important = !task.important;
      }}
    >
      <Important size={16} />
      <span>Belangrik</span>
    </Button>
  </div>

  <ShareTask bind:room_id={task.room_id} />
</div>

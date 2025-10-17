<script>
  import Modal from "./modal/Modal.svelte";
  import Calendar from "./element/calendar/Calendar.svelte";
  import Slider from "./Slider.svelte";
  import { slide } from "svelte/transition";
  import { DateUtil } from "$lib/core/date_util";
  import Button from "./element/button/Button.svelte";
  import { Check, Times } from "$lib/icon";
  import { untrack } from "svelte";

  /**
   * @typedef {Object} Props
   * @property {string} start - Selected start date string
   * @property {string} end - Selected end date string
   * @property {Function} [ondateselected] - Callback when dates are selected
   */

  /** @type {Props} */
  let { start = $bindable(""), end = $bindable(""), ondateselected } = $props();

  const DEFAULT_HOUR = "08";
  const DEFAULT_MIN = "00";

  // Internal selection state
  let internal_start_date = $state(start ? new Date(start) : null);
  let internal_end_date = $state(end ? new Date(end) : null);
  let internal_start_hour = $state(start ? `${new Date(start).getHours()}`.padStart(2, "0") : DEFAULT_HOUR);
  let internal_start_min = $state(start ? `${new Date(start).getMinutes()}`.padStart(2, "0") : DEFAULT_MIN);
  let is_time_picked = $state(`${internal_start_hour}:${internal_start_min}` !== `${DEFAULT_HOUR}:${DEFAULT_MIN}`);
  let is_open = $state(false);

  const display_start = $derived(getDisplayStart());
  const display_end = $derived(internal_end_date ? DateUtil.format(internal_end_date, "D MMM YYYY") : null);

  $effect(() => {
    start;
    end;

    untrack(() => {
      internal_start_date = start ? new Date(start) : null;
      internal_end_date = end ? new Date(end) : null;
    });
  });

  // function

  /**
   * Handle date selection from Calendar
   * @param {{ start_date: Date, end_date: Date }} update
   */
  function handleSelection(update) {
    start = DateUtil.format(update.start_date, "YYYY-MM-DD 00:00:00");
    end = DateUtil.format(update.end_date, "YYYY-MM-DD 00:00:00");
  }

  function getDisplayStart() {
    if (!internal_start_date) return "";

    const is_midnight = `${internal_start_hour}:${internal_start_min}` === "00:00";
    if (!!internal_end_date || !is_time_picked || is_midnight) {
      return DateUtil.format(internal_start_date, "D MMM YYYY");
    }

    return DateUtil.format(internal_start_date, `D MMM YYYY ${internal_start_hour}:${internal_start_min}`);
  }
</script>

<button
  type="button"
  onclick={() => {
    is_open = !is_open;
  }}
  class="border border-default h-11 bg-card rounded-lg w-full flex"
>
  <div class="w-full flex items-center justify-between p-2">
    {#if !internal_start_date && !internal_end_date}
      <span class="text-muted">Kies datums</span>
    {:else if internal_start_date && !internal_end_date}
      <span>{display_start}</span>
    {:else if internal_start_date && internal_end_date}
      <span>{display_start}</span>
      <span> tot </span>
      <span>{display_end}</span>
    {/if}
  </div>
  {#if internal_start_date}
    <button
      type="button"
      class="aspect-square h-11 flex items-center justify-center"
      onclick={() => (start = end = "")}
    >
      <Times />
    </button>
  {/if}
</button>

<Modal bind:is_open close_button={false}>
  <div class="mb-2">
    <Calendar
      bind:start_date={internal_start_date}
      bind:end_date={internal_end_date}
      ondateselected={handleSelection}
    />
  </div>

  {#if !internal_end_date}
    <div transition:slide={{ axis: "y" }} class="flex gap-2 w-full mb-2">
      <div class="w-full text-center">
        <span class="font-semibold">Uur</span>
        <Slider
          options={Array.from({ length: 24 }).map((_, i) => `${i}`.padStart(2, "0"))}
          onchange={() => (is_time_picked = true)}
          bind:value={internal_start_hour}
        />
      </div>
      <div class="w-full text-center">
        <span class="font-semibold">Minute</span>
        <Slider
          options={Array.from({ length: 60 }).map((_, i) => `${i}`.padStart(2, "0"))}
          onchange={() => (is_time_picked = true)}
          bind:value={internal_start_min}
        />
      </div>
    </div>
  {/if}

  <Button
    class="bg-card"
    onclick={() => {
      is_open = false;
    }}
  >
    <Check />
    <span>Bevestig</span>
  </Button>
</Modal>

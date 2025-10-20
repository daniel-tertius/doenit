<script>
  import Modal from "./modal/Modal.svelte";
  import Calendar from "./element/calendar/Calendar.svelte";
  import Slider from "./Slider.svelte";
  import { slide } from "svelte/transition";
  import { DateUtil } from "$lib/core/date_util";
  import Button from "./element/button/Button.svelte";
  import { Check } from "$lib/icon";
  import { onMount, untrack } from "svelte";
  import ButtonClear from "./element/button/ButtonClear.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} start - Selected start date string
   * @property {string | null} end - Selected end date string
   */

  /** @type {Props} */
  let { start = $bindable(), end = $bindable() } = $props();

  const DEFAULT_HOUR = "08";
  const DEFAULT_MIN = "00";

  let is_mounted = false;
  let enable_range = !!end;

  // Internal selection state
  let internal_start_date = $state(start ? new Date(start) : null);
  let internal_end_date = $state(end ? new Date(end) : null);
  let internal_start_hour = $state(initStartHour(start));
  let internal_start_min = $state(
    !!start && !!new Date(start).getMinutes() ? `${new Date(start).getMinutes()}`.padStart(2, "0") : DEFAULT_MIN
  );
  let is_open = $state(false);

  const is_time_picked = $derived(start?.includes(" "));
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

  $effect(() => {
    internal_start_date;
    if (!is_mounted) return;
    enable_range = true;
  });

  $effect(() => {
    internal_start_min;
    internal_start_hour;

    untrack(() => {
      if (!internal_start_date) return;
      if (!internal_start_min || !internal_start_hour) return;
      if (internal_end_date) return;

      const start_time = `${internal_start_hour}:${internal_start_min}`;
      handleSelection({ start_date: internal_start_date, start_time });
    });
  });

  onMount(() => {
    is_mounted = true;
  });

  /**
   * @param {string} start_date_str
   */
  function initStartHour(start_date_str) {
    if (!start_date_str) return DEFAULT_HOUR;

    const has_time = start_date_str.includes(" ");
    if (has_time) {
      const date = new Date(start_date_str);
      return !!date.getHours() ? `${date.getHours()}`.padStart(2, "0") : DEFAULT_HOUR;
    }

    return DEFAULT_HOUR;
  }

  /**
   * Handle date selection from Calendar
   * @param {{ start_date: Date, start_time?: string, end_date?: Date | null }} update
   */
  function handleSelection(update) {
    if (update.start_time) {
      if (!/^\d{2}:\d{2}$/.test(update.start_time)) {
        console.error(`Tyd in verkeerde formaat: ${update.start_time}. Moet in HH:mm formaat wees.`);
        return;
      }
      start = `${DateUtil.format(update.start_date, "YYYY-MM-DD")} ${update.start_time}`;
      end = null;
    } else {
      start = DateUtil.format(update.start_date, "YYYY-MM-DD");
      end = update.end_date ? DateUtil.format(update.end_date, "YYYY-MM-DD") : null;
    }
  }

  function getDisplayStart() {
    if (!internal_start_date) return "";

    const is_midnight = `${internal_start_hour}:${internal_start_min}` === "00:00";
    const has_time = !!internal_start_hour && !!internal_start_min;
    if (!!internal_end_date || !is_time_picked || is_midnight || !has_time) {
      return DateUtil.format(internal_start_date, "D MMM YYYY");
    }

    return DateUtil.format(internal_start_date, `D MMM YYYY ${internal_start_hour}:${internal_start_min}`);
  }
</script>

<div class="border border-default h-11 bg-card rounded-lg w-full flex">
  <button
    type="button"
    onclick={() => {
      is_open = !is_open;
    }}
    class="w-full"
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
  </button>

  {#if internal_start_date}
    <ButtonClear
      onclick={() => {
        internal_start_hour = internal_start_min = "";
        start = end = "";
      }}
    />
  {/if}
</div>

<Modal bind:is_open onclose={() => (enable_range = false)} close_button={false}>
  <div class="mb-2">
    <Calendar
      is_range_enabled={enable_range}
      bind:start_date={internal_start_date}
      bind:end_date={internal_end_date}
      ondateselected={handleSelection}
    />
  </div>

  {#if !internal_end_date}
    <div transition:slide={{ axis: "y" }} class="flex gap-2 w-full mb-2">
      <div class="w-full text-center">
        <span class={{ "font-semibold": true, "opacity-30": !is_time_picked }}>Uur</span>
        <Slider
          class={{ "opacity-30": !is_time_picked }}
          options={Array.from({ length: 24 }).map((_, i) => `${i}`.padStart(2, "0"))}
          bind:value={internal_start_hour}
        />
      </div>
      <div class="w-full text-center">
        <span class={{ "font-semibold": true, "opacity-30": !is_time_picked }}>Minute</span>
        <Slider
          class={{ "opacity-30": !is_time_picked }}
          options={Array.from({ length: 60 }).map((_, i) => `${i}`.padStart(2, "0"))}
          bind:value={internal_start_min}
        />
      </div>
    </div>
  {/if}

  <Button
    class="bg-card"
    onclick={() => {
      is_open = false;
      enable_range = false;
    }}
  >
    <Check />
    <span>Bevestig</span>
  </Button>
</Modal>

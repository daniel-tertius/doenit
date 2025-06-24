<script>
  import { displayDate, displayDateShort } from "$lib";
  import { Times } from "$lib/icon";
  import { slide } from "svelte/transition";
  import InputTime from "./InputTime.svelte";
  import DateTimeRangePicker from "./DateTimeRangePicker.svelte";

  /**
   * @typedef {Object} Props
   * @property {string?} [date] - The due date in ISO format (YYYY-MM-DD).
   * @property {string} [max] - The minimum date allowed for the date picker.
   * @property {'end' | 'start' | 'none'} [type] - The type of date being set (end, start, or none).
   * @property {boolean} [shorthand] - Whether to show shorthand buttons for quick date selection.
   * @property {boolean} [disabled=false] - Whether the date picker is disabled.
   */

  /** @type {Props} */
  let { date = $bindable(null), max, shorthand, type, disabled = false } = $props();

  let is_focused = $state(false);

  /** @type {HTMLInputElement?} */
  let date_input = $state(null);
  let time = $state(date?.length === 16 ? date.split(" ")[1] : "");

  const is_start = $derived(type === "start");
  const is_past = $derived(
    !!date && +new Date(date).setHours(is_start ? 0 : 23, is_start ? 0 : 59, 0, 0) < +new Date()
  );
  const display_due_date = $derived(displayDate({ due_date: date }));

  $effect(() => {
    if (!is_focused || !date_input) return;

    date_input.focus();
    date_input.showPicker();
  });

  $effect(() => {
    if (!date) return;

    const temp_date = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(":");
      temp_date.setHours(+hours, +minutes, 0, 0);
      date = temp_date.toLocaleString("af-ZA").slice(0, -3);
    } else {
      date = temp_date.toLocaleDateString("af-ZA");
    }
  });
</script>

<div class="relative flex w-full transition-all duration-300 ease-in-out">
  {#if !is_focused}
    <input
      id="date"
      type="text"
      value={display_due_date}
      {disabled}
      onfocus={() => (is_focused = true)}
      placeholder="Kies 'n datum"
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d"
      class:text-red-500={is_past}
      class:text-tertiary-20d!={disabled}
    />
  {:else}
    <input
      id="date"
      type="date"
      onblur={() => (is_focused = false)}
      {max}
      bind:this={date_input}
      bind:value={date}
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d appearance-none"
      class:text-red-500={is_past}
    />
  {/if}

  {#if date && !disabled}
    <button type="button" onclick={() => (date = null)} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
      <Times class="text-tertiary" size={18} />
    </button>
  {/if}
</div>

{#if !!date}
  <InputTime bind:value={time} class="mt-2" placeholder="Kies 'n {!!type ? (is_start ? 'begin' : 'eind') : ''}tyd" />
{/if}

{#if shorthand && !date}
  {@const today = new Date()}
  {@const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))}
  {@const in_a_week = new Date(new Date().setDate(new Date().getDate() + 7))}
  {@const in_a_month = new Date(new Date().setMonth(new Date().getMonth() + 1))}

  <div class="flex gap-2 mt-2" transition:slide>
    <button
      type="button"
      class="bg-primary-20l p-1 rounded-lg border border-primary w-full text-sm shadow-sm"
      onclick={() => {
        date = today.toLocaleDateString("en-CA");
      }}
    >
      <span>Vandag</span>
      <div class="text-tertiary-30d text-[12px]">{displayDateShort(today)}</div>
    </button>
    <button
      type="button"
      class="bg-primary-20l p-1 rounded-lg border border-primary w-full text-sm shadow-sm"
      onclick={() => {
        date = tomorrow.toLocaleDateString("en-CA");
      }}
    >
      Môre
      <div class="text-tertiary-30d text-[12px]">{displayDateShort(tomorrow)}</div>
    </button>
    <button
      type="button"
      class="bg-primary-20l p-1 rounded-lg border border-primary w-full text-sm shadow-sm"
      onclick={() => {
        date = in_a_week.toLocaleDateString("en-CA");
      }}
    >
      Oor 'n week
      <div class="text-tertiary-30d text-[12px]">{displayDateShort(in_a_week)}</div>
    </button>
    <button
      type="button"
      class="bg-primary-20l p-1 rounded-lg border border-primary w-full text-sm shadow-sm"
      onclick={() => {
        date = in_a_month.toLocaleDateString("en-CA");
      }}
    >
      Oor 'n maand
      <div class="text-tertiary-30d text-[12px]">{displayDateShort(in_a_month)}</div>
    </button>
  </div>
{/if}

<script>
  import { displayDate } from "$lib";
  import { Times } from "$lib/icon";
  import { slide } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {string?} [date] - The due date in ISO format (YYYY-MM-DD).
   * @property {string} [max] - The minimum date allowed for the date picker.
   * @property {boolean} [shorthand] - Whether to show shorthand buttons for quick date selection.
   */

  /** @type {Props} */
  let { date = $bindable(null), max, shorthand } = $props();

  let is_focused = $state(false);

  /** @type {HTMLInputElement?} */
  let dateInput = $state(null);

  const display_due_date = $derived(displayDate(date));

  $effect(() => {
    if (!is_focused || !dateInput) return;

    dateInput.focus();
    dateInput.showPicker();
  });
</script>

<div class="relative flex w-full transition-all duration-300 ease-in-out">
  {#if !is_focused}
    <input
      id="date"
      type="text"
      value={display_due_date}
      onfocus={() => (is_focused = true)}
      placeholder="Kies 'n datum"
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto"
    />
  {:else}
    <input
      id="date"
      type="date"
      onblur={() => (is_focused = false)}
      {max}
      bind:this={dateInput}
      bind:value={date}
      class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] sm:w-1/2 sm:mx-auto appearance-none"
    />
  {/if}

  {#if date}
    <button onclick={() => (date = null)} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
      <Times class="text-slate-300" size={18} />
    </button>
  {/if}
</div>

{#if shorthand && !date}
  <div class="flex gap-2 mt-2" transition:slide>
    <button
      type="button"
      class="bg-[#233a50]/50 p-2 rounded-lg border border-[#223a51] w-full text-sm shadow-sm"
      onclick={() => {
        const today = new Date();
        date = today.toISOString().slice(0, 10);
      }}
    >
      Vandag
    </button>
    <button
      type="button"
      class="bg-[#233a50]/50 p-2 rounded-lg border border-[#223a51] w-full text-sm shadow-sm"
      onclick={() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        date = tomorrow.toISOString().slice(0, 10);
      }}
    >
      Môre
    </button>
    <button
      type="button"
      class="bg-[#233a50]/50 p-2 rounded-lg border border-[#223a51] w-full text-sm shadow-sm"
      onclick={() => {
        const in_a_week = new Date();
        in_a_week.setDate(in_a_week.getDate() + 7);
        date = in_a_week.toISOString().slice(0, 10);
      }}
    >
      Oor 'n week
    </button>
    <button
      type="button"
      class="bg-[#233a50]/50 p-2 rounded-lg border border-[#223a51] w-full text-sm shadow-sm"
      onclick={() => {
        const in_a_month = new Date();
        in_a_month.setMonth(in_a_month.getMonth() + 1);
        date = in_a_month.toISOString().slice(0, 10);
      }}
    >
      Oor 'n maand
    </button>
  </div>
{/if}

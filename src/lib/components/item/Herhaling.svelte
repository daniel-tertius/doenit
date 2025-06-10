<script>
  import { untrack } from "svelte";
  import Modal from "../modal/Modal.svelte";
  import { slide } from "svelte/transition";
  import { Times } from "$lib/icon";
  import Check from "$lib/icon/Check.svelte";

  /**
   * @typedef {Object} Props
   * @property {number} repeat_interval_number - The number of intervals for the repeat.
   * @property {string} repeat_interval - The type of repeat interval (daily, weekly, monthly, yearly).
   * @property {string} other_interval - The custom interval if the repeat interval is set to "other".
   */

  /** @type {Props} */
  let { repeat_interval_number = $bindable(), repeat_interval = $bindable(), other_interval = $bindable() } = $props();

  /** @type {Record<string, string>}*/
  const OTHER_REPEAT_INTERVALS = {
    daily: "dae",
    weekly: "weke",
    monthly: "maande",
    yearly: "jare",
  };

  let is_mounting = $state(true);
  let temp_other_interval = $state(other_interval);
  let temp_repeat_interval = $state(repeat_interval);
  let temp_repeat_interval_number = $state(Math.max(2, repeat_interval_number));
  let is_dialog_open = $state(false);
  let error_message = $state("");

  const display_other = $derived.by(() => {
    if (other_interval === "other") return "";
    if (repeat_interval_number < 2) return "";

    const repeat_interval_display = OTHER_REPEAT_INTERVALS[other_interval];
    return ` (elke ${repeat_interval_number} ${repeat_interval_display})`;
  });

  const temp_display_other = $derived.by(() => {
    if (temp_repeat_interval_number < 2) return "";
    if (!temp_other_interval || temp_other_interval === "other") return "";

    const repeat_interval_display = OTHER_REPEAT_INTERVALS[temp_other_interval];
    return ` elke ${temp_repeat_interval_number} ${repeat_interval_display}`;
  });

  $effect(() => {
    // If the user selects "other" while "other" is already selected, the dialog should still open.
    temp_repeat_interval;
    untrack(() => {
      if (is_mounting) {
        is_mounting = false;
        return;
      }

      if (temp_repeat_interval === "other_temp") {
        temp_repeat_interval = "other";
      } else if (temp_repeat_interval === "other") {
        is_dialog_open = true;
        temp_repeat_interval_number = Math.max(2, temp_repeat_interval_number);
      } else {
        other_interval = temp_other_interval = "";
        repeat_interval_number = temp_repeat_interval_number = 1;
      }
    });
  });

  $effect(() => {
    if (temp_repeat_interval !== "other" || !!temp_other_interval) {
      untrack(() => {
        repeat_interval = temp_repeat_interval;
      });
    }
  });

  $effect(() => {
    if (!is_dialog_open) {
      untrack(() => {
        // Reset to previous value.
        temp_repeat_interval = repeat_interval;
        temp_repeat_interval_number = repeat_interval_number;
      });
    }
  });
</script>

<div transition:slide>
  <label class="font-bold" for="repeat">Herhaling</label>

  <div class="relative">
    <select
      id="repeat"
      bind:value={temp_repeat_interval}
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary open:text-tertiary appearance-none"
      class:text-tertiary-30d={!temp_repeat_interval}
    >
      <option value="">Geen herhaling</option>
      <option value="daily">Daagliks</option>
      <option value="workdaily">Daagliks (Ma-Vr)</option>
      <option value="weekly">Weekliks</option>
      <option value="monthly">Maandeliks</option>
      <option value="yearly">Jaarliks</option>
      <option hidden={temp_repeat_interval === "other"} value="other">Ander{display_other}</option>
      <option hidden={temp_repeat_interval !== "other"} value="other_temp">Ander{display_other}</option>
    </select>

    {#if !!temp_repeat_interval}
      <button onclick={() => (temp_repeat_interval = "")} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
        <Times class="text-tertiary" size={18} />
      </button>
    {/if}
  </div>
</div>

<Modal bind:open={is_dialog_open} title="Herhaal{temp_display_other || ' elke…'}" {footer}>
  <div class="p-4 space-y-4">
    <div class="flex sm:flex-row gap-4">
      <div class="flex-1">
        <label for="repeat_interval_number" class="block text-sm font-semibold text-tertiary mb-1">Elke</label>
        <input
          id="repeat_interval_number"
          type="number"
          min="2"
          bind:value={temp_repeat_interval_number}
          oninput={() => {
            error_message = "";
          }}
          class="bg-primary-20l p-2 w-full rounded-lg border border-primary"
        />
      </div>
      <div class="flex-1">
        <label for="custom_interval" class="block text-sm font-semibold text-teriary mb-1">Periode</label>
        <select
          id="custom_interval"
          bind:value={temp_other_interval}
          onchange={() => {
            error_message = "";
          }}
          class="bg-primary-20l p-2 w-full rounded-lg border border-primary"
        >
          <option value="daily">Dae</option>
          <option value="weekly">Weke</option>
          <option value="monthly">Maande</option>
          <option value="yearly">Jare</option>
        </select>
      </div>
    </div>

    {#if error_message}
      <div class="text-red-500 text-sm mt-1 flex justify-end" transition:slide>
        {error_message}
      </div>
    {/if}
  </div>
</Modal>

{#snippet footer()}
  <button
    class="bg-blue-600 hover:bg-blue-700 text-tertiary px-4 py-2 rounded-md flex gap-1 items-center"
    type="button"
    onclick={() => {
      if (!temp_repeat_interval_number || temp_repeat_interval_number < 2) {
        error_message = "Die nommer moet minstens 2 wees";
        return;
      }

      if (!temp_other_interval) {
        error_message = "Kies 'n herhalingsperiode";
        return;
      }

      temp_repeat_interval_number = Math.max(2, temp_repeat_interval_number);
      repeat_interval_number = temp_repeat_interval_number;
      repeat_interval = temp_repeat_interval;
      other_interval = temp_other_interval;
      is_dialog_open = false;
    }}
  >
    <Check size={18} />
    <span>Bevestig</span>
  </button>
{/snippet}

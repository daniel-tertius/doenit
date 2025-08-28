<script>
  import { untrack } from "svelte";
  import Modal from "../modal/Modal.svelte";
  import { slide } from "svelte/transition";
  import { Check, Times } from "$lib/icon";
  import { SvelteSet } from "svelte/reactivity";
  import ButtonClear from "../element/button/ButtonClear.svelte";
  import { t } from "$lib/services/language.svelte";

  /**
   * @typedef {"So" | "Ma" | "Di" | "Wo" | "Do" | "Vr" | "Sa"} WEEKDAY
   *
   * @typedef {Object} Props
   * @property {number} repeat_interval_number - The number of intervals for the repeat.
   * @property {(0|1|2|3|4|5|6)[]} specific_days - The specific days of the week for weekly repetition.
   * @property {string} repeat_interval - The type of repeat interval (daily, weekly, monthly, yearly).
   * @property {string} other_interval - The custom interval if the repeat interval is set to "other".
   */

  /** @type {Props} */
  let {
    repeat_interval_number = $bindable(),
    repeat_interval = $bindable(),
    other_interval = $bindable(),
    specific_days = $bindable([]),
  } = $props();

  /** @type {Record<string, string>}*/
  const OTHER_REPEAT_INTERVALS = $derived({
    daily: t("days"),
    weekly: t("weeks"),
    monthly: t("months"),
    yearly: t("years"),
  });

  /** @type {WEEKDAY[]} */
  const DAYS_OF_WEEK = $derived([t("sun"), t("mon"), t("tue"), t("wed"), t("thu"), t("fri"), t("sat")]);

  let is_mounting = $state(true);
  let temp_repeat_interval_number = $state(Math.max(2, repeat_interval_number));
  let temp_other_interval = $state(other_interval);
  let temp_repeat_interval = $state(repeat_interval_number > 1 ? "other" : repeat_interval);
  /** @type {Set<(0 | 1 | 2 | 3 | 4 | 5 | 6)>}*/
  let temp_specific_days = $state(new SvelteSet(specific_days));
  let is_dialog_open = $state(false);
  let error_message = $state("");

  const display_other = $derived.by(() => {
    if (other_interval === "other") return "";
    if (repeat_interval_number < 2) return "";

    const repeat_interval_display = OTHER_REPEAT_INTERVALS[other_interval];
    return ` (${t("every")} ${repeat_interval_number} ${repeat_interval_display})`;
  });

  const temp_display_other = $derived.by(() => {
    if (temp_repeat_interval_number < 2) return "";
    if (!temp_other_interval || temp_other_interval === "other") return "";

    const repeat_interval_display = OTHER_REPEAT_INTERVALS[temp_other_interval];
    return ` ${t("every")} ${temp_repeat_interval_number} ${repeat_interval_display}`;
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

  function save() {
    if (!temp_repeat_interval_number || temp_repeat_interval_number < 2) {
      error_message = "Die nommer moet minstens 2 wees";
      return;
    }

    if (!temp_other_interval) {
      error_message = t("choose_repeat_period");
      return;
    }

    temp_repeat_interval_number = Math.max(2, temp_repeat_interval_number);
    repeat_interval_number = temp_repeat_interval_number;
    repeat_interval = temp_repeat_interval;
    other_interval = temp_other_interval;

    is_dialog_open = false;
  }

  $effect(() => {
    if (temp_repeat_interval === "weekly_custom_days") {
      specific_days = [...temp_specific_days];
    } else {
      specific_days = [];
    }
  });
</script>

<div transition:slide>
  <label class="font-bold" for="repeat">{t("repeat")}</label>

  <div class="relative">
    <select
      id="repeat"
      bind:value={temp_repeat_interval}
      class="bg-t-primary-700 p-2 w-full rounded-lg border-dark-500 border open:text-t-secondary appearance-none {!temp_repeat_interval &&
        'text-t-secondary/60'}"
    >
      <option value="">{t("no_repeat")}</option>
      <option value="daily">{t("daily")}</option>
      <option value="workdaily">{t("daily_workdays")}</option>
      <option value="weekly_custom_days">{t("weekly_custom")}</option>
      <option value="weekly">{t("weekly")}</option>
      <option value="monthly">{t("monthly")}</option>
      <option value="yearly">{t("yearly")}</option>
      <option hidden={temp_repeat_interval === "other"} value="other">{t("other")}{display_other}</option>
      <option hidden={temp_repeat_interval !== "other"} value="other_temp">{t("other")}{display_other}</option>
    </select>

    {#if !!temp_repeat_interval}
      <ButtonClear onclick={() => (temp_repeat_interval = "")} />
    {/if}
  </div>
  {#if temp_repeat_interval === "weekly_custom_days"}
    <div transition:slide class="flex justify-between items-center mt-2 gap-1">
      {#each DAYS_OF_WEEK as day, i}
        <button
          type="button"
          class="w-full h-8 rounded-lg border border-primary transition-colors duration-300"
          class:bg-tertiary={temp_specific_days.has(i)}
          class:text-primary={temp_specific_days.has(i)}
          class:bg-primary-20l={!temp_specific_days.has(i)}
          class:text-t-secondary={!temp_specific_days.has(i)}
          onclick={() => {
            if (temp_specific_days.has(i)) {
              temp_specific_days.delete(i);
            } else {
              temp_specific_days.add(i);
            }
          }}
        >
          {day}
        </button>
      {/each}
    </div>
  {/if}
</div>

<Modal bind:open={is_dialog_open} title="{t('repeat')}{temp_display_other || ` ${t('every')}…`}" {footer}>
  <div class="p-4 space-y-4">
    <div class="flex sm:flex-row gap-4">
      <div class="flex-1">
        <label for="repeat_interval_number" class="block text-sm font-semibold text-tertiary mb-1">{t("every")}</label>
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
        <label for="custom_interval" class="block text-sm font-semibold text-teriary mb-1">{t("period")}</label>
        <select
          id="custom_interval"
          bind:value={temp_other_interval}
          onchange={() => {
            error_message = "";
          }}
          class="bg-primary-20l p-2 w-full rounded-lg border border-primary appearance-none"
        >
          <option value="daily">{t("days")}</option>
          <option value="weekly">{t("weeks")}</option>
          <option value="monthly">{t("months")}</option>
          <option value="yearly">{t("years")}</option>
        </select>
      </div>
    </div>

    {#if error_message}
      <div class="text-error text-sm mt-1 flex justify-end" transition:slide>
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
      save();
    }}
    >
      <Check size={18} />
      <span>{t("confirm")}</span>
    </button>
  {/snippet}
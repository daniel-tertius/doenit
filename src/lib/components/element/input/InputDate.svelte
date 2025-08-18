<script>
  import { Times } from "$lib/icon";
  import { tick, untrack } from "svelte";
  import { language } from "$lib/services";

  /**
   * @typedef {Object} Props
   * @property {string} [date] - The date in ISO format (YYYY-MM-DD).
   * @property {boolean} [open_on_mount=false] - Whether to open the date picker on mount.
   * @property {boolean} [can_clear=true] - Whether the date can be cleared.
   * @property {(e: { value: string }) => void} [onchange] - Callback function when the date changes.
   */

  /** @type {Props & Record<string, *>}*/
  let { value, open_on_mount = false, can_clear = true, onchange = () => {}, ...rest } = $props();

  let is_focused = $state(false);

  /** @type {HTMLInputElement?} */
  let date_input = $state(null);

  const display_value = $derived(displayDate(value));
  const classes = $derived(rest.class || "");

  $effect(() => {
    if (!is_focused) return;

    untrack(async () => {
      await tick();
      if (!date_input) return;

      try {
        if (date_input && date_input !== document.activeElement) {
          date_input.focus();
        }
      } catch (error) {
        date_input.blur();
        console.error("DateInput: Error focusing date input", error);
      }
    });
  });

  $effect(() => {
    onchange({ value });
  });

  /**
   * Formats the date to a human-readable string.
   * @param {string | undefined} date
   * @return {string} The formatted date string.
   */
  function displayDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString(language.value === "af" ? "af-ZA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Focus and show the date picker for the end date input.
   * @param {HTMLInputElement} node - The input element for the end date.
   */
  function endDateMounted(node) {
    if (!open_on_mount) return;

    is_focused = true;
  }
</script>

{#if !is_focused}
  <div class="relative w-full">
    <input
      {...rest}
      id={undefined}
      use:endDateMounted
      type="text"
      value={display_value}
      onfocus={() => (is_focused = true)}
      class="bg-primary-20l p-2 w-full rounded-lg border border-dark-400 placeholder:text-tertiary-30d {classes}"
    />
    {#if can_clear && value}
      <button
        type="button"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-30d hover:text-primary-50l"
        onclick={(e) => {
          e.stopPropagation();
          value = "";
          is_focused = false;
        }}
      >
        <Times size={18} class="text-tertiary" />
      </button>
    {/if}
  </div>
{:else}
  <input
    {...rest}
    type="date"
    bind:this={date_input}
    bind:value
    onfocus={() => {
      tick().then(() => {
        if (date_input) date_input.showPicker();
      });
    }}
    onclick={(e) => {
      if (date_input) {
        e.stopPropagation();
        date_input.showPicker();
      }
    }}
    onchange={(e) => {
      if (!!value) is_focused = false;
    }}
    class="bg-primary-20l p-2 w-full rounded-lg border border-dark-400 placeholder:text-tertiary-30d appearance-none {classes}"
  />
{/if}

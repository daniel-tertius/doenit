<script>
  import { Times } from "$lib/icon";

  /**
   * @typedef {Object} Props
   * @property {string} [date] - The date in ISO format (YYYY-MM-DD).
   * @property {boolean} [open_on_mount=false] - Whether to open the date picker on mount.
   * @property {boolean} [can_clear=true] - Whether the date can be cleared.
   */

  /** @type {Props & Record<string, *>}*/
  let { value = $bindable(), open_on_mount = false, can_clear = true, ...rest } = $props();

  let is_focused = $state(false);

  /** @type {HTMLInputElement?} */
  let date_input = $state(null);

  const display_value = $derived(displayDate(value));
  const classes = $derived(rest.class || "");

  $effect(() => {
    if (!is_focused || !date_input) return;
    console.log("DateInput: value changed", date_input);
    date_input.focus();
    date_input.showPicker();
  });

  /**
   * Formats the date to a human-readable string.
   * @param {string | undefined} date
   * @return {string} The formatted date string.
   */
  function displayDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("af-ZA", {
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

  $inspect("DateInput", rest.id, " ", value, " ", display_value);
</script>

{#if !is_focused}
  <div class="relative">
    <input
      {...rest}
      id={undefined}
      use:endDateMounted
      type="text"
      value={display_value}
      onfocus={() => (is_focused = true)}
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d {classes}"
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
        <Times size={18} />
      </button>
    {/if}
  </div>
{:else}
  <input
    {...rest}
    type="date"
    bind:this={date_input}
    bind:value
    onclick={(e) => {
      e.stopPropagation();
      is_focused = false;
    }}
    onblur={() => (is_focused = false)}
    class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d appearance-none {classes}"
  />
{/if}

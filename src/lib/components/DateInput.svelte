<script>
  import { onMount } from "svelte";

  /**
   * @typedef {Object} Props
   * @property {string} [date] - The date in ISO format (YYYY-MM-DD).
   * @property {boolean} [openOnMount=false] - Whether to open the date picker on mount.
   */

  /** @type {Props & Record<string, *>}*/
  let { value = $bindable(), openOnMount, ...rest } = $props();

  let is_focused = $state(false);

  /** @type {HTMLInputElement?} */
  let date_input = $state(null);

  const display_value = $derived(displayDate(value));

  $effect(() => {
    if (!is_focused || !date_input) return;

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
    if (openOnMount) return;

    is_focused = true;
  }
</script>

{#if !is_focused}
  <input
    {...rest}
    use:endDateMounted
    type="text"
    value={display_value}
    onfocus={() => (is_focused = true)}
    class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d {rest.class || ''}"
  />
{:else}
  <input
    {...rest}
    type="date"
    onblur={() => (is_focused = false)}
    bind:this={date_input}
    bind:value
    class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d appearance-none {rest.class ||
      ''}"
  />
{/if}

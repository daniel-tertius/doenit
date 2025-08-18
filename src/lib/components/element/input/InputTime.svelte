<script>
  import { ButtonClear } from "$lib/components/element/button";
  import { tick, untrack } from "svelte";
  import { language } from "$lib/services";

  /**
   * @typedef {Object} Props
   * @property {string | null} value - The date in ISO format (YYYY-MM-DD).
   * @property {boolean} [can_clear=true] - Whether the date can be cleared.
   * @property {(e: { value: string | null }) => void} [onchange] - Callback function when the date changes.
   */

  /** @type {Props & Record<string, *>}*/
  let { value, can_clear = true, onchange = () => {}, ...rest } = $props();

  let is_focused = $state(false);

  /** @type {HTMLInputElement?} */
  let date_input = $state(null);

  const display_value = $derived(displayTime(value));

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
   * @param {string | null} time
   * @return {string} The formatted time string.
   */
  function displayTime(time) {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    let date = new Date(0);
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString(language.value === "af" ? "af-ZA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Clears the date input value.
   * @param {MouseEvent} e
   */
  function clearValue(e) {
    e.stopPropagation();
    is_focused = false;
    value = "";
  }
</script>

{#if !is_focused}
  <div class="relative w-full">
    <input
      {...rest}
      id={undefined}
      type="text"
      value={display_value}
      onfocus={() => (is_focused = true)}
      class={[
        {
          "bg-primary-20l p-2 w-full rounded-lg border border-dark-400 placeholder:text-tertiary-30d": true,
        },
        rest.classes ?? "",
      ]}
    />
    {#if can_clear && value}
      <ButtonClear onclick={clearValue} />
    {/if}
  </div>
{:else}
  <input
    {...rest}
    type="time"
    bind:this={date_input}
    bind:value
    onfocus={async () => {
      if (!date_input) return;
      await tick();

      date_input.showPicker();
    }}
    onclick={(e) => {
      e.stopPropagation();
      if (!date_input) return;

      date_input.showPicker();
    }}
    onchange={(e) => {
      if (!!value) is_focused = false;
    }}
    class={[
      {
        "bg-primary-20l p-2 w-full rounded-lg border border-dark-400 placeholder:text-tertiary-30d appearance-none": true,
      },
      rest.classes ?? "",
    ]}
  />
{/if}

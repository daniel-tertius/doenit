<script>
  import { tick } from "svelte";
  import { slide } from "svelte/transition";
  import DateInput from "./DateInput.svelte";

  let { start, end, onchange } = $props();

  let show_picker = $state(false);
  let start_date = $state("");
  let end_date = $state("");
  let start_time = $state("");
  let end_time = $state("");

  $effect(() => {
    onchange({ start_date, start_time, end_date, end_time });
  });

  function toggle() {
    show_picker = !show_picker;
  }

  function done() {
    show_picker = false;
    const from = start_date ? `${start_date}${start_time ? "T" + start_time : ""}` : "";
    const to = end_date ? `${end_date}${end_time ? "T" + end_time : ""}` : "";
    dispatchEvent(new CustomEvent("update", { detail: { from, to } }));
  }

  /**
   * Custom action to handle clicks outside the date picker.
   * @param {HTMLDivElement} node
   */
  function clickOutside(node) {
    /**
     * Handles click events outside the date picker.
     * @param {MouseEvent & { target: * }} event - The click event.
     */
    const handleClick = (event) => {
      if (!node.contains(event.target)) {
        show_picker = false;
      }
    };

    document.addEventListener("click", handleClick, true);
    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }
  const displayDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString("af-ZA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";
  };
</script>

<div use:clickOutside>
  <button type="button" onclick={toggle} class="px-3 py-2 rounded w-full text-left bg-primary-20l">
    {#if start_date || end_date}
      <div class="flex items-center">
        {#if start_date}
          <span>{displayDate(start_date)} {start_time ? start_time : ""}</span>
          <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17 8l4 4-4 4M3 12h18" />
          </svg>
        {/if}
        <span>{displayDate(end_date)} {end_time ? end_time : ""}</span>
      </div>
    {:else}
      Kies datum en tyd
    {/if}
  </button>

  {#if show_picker}
    <div class="absolute z-50 bg-primary-10l border rounded shadow-lg p-4 w-full mt-2" transition:slide>
      <div class="flex flex-col space-y-2">
        <div>
          <label for="start-date" class="block font-medium">Vanaf datum</label>
          <DateInput
            id="start-date"
            placeholder="Kies 'n begindatum"
            bind:value={start_date}
            max={end_date ? end_date : undefined}
          />

          {#if start_date}
            <input
              transition:slide
              id="start-time"
              type="time"
              bind:value={start_time}
              class="mt-1 border rounded px-2 py-1 w-full"
            />
          {/if}
        </div>

        <div>
          <label for="end-date" class="block font-medium">Tot datum</label>

          <DateInput openOnMount={!end_date} id="end-date" placeholder="Kies 'n sperdatum" bind:value={end_date} />
          {#if end_date}
            <input
              id="end-time"
              transition:slide
              type="time"
              bind:value={end_time}
              class="mt-1 border rounded px-2 py-1 w-full"
            />
          {/if}
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onclick={() => (show_picker = false)}
          class="px-3 py-1 bg-primary-30l text-tertiary rounded"
        >
          Kanselleer
        </button>
        <button type="button" onclick={done} class="px-3 py-1 bg-blue-600 text-white rounded">Gereed</button>
      </div>
    </div>
  {/if}
</div>

<script>
  import { slide } from "svelte/transition";
  import DateInput from "./DateInput.svelte";
  import { Check, Times } from "$lib/icon";
  import { untrack } from "svelte";

  let { start, end, onchange, error_message = $bindable() } = $props();

  const [sd, st] = start ? start.split(" ") : ["", ""];
  const [ed, et] = end ? end.split(" ") : ["", ""];

  let show_picker = $state(false);
  let start_date = $state(sd);
  let start_time = $state(st);
  let end_date = $state(ed);
  let end_time = $state(et);

  $effect(() => {
    onchange({ start_date, start_time, end_date, end_time });
  });

  $effect(() => {
    untrack(() => {
      error_message = "";
    });

    // Check that start date and time is before end date and time
    if (!start_date || !end_date) return;
    const startDateTime = new Date(`${start_date}T${start_time || "00:00"}`);
    const endDateTime = new Date(`${end_date}T${end_time || "23:59"}`);

    if (!!startDateTime && !!endDateTime && startDateTime > endDateTime) {
      error_message = "Begin datum moet voor eind datum wees.";
    }
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

  /**
   * @param {string} date
   */
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
  <button
    type="button"
    onclick={toggle}
    class="px-3 py-2 w-full text-left bg-primary-20l rounded-lg border border-primary"
    class:!border-red-500={!!error_message}
    class:!text-red-500={!!error_message}
    class:text-tertiary-20d={!start_date && !end_date}
  >
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

  {#if error_message && !show_picker}
    <div class="text-red-500 text-sm mt-1 flex justify-end">
      {error_message}
    </div>
  {/if}

  {#if show_picker}
    <div class="absolute z-50 bg-primary-10l border rounded shadow-lg p-4 w-full mt-2" transition:slide>
      <div class="flex flex-col space-y-2">
        <div>
          <label for="start-date" class="block font-medium">Vanaf datum</label>
          <DateInput
            id="start-date"
            placeholder="Kies 'n begindatum"
            class={!!error_message ? "border border-red-500 text-red-500" : ""}
            bind:value={start_date}
            max={end_date ? end_date : undefined}
          />

          {#if start_date}
            <div class="relative">
              <input
                transition:slide
                id="start-time"
                type="time"
                bind:value={start_time}
                placeholder="Kies 'n begin tyd"
                class="bg-primary-20l mt-1 p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d appearance-none {!!start_time &&
                error_message
                  ? 'border border-red-500 text-red-500'
                  : ''}"
              />
              {#if start_time}
                <button
                  type="button"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-30d hover:text-primary-50l"
                  onclick={() => (start_time = "")}
                >
                  <Times size={18} />
                </button>
              {/if}
            </div>
          {/if}
        </div>

        {#if error_message}
          <div class="text-red-500 text-sm mt-1 flex justify-end">
            {error_message}
          </div>
        {/if}

        <div>
          <label for="end-date" class="block font-medium">Tot datum</label>

          <DateInput open_on_mount={!end_date} id="end-date" placeholder="Kies 'n sperdatum" bind:value={end_date} />
          {#if end_date}
            <div class="relative">
              <input
                id="end-time"
                transition:slide
                type="time"
                placeholder="Kies 'n eind tyd"
                bind:value={end_time}
                class="bg-primary-20l mt-1 p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d appearance-none"
              />
              {#if end_time}
                <button
                  type="button"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-30d hover:text-primary-50l"
                  onclick={() => (end_time = "")}
                >
                  <Times size={18} />
                </button>
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-2">
        <button type="button" onclick={done} class="px-6 py-1 bg-blue-600 text-white rounded">
          <Check />
        </button>
      </div>
    </div>
  {/if}
</div>

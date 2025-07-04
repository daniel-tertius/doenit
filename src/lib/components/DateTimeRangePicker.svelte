<script>
  import { slide } from "svelte/transition";
  import DateInput from "./DateInput.svelte";
  import { Check, Times } from "$lib/icon";
  import { untrack } from "svelte";
  import ArrowLeft from "$lib/icon/ArrowLeft.svelte";

  let { start, end, onchange, error_message = $bindable() } = $props();

  $inspect(end);

  const [sd, st] = start ? start.split(" ") : ["", ""];
  const [ed, et] = end ? end.split(" ") : ["", ""];

  let show_picker = $state(false);
  let start_date = $state(sd);
  let start_time = $state(st);
  let end_date = $state(ed);
  let end_time = $state(et);

  $effect(() => {
    const ed = end?.split(" ")[0] || "";

    untrack(() => {
      if (ed !== end_date) {
        end_date = ed;
      }
    });
  });

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
    console.log("date", date);
    if (!date) return "";
    return new Date(date).toLocaleDateString("af-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
</script>

<div use:clickOutside>
  <button
    type="button"
    onclick={toggle}
    class={{
      "px-3 py-2 w-full text-left bg-t-primary-700 rounded-lg border border-primary-600": true,
      "border-error text-error": !!error_message,
      "text-t-secondary/60": !start_date && !end_date,
    }}
  >
    {#if start_date || end_date}
      <div class="flex items-center">
        {#if start_date}
          <span>{displayDate(start_date)} {start_time || ""}</span>
        {/if}

        {#if start_date && end_date}
          <ArrowLeft />
        {/if}

        <span>{displayDate(end_date)} {end_time || ""}</span>
      </div>
    {:else}
      Kies datum en tyd
    {/if}
  </button>

  {#if error_message && !show_picker}
    <div class="text-error text-sm mt-1 flex justify-end">
      {error_message}
    </div>
  {/if}

  {#if show_picker}
    <div class="absolute z-50 bg-primary-10l border rounded shadow-lg p-4 w-full mt-2" transition:slide>
      <div class="flex flex-col space-y-2">
        <div>
          <label for="start-date" class="block font-medium">Vanaf datum</label>
          <div class="flex gap-2 w-full">
            <DateInput
              id="start-date"
              placeholder="Kies 'n begindatum"
              class={!!error_message ? "border border-error text-error" : ""}
              value={start_date}
              max={end_date ? end_date : undefined}
              onchange={({ value }) => {
                start_date = value;
                if (!value) start_time = "";
              }}
            />

            {#if start_date}
              <div class="relative w-full">
                <input
                  transition:slide
                  id="start-time"
                  type="time"
                  bind:value={start_time}
                  placeholder="Kies 'n begin tyd"
                  class="bg-primary-20l p-2 w-full rounded-lg border border-primary-600 placeholder:text-tertiary-30d appearance-none {!!start_time &&
                  error_message
                    ? 'border border-error text-error'
                    : ''}"
                />
                {#if start_time}
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-30d hover:text-primary-50l"
                    onclick={() => (start_time = "")}
                  >
                    <Times size={18} class="text-tertiary" />
                  </button>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        {#if error_message}
          <div class="text-error text-sm mt-1 flex justify-end">
            {error_message}
          </div>
        {/if}

        <div>
          <label for="end-date" class="block font-medium">Tot datum</label>

          <div class="flex gap-2">
            <DateInput
              open_on_mount={!end_date}
              id="end-date"
              placeholder="Kies 'n sperdatum"
              value={end_date}
              onchange={({ value }) => {
                end_date = value;
                if (!value) end_time = "";
              }}
            />
            {#if end_date}
              <div class="relative w-full">
                <input
                  id="end-time"
                  transition:slide
                  type="time"
                  placeholder="Kies 'n eind tyd"
                  bind:value={end_time}
                  class="bg-primary-20l p-2 w-full rounded-lg border border-primary placeholder:text-tertiary-30d appearance-none"
                />
                {#if end_time}
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-30d hover:text-primary-50l"
                    onclick={() => (end_time = "")}
                  >
                    <Times size={18} class="text-tertiary" />
                  </button>
                {/if}
              </div>
            {/if}
          </div>
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

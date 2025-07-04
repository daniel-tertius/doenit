<script>
  import { onMount } from "svelte";
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";

  let { name = $bindable(), description = $bindable(), error_message = $bindable() } = $props();

  /** @type {HTMLElement?} */
  let name_input = $state(null);
  let show_description = $state(!!description);

  onMount(() => {
    init(name_input);
  });

  function init(el) {
    setTimeout(() => el?.focus());
  }
</script>

<div>
  <label class="font-bold" for="name">Wat moet gedoen word?</label>
  <div class="relative">
    <input
      id="name"
      bind:this={name_input}
      oninput={() => (error_message = "")}
      bind:value={name}
      type="text"
      placeholder="Gee jou taak 'n naam"
      class="bg-t-primary-700 p-2 w-full rounded-lg border border-primary-600 pr-7"
      class:border-error={!!error_message}
      class:placeholder:text-error-20l={!!error_message}
    />

    <button
      type="button"
      class="absolute top-1/2 -translate-y-[50%] right-1 h-[66.66%] rounded-full my-auto aspect-square flex justify-center items-center"
      onclick={() => (show_description = !show_description)}
    >
      <DownChevron
        class="{show_description ? '-rotate-180' : ''} {!!error_message ? 'text-error-20l' : 'text-tertiary-10l'}"
        size={18}
      />
    </button>
  </div>
  {#if error_message}
    <div class="text-error text-sm mt-1 flex justify-end">
      {error_message}
    </div>
  {/if}
</div>

{#if show_description}
  <div transition:slide>
    <label class="font-bold" for="description">Beskrywing</label>
    <textarea
      id="description"
      bind:value={description}
      placeholder="Gee meer besonderhede oor jou taak"
      rows="3"
      class="bg-t-primary-700 p-2 w-full rounded-lg border border-primary-600 resize-none min-h-18 max-h-40"
      style="field-sizing: content;"
    ></textarea>
  </div>
{/if}

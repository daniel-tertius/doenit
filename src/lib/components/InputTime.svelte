<script>
  import { Times } from "$lib/icon";
  import { slide } from "svelte/transition";

  let { value = $bindable(""), placeholder = "Kies 'n tyd", ...rest } = $props();

  let is_focused = $state(false);
  /** @type {HTMLInputElement?} */
  let time_input = $state(null);

  $effect(() => {
    if (!is_focused || !time_input) return;

    time_input.focus();
    time_input.showPicker();
  });
</script>

<div {...rest} transition:slide class="relative flex w-full transition-all duration-300 ease-in-out {rest.class || ''}">
  {#if !is_focused}
    <input
      type="text"
      {value}
      onfocus={() => (is_focused = true)}
      {placeholder}
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary-600 placeholder:text-tertiary-30d"
    />
  {:else}
    <input
      type="time"
      onblur={() => (is_focused = false)}
      bind:this={time_input}
      bind:value
      class="bg-primary-20l p-2 w-full rounded-lg border border-primary-600 placeholder:text-tertiary-30d appearance-none"
    />
  {/if}

  {#if value}
    <button type="button" onclick={() => (value = null)} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
      <Times class="text-tertiary" size={18} />
    </button>
  {/if}
</div>

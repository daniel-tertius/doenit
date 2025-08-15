<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";
  import InputText from "./element/input/InputText.svelte";

  let { name = $bindable(), description = $bindable(), error_message = $bindable() } = $props();

  let show_description = $state(!!description);
</script>

<div>
  <label class="font-bold" for="name">Wat moet gedoen word?</label>
  <div class="flex gap-1">
    <InputText
      id="name"
      bind:value={name}
      focus_on_mount
      oninput={() => (error_message = "")}
      placeholder="Wat moet gedoen word?"
      class={{
        "bg-t-primary-700 p-2 w-full rounded-lg border border-dark-400 pr-7": true,
        "border-error": !!error_message,
        "placeholder:text-error-20l": !!error_message,
      }}
    />

    <button
      type="button"
      class="rounded-full my-auto aspect-square flex justify-center items-center h-[42px] w-[42px] bg-t-primary-700"
      onclick={() => (show_description = !show_description)}
    >
      <DownChevron class="text-t-secondary {show_description ? '-rotate-180' : ''}" size={18} />
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
      class="bg-t-primary-700 p-2 w-full rounded-lg border border-dark-400 resize-none min-h-18 max-h-40"
      style="field-sizing: content;"
    ></textarea>
  </div>
{/if}

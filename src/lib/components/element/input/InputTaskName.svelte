<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";
  import InputText from "./InputText.svelte";
  import { t } from "$lib/services/language.svelte";

  let { name = $bindable(), description = $bindable(), error_message = $bindable() } = $props();

  let show_description = $state(!!description);
</script>

<div>
  <label class="font-bold" for="name">{t("what_needs_to_be_done")}</label>
  <div class="grid grid-cols-[auto_48px] gap-2">
    <InputText
      id="name"
      bind:value={name}
      focus_on_mount
      oninput={() => (error_message = "")}
      placeholder={t("what_needs_to_be_done")}
      class={{
        "p-2 w-full rounded-lg border": true,
        "border-error": !!error_message,
        "placeholder:text-error": !!error_message,
      }}
    />

    <button
      type="button"
      class="rounded-full border border-default my-auto aspect-square flex justify-center items-center bg-card"
      onclick={() => (show_description = !show_description)}
    >
      <DownChevron class={show_description ? "-rotate-180" : ""} size={18} />
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
    <label class="font-bold" for="description">{t("description")}</label>
    <textarea
      id="description"
      bind:value={description}
      placeholder={t("description_placeholder")}
      rows="3"
      class="bg-card p-2 w-full rounded-lg border border-default resize-none max-h-36"
      style="field-sizing: content;"
    ></textarea>
  </div>
{/if}

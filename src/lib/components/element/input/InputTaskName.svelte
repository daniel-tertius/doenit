<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";
  import InputText from "./InputText.svelte";
  import { t } from "$lib/services/language.svelte";

  let { name = $bindable(), description = $bindable(), error_message = $bindable() } = $props();

  let show_description = $state(!!description);
</script>

<div>
  <span class="font-bold">{t("what_needs_to_be_done")}</span>
  <div class="grid grid-cols-[auto_48px] gap-2">
    <InputText
      bind:value={name}
      focus_on_mount
      oninput={() => (error_message = "")}
      placeholder={t("what_needs_to_be_done")}
      class={{
        "p-2 w-full rounded-lg border": true,
        "placeholder:text-error! border-error! bg-error/20!": !!error_message,
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
</div>

{#if show_description}
  <div transition:slide>
    <label class="font-bold" for="description">{t("description")}</label>
    <textarea
      id="description"
      bind:value={description}
      placeholder={t("description_placeholder")}
      rows="3"
      class="bg-card p-2 w-full rounded-lg border border-default resize-none min-h-20 max-h-36 outline-none focus:ring-1 focus:ring-primary"
      style="field-sizing: content;"
    ></textarea>
  </div>
{/if}

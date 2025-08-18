<script>
  import { displayDateShort } from "$lib";
  import { slide } from "svelte/transition";
  import { t } from "$lib/services/Language.svelte";

  let { date = $bindable() } = $props();
</script>

{#if !date}
  {@const today = new Date()}
  {@const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))}
  {@const in_a_week = new Date(new Date().setDate(new Date().getDate() + 7))}
  {@const in_a_month = new Date(new Date().setMonth(new Date().getMonth() + 1))}

  <div class="flex gap-2 mt-2" transition:slide>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = today.toLocaleDateString("en-CA");
      }}
    >
      <span>{t("today")}</span>
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(today)}</div>
    </button>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = tomorrow.toLocaleDateString("en-CA");
      }}
    >
      {t("tomorrow")}
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(tomorrow)}</div>
    </button>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = in_a_week.toLocaleDateString("en-CA");
      }}
    >
      {t("in_a_week")}
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(in_a_week)}</div>
    </button>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = in_a_month.toLocaleDateString("en-CA");
      }}
    >
      {t("in_a_month")}
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(in_a_month)}</div>
    </button>
  </div>
{/if}

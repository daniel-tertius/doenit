<script>
  import { displayDateShort } from "$lib";
  import { slide } from "svelte/transition";

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
      <span>Vandag</span>
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(today)}</div>
    </button>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = tomorrow.toLocaleDateString("en-CA");
      }}
    >
      Môre
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(tomorrow)}</div>
    </button>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = in_a_week.toLocaleDateString("en-CA");
      }}
    >
      Oor 'n week
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(in_a_week)}</div>
    </button>
    <button
      type="button"
      class="bg-t-primary-700 p-1 rounded-lg border border-dark-400 w-full text-sm shadow-sm"
      onclick={() => {
        date = in_a_month.toLocaleDateString("en-CA");
      }}
    >
      Oor 'n maand
      <div class="text-t-secondary/60 text-[12px]">{displayDateShort(in_a_month)}</div>
    </button>
  </div>
{/if}

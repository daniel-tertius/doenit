<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";

  let { children, label } = $props();

  let show = $state(false);
</script>

<div class="bg-t-primary-600 rounded-lg">
  <button
    type="button"
    class="focus:outline-none w-full p-4 flex items-center justify-between hover:bg-t-primary-700 active:bg-t-primary-700 rounded-lg transition-colors"
    onclick={() => (show = !show)}
  >
    <span class="font-semibold">{label}</span>
    <DownChevron class="transition-transform duration-200 {show ? 'rotate-180' : ''}" size={20} />
  </button>

  {#if show}
    <div transition:slide class="px-4 pb-4 space-y-3">
      {@render children()}
    </div>
  {/if}
</div>

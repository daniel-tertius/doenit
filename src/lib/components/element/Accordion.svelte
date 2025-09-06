<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {string} label
   * @property {boolean} [show=false]
   * @property {import("svelte").Snippet} children
   */

  /** @type {Props} */
  let { children, label, show = $bindable(true) } = $props();
</script>

<div class="bg-surface rounded-lg">
  <button
    type="button"
    aria-label="Accordion toggle"
    aria-expanded={show}
    class="focus:outline-none w-full p-4 flex items-center justify-between hover:bg-t-primary-700 active:bg-t-primary-700 rounded-lg transition-colors"
    onclick={() => (show = !show)}
  >
    <span class="font-semibold text-lg">{label}</span>
    <DownChevron class="text-xl {show ? 'rotate-180' : ''}" />
  </button>

  {#if show}
    <div transition:slide class="px-4 pb-4 space-y-3">
      {@render children()}
    </div>
  {/if}
</div>

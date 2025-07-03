<script>
  import { Clock } from "$lib/icon";
  import Sync from "$lib/icon/Sync.svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  /** @typedef {Object} Props
   * @property {boolean} is_complete
   * @property {boolean} is_past
   * @property {boolean} is_ongoing
   * @property {boolean} is_selected
   * @property {boolean} is_repeating
   */

  /** @type {Props & Record<string, any>} */
  const { is_complete, is_past, is_ongoing, is_selected, is_repeating, children } = $props();
</script>

<!-- class:bg-primary={!is_complete && !is_past && !is_ongoing} -->
<!-- class:bg-primary-10l={is_complete} -->
<!-- class:bg-primary-20l={is_selected && !is_complete} -->
<div
  class="text-left rounded-full px-1 w-fit flex items-center h-fit gap-1 opacity-80"
  class:bg-error-30d={is_past && !is_complete && !is_selected}
  class:bg-active-30d={is_ongoing && !is_complete}
  class:opacity-50={is_complete}
>
  <span class="flex gap-1 items-center">
    <div class="w-4 h-4">
      <Clock size={16} />
    </div>
    {@render children?.()}
  </span>

  {#if is_repeating && !is_complete}
    <Sync size={12} />
  {/if}
</div>

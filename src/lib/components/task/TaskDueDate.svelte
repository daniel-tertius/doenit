<script>
  import { Clock, Sync } from "$lib/icon";

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

<div
  class={{
    "text-left rounded-full px-2 w-fit flex items-center h-fit gap-1 opacity-80": true,
    "bg-error/80": is_past && !is_complete && !is_selected && !is_ongoing,
    "bg-success/80": is_ongoing && !is_complete && !is_selected,
    "bg-primary": is_selected,
    "bg-surface": is_complete || (!is_past && !is_ongoing && !is_complete && !is_selected),
  }}
>
  <span class="flex gap-1 items-center">
    <Clock class="w-sm h-sm flex-shrink-0" />
    {@render children?.()}
  </span>

  {#if is_repeating && !is_complete}
    <Sync class="w-xs h-xs" />
  {/if}
</div>

<script>
  import { Clock, Sync } from "$lib/icon";

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

<div
  class={{
    "text-left rounded-full px-1 w-fit flex items-center h-fit gap-1 opacity-80": true,
    "bg-error/80": is_past && !is_complete && !is_selected,
    "bg-active/80": is_ongoing && !is_complete,
    "bg-t-primary-400": !is_past && !is_ongoing && !is_complete && !is_selected,
    "opacity-50! bg-t-primary-300": is_complete,
  }}
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

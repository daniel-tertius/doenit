<script>
  import { untrack } from "svelte";

  let { children, tabs_length, active_tab_index, onchangetab, ...rest } = $props();

  /** @type {HTMLDivElement} */
  let element;

  /**
   * Initialize the tab container.
   * @param {HTMLDivElement} node
   */
  function snapToActiveTab(node) {
    if (!node || tabs_length < 1) return;

    const tab_width = node.scrollWidth / tabs_length;

    node.scrollTo({
      left: tab_width * active_tab_index,
      behavior: "smooth",
    });
  }

  /**
   * Initialize the tab container.
   * @param {HTMLDivElement} node
   */
  function init(node) {
    element = node;
    snapToActiveTab(node);
  }

  function handleScroll() {
    if (!element || tabs_length < 1) return;

    const tabWidth = element.scrollWidth / tabs_length;
    const index = Math.round(element.scrollLeft / tabWidth);
    if (onchangetab && index !== active_tab_index) {
      onchangetab(index);
    }
  }

  $effect(() => {
    active_tab_index;

    untrack(() => {
      if (!element) return;

      snapToActiveTab(element);
    });
  });
</script>

<div
  {...rest}
  use:init
  onscrollend={async () => {
    handleScroll();
  }}
  class="scrollbar-none z-1 flex h-full overflow-x-auto snap-x snap-mandatory space-x-2 {rest.class || ''}"
>
  {@render children()}
</div>

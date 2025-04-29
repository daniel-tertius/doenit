<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte/elements').MouseEventHandler<HTMLButtonElement>} onclick
   * @property {string} class
   * @property {string} style
   * @property {'medium' | 'small'} [size='medium']
   * @property {*} children
   */

  /** @type {Props} */
  let { onclick, children, size = "medium", ...rest } = $props();

  function getSize() {
    switch (size) {
      case "small":
        return "w-10 h-10 p-2";
      case "medium":
        return "w-14 h-14 p-3";
      default:
        return "w-14 h-14 p-3";
    }
  }

  const size_classes = getSize();
</script>

<button
  {onclick}
  type="button"
  aria-label="Create new item"
  class="fixed rounded-full flex items-center justify-center shadow-lg {size_classes} {rest.class}"
  style={rest.style}
>
  {@render children()}
</button>

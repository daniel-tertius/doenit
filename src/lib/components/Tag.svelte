<script>
  /**
   * @typedef {Object} Props
   * @property {boolean} is_selected
   * @property {() => void} onclick
   */

  /** @type {Props & Record<string, any>} */
  const { is_selected, onclick, children, ...rest } = $props();
</script>

<button
  type="button"
  aria-label="tag"
  {onclick}
  class={[
    {
      "px-3 py-1 gap-1 border text-nowrap flex items-center justify-center w-fit rounded-full": true,
      "bg-primary/20 border-primary text-alt": is_selected,
      "bg-card border-default": !is_selected,
    },
    rest.class || "",
  ]}
>
  {@render children()}
</button>

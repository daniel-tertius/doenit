<script>
  /**
   * @typedef {Object} Props
   * @property {*} children
   */

  /** @type {Props & Record<string, any>} */
  const { children, ...rest } = $props();
</script>

<div class="snap-start h-full flex">
  <div {...rest} class="w-screen grow overflow-y-hidden flex flex-col {rest.class || ''}">
    {@render children()}
  </div>
</div>

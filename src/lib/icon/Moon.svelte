<script>
  /**
   * Moon icon component for Svelte.
   * @typedef {Object} Props
   * @property {number} [size=24] - The size of the icon.
   * @property {string} [color="currentColor"] - The color of the icon.
   * @property {'filled' | 'outline'} [variant="filled"] - The variant of the icon (e.g., "filled", "outline").
   * @property {Object} [rest] - Additional properties
   */

  /** @type {Props} */
  let { size = 24, color = "currentColor", variant = "filled", ...rest } = $props();
</script>

{#if variant === "filled"}
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
    </svg>
{:else if variant === "outline"}
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
{/if}

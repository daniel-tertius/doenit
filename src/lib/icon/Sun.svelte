<script>
  /**
   * Moon icon component for Svelte.
   * @typedef {Object} Props
   * @property {number} [size=24] - The size of the icon.
   * @property {string} [color="currentColor"] - The color of the icon.
   * @property {'filled' | 'outline'} [variant="filled"] - The variant of the icon (e.g., "filled", "outline").
   * @property {Object} [rest] - Additional properties
   */

  /** @type {Props & Record<string, any>} */
  const { color = "currentColor", variant = "filled", ...rest } = $props();
</script>

{#if variant === "filled"}
  <svg viewBox="0 0 24 24" fill={color} style="width: 1em; height: 1em;" {...rest}>
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
{:else}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="width: 1em; height: 1em;"
    {...rest}
  >
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
    />
  </svg>
{/if}

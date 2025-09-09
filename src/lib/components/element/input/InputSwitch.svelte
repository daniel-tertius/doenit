<script>
  /**
   * Toggle component for a switch-like button.
   * @typedef {Object} Props
   * @property {boolean} value - The current state of the toggle (on/off).
   */

  /** @type {Props} */
  let { value = $bindable(), ...rest } = $props();
</script>

<button
  {...rest}
  type="button"
  class="relative w-14 h-8 rounded-full transition-colors {value ? 'bg-primary' : 'bg-card'}"
  onclick={() => (value = !value)}
>
  <div
    class={[
      "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform",
      value ? "translate-x-7" : "translate-x-1",
    ]}
  ></div>
</button>

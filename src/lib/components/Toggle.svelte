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
  class="relative w-11 h-6 rounded-full transition-colors {value ? 'bg-blue-600' : 'bg-primary-30l'}"
  onclick={() => (value = !value)}
>
  <div
    class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform {value
      ? 'translate-x-5'
      : 'translate-x-0.5'}"
  ></div>
</button>

<script>
  import Modal from "../modal/Modal.svelte";

  /**
   * @typedef {Object} Props
   * @property {number} [repeat_interval_number=2] - The number of intervals for the repeat.
   * @property {string} [other_period="daily"] - The type of repeat interval (daily, weekly, monthly, yearly).
   * @property {boolean} [open=false] - Whether the modal is open.
   * @property {() => *} [onclose] - Callback function to call when the modal is closed.
   */

  /** @type {Props} */
  let {
    repeat_interval_number = $bindable(2),
    other_period = $bindable("daily"),
    open = $bindable(),
    onclose,
  } = $props();

  let temp_other_period = $state(other_period);
  let temp_repeat_interval_number = $state(Math.max(2, repeat_interval_number));
</script>

<Modal bind:open title="Aangepaste Herhaling" {footer} {onclose}>
  <div class="p-4 space-y-4">
    <div class="flex sm:flex-row gap-4">
      <div class="flex-1">
        <label for="repeat_interval_number" class="block text-sm font-medium text-gray-900 mb-1">Elke</label>
        <input
          id="repeat_interval_number"
          type="number"
          min="2"
          bind:value={temp_repeat_interval_number}
          class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51]"
        />
      </div>
      <div class="flex-1">
        <label for="custom_interval" class="block text-sm font-medium text-gray-900 mb-1">Periode</label>
        <select
          id="custom_interval"
          bind:value={temp_other_period}
          class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51]"
        >
          <option value="daily">Dae</option>
          <option value="weekly">Weke</option>
          <option value="monthly">Maande</option>
          <option value="yearly">Jare</option>
        </select>
      </div>
    </div>
  </div>
</Modal>

{#snippet footer()}
  <button
    class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
    onclick={() => {
      if (temp_repeat_interval_number < 2) {
        temp_repeat_interval_number = 2;
      }

      repeat_interval_number = temp_repeat_interval_number;
      other_period = temp_other_period;

      if (onclose) onclose();
      open = false;
    }}
  >
    Bevestig
  </button>
{/snippet}

<script>
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Check, DownloadCloud } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";

  /**
   * @typedef {Object} Props
   * @property {boolean} [is_loading=false] - Indicates if the button is in a loading state.
   * @property {() => Promise<void>} [onclick] - Function to
   */

  /** @type {Props} */
  let { is_loading = $bindable(false), onclick } = $props();

  let is_open = $state(false);
  async function handleClick() {
    is_loading = true;
    is_open = false;
    if (onclick) await onclick();
    is_loading = false;
  }
</script>

<button
  type="button"
  disabled={is_loading}
  class="w-full h-12 mt-4 p-2 bg-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
  onclick={() => (is_open = true)}
>
  <DownloadCloud class="text-xl" />
  {is_loading ? t("backup_in_progress") : t("backup_now")}
</button>

<Modal class="p-6" bind:is_open onclose={() => (is_open = false)}>
  <!-- TODO: Translation -->
  <h2 class="text-lg font-semibold mb-4">Wil u 'n rugsteun skep?</h2>
  <!-- TODO: Wys wanneer dit laas gedoen is (as dit voorheen gedoen was). -->
  <div class="flex justify-end space-x-4">
    <button
      type="button"
      aria-label="Rugsteun"
      class="text-md items-center justify-center text-white px-4 py-2 flex gap-1 bg-primary rounded-lg"
      onclick={handleClick}
    >
      <Check />
      <span>Bevestig</span>
    </button>
  </div>
</Modal>

<script>
  import Modal from "$lib/components/modal/Modal.svelte";
  import { t } from "$lib/services/language.svelte";
  import { Check, DownloadCloud, Loading } from "$lib/icon";
  import Backup from "$lib/services/backup.svelte";

  /**
   * @typedef {Object} Props
   * @property {boolean} [is_loading=false] - Indicates if the button is in a loading state.
   * @property {() => Promise<void>} [onclick] - Function to be called when the button is clicked.
   */

  /** @type {Props & Record<string, any>} */
  let { is_loading = $bindable(false), onclick, ...rest } = $props();

  let is_open = $state(false);
  let is_backing_up = $state(false);

  async function handleClick() {
    is_loading = true;
    is_backing_up = true;
    is_open = false;
    if (onclick) await onclick();
    is_loading = false;
    is_backing_up = false;
  }
</script>

<button
  {...rest}
  class={[
    "p-2 rounded-lg text-alt grid grid-cols-[min-content_auto] gap-2 items-center min-h-12 w-full text-start",
    is_loading && "bg-primary/80",
    !is_loading && "bg-primary text-alt",
    rest.class || "",
  ]}
  type="button"
  disabled={is_loading}
  onclick={() => (is_open = true)}
>
  {#if is_backing_up}
    <Loading class="text-3xl mx-1 my-auto" />
  {:else}
    <DownloadCloud class="text-3xl mx-1 my-auto" />
  {/if}
  <div>
    <p class="font-medium">{is_backing_up ? t("backup_in_progress") : t("backup_now")}</p>
    <p class="text-sm">Laas: {Backup.last_backup_at}</p>
  </div>
</button>

<Modal class="p-6" bind:is_open onclose={() => (is_open = false)}>
  <h2 class="text-lg font-semibold mb-4">{t("backup_question")}</h2>
  <!-- TODO: Wys wanneer dit laas gedoen is (as dit voorheen gedoen was). -->
  <div class="flex justify-end space-x-4">
    <button
      type="submit"
      aria-label={t("backup_aria")}
      class="text-md items-center justify-center text-alt px-4 py-2 flex gap-1 bg-primary rounded-lg"
      onclick={handleClick}
    >
      <Check />
      <span>{t("confirm")}</span>
    </button>
  </div>
</Modal>

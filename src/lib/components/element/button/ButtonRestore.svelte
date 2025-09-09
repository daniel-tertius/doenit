<script>
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Info, Restore, Trash } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import DateUtil from "$lib/DateUtil";
  import { slide } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {boolean} [is_loading=false] - Indicates if the button is in a loading state.
   * @property {(manifest: BackupManifest) => Promise<void>} [onclick] - Function to call when the button is clicked.
   * @property {() => Promise<BackupManifest[]>} getBackups - Function to call to get the list of backups.
   */

  /** @type {Props & Record<string, any>} */
  let { is_loading = $bindable(false), onclick, getBackups, ...rest } = $props();

  let is_open = $state(false);
  /** @type {BackupManifest[]} */
  let backups = $state([]);
  /** @type {BackupManifest?} */
  let selected_backup = $state(null);

  async function handleClick() {
    if (!selected_backup) return;

    is_loading = true;
    is_open = false;
    if (onclick) await onclick(selected_backup);
    is_loading = false;
  }

  async function handleOpen() {
    if (!getBackups) throw Error("getBackups function is required");
    if (is_loading) return;

    backups = await getBackups();
    // backups = [
    //   { id: "1", timestamp: Date.now() - 86400000 },
    //   { id: "2", timestamp: Date.now() - 43200000 },
    //   { id: "3", timestamp: Date.now() - 21600000 },
    //   { id: "4", timestamp: Date.now() - 21600000 },
    //   { id: "5", timestamp: Date.now() - 21600000 },
    // ];

    selected_backup = null;
    is_open = true;
  }
</script>

<button
  {...rest}
  class={[
    "p-2 bg-primary text-white rounded-lg grid grid-cols-[min-content_auto] gap-2 items-center min-h-12 w-full text-start",
    rest.class || "",
  ]}
  type="button"
  disabled={is_loading}
  onclick={() => handleOpen()}
>
  <Restore class="text-3xl mx-1 my-auto" />

  <div>
    <p class="font-medium">{is_loading ? t("restore_in_progress") : t("restore_from_backup")}</p>
  </div>
</button>

<Modal bind:is_open onclose={() => (is_open = false)}>
  <!-- TODO: Translation -->
  <div class="mb-4">
    <h2 class="text-lg font-semibold">Herstel Data</h2>
    <p class="text-muted">Kies 'n tyd om op terug te val.</p>
  </div>

  <div class="space-y-2 overflow-y-auto max-h-full">
    {#each backups as backup, index (index)}
      {@const is_selected = selected_backup?.timestamp === backup.timestamp}
      <button
        type="button"
        onclick={() => (selected_backup = backup)}
        class={[
          "w-full text-left font-medium p-4 border rounded-lg flex items-center justify-between",
          is_selected && "bg-primary/20 border-primary text-primary",
        ]}
      >
        {DateUtil.format(new Date(backup.timestamp), "DD MMM YYYY, HH:mm")}
        <Restore class={["text-lg", is_selected && "text-primary"]} />
      </button>
    {:else}
      <p class="text-sm text-muted">Geen beskikbare rugsteun nie.</p>
    {/each}
  </div>

  {#if backups.length > 2}
    <div class="relative text-sm bg-warning/10 border border-warning rounded-lg p-3 space-y-2 mt-4">
      <span class="text-sm flex flex-wrap gap-1">
        <Info class="text-xl text-warning" />
        {#each "Net die laaste vyf rugsteunlêers word gestoor.".split(" ") as word}
          <p>{word}</p>
        {/each}
      </span>
    </div>
  {/if}

  {#if selected_backup}
    <div transition:slide class="text-sm bg-error/10 border border-error rounded-lg p-3 space-y-2 mt-4">
      <span class="text-sm flex flex-col gap-1">
        <span class="flex items-center gap-2">
          <Trash class="text-error text-xl" />
          <p class="font-semibold text-lg text-error">Waarskuwing</p>
        </span>

        <p class="font-medium">Bestaande data sal vervang word met die rugsteun se data.</p>
      </span>
    </div>
  {/if}

  {#if selected_backup}
    <button
      type="button"
      disabled={is_loading}
      class="w-full mt-4 h-12 p-2 bg-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      transition:slide
      onclick={handleClick}
    >
      {#if selected_backup}
        <Restore class="text-xl" />
        {is_loading ? t("restore_in_progress") : t("confirm_restore")}
      {:else}
        <Info class="text-xl" />
        Kies 'n rugsteun om te herstel
      {/if}
    </button>
  {/if}
</Modal>

<script>
  import { Download, Google, Loading, Upload } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { auth } from "$lib/services/auth.svelte";
  import Accordion from "$lib/components/element/Accordion.svelte";
  import { ButtonBackup, ButtonRestore } from "$lib/components/element/button";
  import Backup from "$lib/services/backup.svelte";
  import { InputSwitch } from "$lib/components/element/input";

  let is_loading = $state(false);

  async function createBackup() {
    const result = await Backup.createBackup();
    if (!result.success) {
      alert(t("backup_error") + " " + result.error_message);
      return;
    }

    alert(t("backup_success"));
  }

  /**
   *
   * @param {BackupManifest} manifest
   */
  async function restoreBackup(manifest) {
    const result = await Backup.restoreBackup(manifest);
    if (!result.success) {
      alert(t("restore_error") + " " + result.error_message);
      return;
    }

    alert(t("restore_success"));
  }

  async function handleGoogleVerification() {
    is_loading = true;
    await auth.signInWithGoogle();
    is_loading = false;
  }

  /**
   * Fetches the list of available backups.
   * @returns {Promise<BackupManifest[]>} - A promise that resolves to an array of BackupManifest objects.
   */
  async function handleGetBackups() {
    const result = await Backup.listBackups();
    if (!result.success) return [];

    return result.data;
  }
</script>

<Accordion label={t("backup_label")}>
  {#if !auth.user}
    <div class="flex flex-col items-center justify-center text-center space-y-6 px-4 py-8">
      <!-- Illustration SVG -->
      <Download class="text-[120px] text-blue-500" />

      <!-- Friendly heading -->
      <!-- TODO: Translation -->
      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-t-secondary">Hou jou data veilig!</h3>
        <p class="text-sm text-t-secondary/70 max-w-sm leading-relaxed">
          Teken met Google in om jou take en kategorieë te rugsteun. So kan jy jou data herstel as jy van toestel
          verander.
        </p>
      </div>

      <!-- Call to action button -->
      <button
        onclick={() => handleGoogleVerification()}
        disabled={is_loading}
        class="w-full bg-blue-600 hover:bg-blue-700 h-12 text-white flex items-center justify-center px-6 py-3 rounded-lg shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-3"
      >
        {#if is_loading}
          <Loading />
          <span>Besig om te verifieer...</span>
        {:else}
          <Google size={18} />
          <span>Teken in met Google</span>
        {/if}
      </button>
    </div>
  {:else}
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="font-medium text-t-secondary">{t("automatic_backup")}</p>
        </div>
        <InputSwitch bind:value={Backup.automatic_backup} />
      </div>
      <ButtonBackup bind:is_loading={Backup.is_loading} onclick={createBackup} />
      <ButtonRestore bind:is_loading={Backup.is_loading} onclick={restoreBackup} getBackups={handleGetBackups} />
    </div>
  {/if}
</Accordion>

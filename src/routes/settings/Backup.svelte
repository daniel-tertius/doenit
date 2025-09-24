<script>
  import { Download, Google, Loading, Upload } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { auth } from "$lib/services/auth.svelte";
  import Accordion from "$lib/components/element/Accordion.svelte";
  import { ButtonBackup, ButtonRestore } from "$lib/components/element/button";
  import Backup from "$lib/services/backup.svelte";
  import { InputSwitch } from "$lib/components/element/input";

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

  /**
   * Fetches the list of available backups.
   * @returns {Promise<BackupManifest | null>} - Queries and returns the last backup made.
   */
  async function handleBackup() {
    const result = await Backup.getBackup();
    if (!result.success) {
      alert(t("backup_problem") + " " + result.error_message);
      return null;
    }

    return result.data;
  }
</script>

<Accordion label={t("backup_label")} disabled={!auth.is_logged_in} disabled_message={t("log_in_first")}>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="font-medium text-t-secondary">{t("automatic_backup")}</p>
      </div>
      <InputSwitch bind:value={Backup.automatic_backup} />
    </div>

    <ButtonBackup bind:is_loading={Backup.is_loading} onclick={createBackup} class="mb-4" />
    <ButtonRestore bind:is_loading={Backup.is_loading} onclick={restoreBackup} getBackup={handleBackup} />
  </div>
</Accordion>

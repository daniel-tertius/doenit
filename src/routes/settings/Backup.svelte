<script>
  import { Download, Google, Loading, Upload } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { auth } from "$lib/services/auth.svelte";
  import Accordion from "$lib/components/element/Accordion.svelte";
  import { ButtonBackup } from "$lib/components/element/button";
  import Backup from "$lib/services/backup.svelte";

  let is_creating_backup = $state(false);
  let is_restoring = $state(false);
  let is_loading = $state(false);

  async function createBackup() {
    is_creating_backup = true;
    const result = await Backup.createBackup();
    if (result.success) {
      alert(t("backup_success"));
    }

    is_creating_backup = false;
  }

  async function restoreBackup() {
    if (is_restoring) return;

    const confirmed = confirm(t("restore_confirmation"));
    if (!confirmed) return;

    is_restoring = true;
    try {
      // const result = await backup.restoreBackup();
      // if (result.success) {
      //   alert(t("restore_success"));
      // }
    } catch (error) {
      console.error("Restore error:", error);
      alert(t("restore_error") + " " + error.message);
    } finally {
      is_restoring = false;
    }
  }

  async function handleGoogleVerification() {
    is_loading = true;
    await auth.signInWithGoogle();
    is_loading = false;
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

      <!-- Optional note -->
      <p class="text-xs text-t-secondary/50 max-w-xs">
        Hierdie is heeltemal opsioneel. Jy kan die app sonder intekening gebruik.
      </p>
    </div>
  {:else}
    <ButtonBackup bind:is_loading={is_creating_backup} onclick={createBackup} />
    <!-- <button
      type="button"
      disabled={is_restoring || is_creating_backup}
      class="w-full h-12 p-2 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      onclick={restoreBackup}
    >
      <Upload class="text-xl" />
      {is_restoring ? t("restore_in_progress") : t("restore_from_backup")}
    </button> -->
  {/if}
</Accordion>

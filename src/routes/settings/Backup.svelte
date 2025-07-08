<script>
  import Details from "$lib/components/Details.svelte";
  import { backup } from "$lib/services";
  import { Loading } from "$lib/icon";
  import Google from "$lib/icon/Google.svelte";
  import { onMount } from "svelte";
  import { AuthService } from "$lib/services/auth";

  let isCreatingBackup = $state(false);
  let isRestoring = $state(false);
  let is_loading = $state(false);

  let token = $state(null);

  onMount(async () => {
    await backup.init();
    token = await AuthService.getAuthToken();
  });

  async function createBackup() {
    if (isCreatingBackup) return;

    isCreatingBackup = true;
    try {
      const result = await backup.createBackup();
      if (result.success) {
        alert("Rugsteun suksesvol geskep!");
      }
    } catch (error) {
      console.error("Backup error:", error);
      alert("Fout met rugsteun: " + error.message);
    } finally {
      isCreatingBackup = false;
    }
  }

  async function restoreBackup() {
    if (isRestoring) return;

    const confirmed = confirm("Is jy seker jy wil vanaf rugsteun herstel? Dit sal alle huidige data vervang.");
    if (!confirmed) return;

    isRestoring = true;
    try {
      // In a real implementation, you'd want to show a list of available backups
      // For now, we'll need the user to provide a backup ID
      const backupId = prompt("Voer rugsteun ID in:");
      if (!backupId) {
        isRestoring = false;
        return;
      }

      const result = await backup.restoreBackup(backupId);
      if (result.success) {
        alert("Data suksesvol herstel!");
        // Refresh the page or update the UI as needed
        window.location.reload();
      }
    } catch (error) {
      console.error("Restore error:", error);
      alert("Fout met herstel: " + error.message);
    } finally {
      isRestoring = false;
    }
  }

  async function handleGoogleVerification() {
    is_loading = true;
    await backup.verifyEmail();
    is_loading = false;
  }
</script>

<Details label="Rugsteun">
  <p class="p-2">Token: {token}</p>
  {#if !backup.email_address}
    <p>Om rugsteun te gebruik, moet jy eers jou e-posadres verifieer. te gaan.</p>

    <button
      onclick={handleGoogleVerification}
      disabled={is_loading}
      class="w-full bg-t-primary-700 text-t-secondary flex items-center justify-center px-4 py-3 rounded-md shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {#if is_loading}
        <Loading />
        Verifying...
      {:else}
        <Google size={18} class="mr-3" />
        Continue with Google
      {/if}
    </button>
  {:else}
    <!-- <div class="flex items-center justify-between">
      <span class="text-sm font-medium">Outomatiese rugsteun</span>
      <Toggle bind:value={backup.enabled} />
    </div> -->

    <button
      type="button"
      disabled={isCreatingBackup}
      class="w-full p-3 bg-blue-500 text-t-secondary rounded-lg hover:bg-blue-700"
      onclick={createBackup}
    >
      {isCreatingBackup ? "Besig met rugsteun..." : "Rugsteun nou"}
    </button>

    <button
      type="button"
      disabled={isRestoring}
      class="w-full p-3 bg-t-primary-700 text-t-secondary rounded-lg"
      onclick={restoreBackup}
    >
      {isRestoring ? "Besig met herstel..." : "Herstel vanaf rugsteun"}
    </button>

    <!-- Geverifieer as, verander? -->
    {#if backup.email_address}
      <div class="mt-2 p-3 bg-t-primary rounded-md">
        <p class="text-sm text-t-secondary-700 mb-1">Geverifieerde e-pos:</p>
        <p class="font-medium text-t-secondary-700">{backup.email_address}</p>
        <!-- Verander epos adres? -->
        <button type="button" class="mt-2 text-blue-600 hover:underline" onclick={handleGoogleVerification}>
          Verander e-posadres
        </button>
      </div>
    {/if}
  {/if}
</Details>

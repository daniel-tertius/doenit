<script>
  import Details from "$lib/components/Details.svelte";
  import { backup } from "$lib/services";
  import { Google, Loading } from "$lib/icon";
  import { onMount } from "svelte";

  let isCreatingBackup = $state(false);
  let isRestoring = $state(false);
  let is_loading = $state(false);

  onMount(async () => {
    await backup.init();
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
      const result = await backup.restoreBackup();
      if (result.success) {
        alert("Data suksesvol herstel!" + JSON.stringify(result.data));
      } else {
        alert("Herstel het misluk: " + result.error);
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
    try {
      await backup.verifyEmail();
    } catch (error) {
      console.error("Email verification failed:", error);
      alert("Fout met e-pos verifikasie: " + error.message);
    } finally {
      is_loading = false;
    }
  }
</script>

<Details label="Rugsteun">
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

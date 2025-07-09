<script>
  import { ContainerDetails } from "$lib/components/element/container";
  import { backup } from "$lib/services";
  import { Google, Loading } from "$lib/icon";
  import { onMount } from "svelte";
  import { data } from "$lib/Data.svelte";

  let is_creating_backup = $state(false);
  let is_restoring = $state(false);
  let is_loading = $state(false);

  onMount(async () => {
    await backup.init();
  });

  async function createBackup() {
    if (is_creating_backup) return;

    is_creating_backup = true;
    try {
      const result = await backup.createBackup();
      if (result.success) {
        alert("Rugsteun suksesvol geskep!");
      }
    } catch (error) {
      console.error("Backup error:", error);
      alert("Fout met rugsteun: " + error.message);
    } finally {
      is_creating_backup = false;
    }
  }

  async function restoreBackup() {
    if (is_restoring) return;

    const confirmed = confirm("Is jy seker jy wil vanaf rugsteun herstel? Dit sal alle huidige data vervang.");
    if (!confirmed) return;

    is_restoring = true;
    try {
      const result = await backup.restoreBackup();
      if (result.success) {
        await data.createCategories(result.data.categories);
        await data.createTasks(result.data.tasks);
      }
    } catch (error) {
      console.error("Restore error:", error);
      alert("Fout met herstel: " + error.message);
    } finally {
      is_restoring = false;
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

<ContainerDetails label="Rugsteun">
  {#if !backup.email_address}
    <p>Om rugsteun te gebruik, moet jy eers jou e-posadres verifieer.</p>

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
        Verifieer e-posadres met Google
      {/if}
    </button>
  {:else}
    <button
      type="button"
      disabled={is_creating_backup}
      class="w-full p-3 bg-blue-500 text-t-secondary rounded-lg hover:bg-blue-700"
      onclick={createBackup}
    >
      {is_creating_backup ? "Besig met rugsteun..." : "Rugsteun nou"}
    </button>

    <button
      type="button"
      disabled={is_restoring}
      class="w-full p-3 bg-t-primary-700 text-t-secondary rounded-lg"
      onclick={restoreBackup}
    >
      {is_restoring ? "Besig met herstel..." : "Herstel vanaf rugsteun"}
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
</ContainerDetails>

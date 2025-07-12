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

    const confirmed = confirm("Is jy seker jy wil vanaf rugsteun herstel?");
    if (!confirmed) return;

    is_restoring = true;
    try {
      const result = await backup.restoreBackup();
      if (result.success) {
        await data.createCategories(result.data.categories);
        await data.createTasks(result.data.tasks);
        alert("Herstel suksesvol!");
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
    <p class="text-sm text-t-secondary/80">Om rugsteun te gebruik, moet jy eers jou e-posadres verifieer.</p>

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
      disabled={is_restoring || is_creating_backup}
      class="w-full p-2 bg-blue-600 text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={createBackup}
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
          ></path>
        </svg>
        {is_creating_backup ? "Besig met rugsteun..." : "Rugsteun nou"}
      </div>
    </button>

    <button
      type="button"
      disabled={is_restoring || is_creating_backup}
      class="w-full p-2 bg-green-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={restoreBackup}
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          ></path>
        </svg>
        {is_restoring ? "Besig met herstel..." : "Herstel vanaf rugsteun"}
      </div>
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

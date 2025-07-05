<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";
  import { api } from "$lib/services/api";

  let show = $state(false);
  let backup_enabled = $state(false);
  let isCreatingBackup = $state(false);
  let isRestoring = $state(false);

  async function createBackup() {
    if (isCreatingBackup) return;
    
    isCreatingBackup = true;
    try {
      const result = await api.createBackup();
      if (result.success) {
        alert('Rugsteun suksesvol geskep!');
      }
    } catch (error) {
      console.error('Backup error:', error);
      alert('Fout met rugsteun: ' + error.message);
    } finally {
      isCreatingBackup = false;
    }
  }

  async function restoreBackup() {
    if (isRestoring) return;
    
    const confirmed = confirm('Is jy seker jy wil vanaf rugsteun herstel? Dit sal alle huidige data vervang.');
    if (!confirmed) return;

    isRestoring = true;
    try {
      // In a real implementation, you'd want to show a list of available backups
      // For now, we'll need the user to provide a backup ID
      const backupId = prompt('Voer rugsteun ID in:');
      if (!backupId) {
        isRestoring = false;
        return;
      }

      const result = await api.restoreBackup(backupId);
      if (result.success) {
        alert('Data suksesvol herstel!');
        // Refresh the page or update the UI as needed
        window.location.reload();
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('Fout met herstel: ' + error.message);
    } finally {
      isRestoring = false;
    }
  }
</script>

<div class="bg-primary-20l rounded-lg">
  <button
    type="button"
    class="w-full p-4 flex items-center justify-between hover:bg-primary-30l rounded-lg transition-colors"
    onclick={() => (show = !show)}
  >
    <span class="font-semibold">Rugsteun</span>
    <DownChevron class="transition-transform duration-200 {show ? 'rotate-180' : ''}" size={20} />
  </button>

  {#if show}
    <div transition:slide class="px-4 pb-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Outomatiese rugsteun</span>
        <button
          disabled
          type="button"
          aria-label="Toggle Backup"
          class="relative w-11 h-6 rounded-full transition-colors {backup_enabled ? 'bg-blue-600' : 'bg-primary-30l'}"
          onclick={() => (backup_enabled = !backup_enabled)}
        >
          <div
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform {backup_enabled
              ? 'translate-x-5'
              : 'translate-x-0.5'}"
          ></div>
        </button>
      </div>

      <button
        type="button"
        disabled={isCreatingBackup}
        class="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        onclick={createBackup}
      >
        {isCreatingBackup ? 'Besig met rugsteun...' : 'Rugsteun nou'}
      </button>

      <button
        type="button"
        disabled={isRestoring}
        class="w-full p-3 bg-primary-30l text-tertiary rounded-lg hover:bg-primary-20l transition-colors disabled:opacity-50"
        onclick={restoreBackup}
      >
        {isRestoring ? 'Besig met herstel...' : 'Herstel vanaf rugsteun'}
      </button>
    </div>
  {/if}
</div>

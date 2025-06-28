<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";

  let show = $state(false);
  let backup_enabled = $state(false);
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
        disabled
        class="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Rugsteun nou
      </button>

      <button
        disabled
        type="button"
        class="w-full p-3 bg-primary-30l text-tertiary rounded-lg hover:bg-primary-20l transition-colors"
      >
        Herstel vanaf rugsteun
      </button>
    </div>
  {/if}
</div>

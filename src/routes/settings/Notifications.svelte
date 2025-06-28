<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";
  // import { notifications } from "$lib/services/_notifications.svelte.js";
  import { notifications as Notifications } from "$lib/services/Notification.svelte";
  import { onMount } from "svelte";
  import Sync from "$lib/icon/Sync.svelte";

  let show = $state(false);
  let is_loading = $state(false);

  onMount(async () => {
    await Notifications.init();
    time = Notifications.time;
  });

  /** @type {string?} */
  let time = $state(null);
</script>

<div class="bg-primary-20l rounded-lg">
  <button
    type="button"
    class="w-full p-4 flex items-center justify-between hover:bg-primary-30l rounded-lg transition-colors"
    onclick={() => (show = !show)}
  >
    <span class="font-semibold">Kennisgewings</span>
    <DownChevron class="transition-transform duration-200 {show ? 'rotate-180' : ''}" size={20} />
  </button>

  {#if show}
    <div transition:slide class="px-4 pb-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">Herhinneringe</span>
        <button
          type="button"
          aria-label="Toggle Notifications"
          class="relative w-11 h-6 rounded-full transition-colors {Notifications.enabled
            ? 'bg-blue-600'
            : 'bg-primary-30l'}"
          onclick={() => (Notifications.enabled = !Notifications.enabled)}
        >
          <div
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform {Notifications.enabled
              ? 'translate-x-5'
              : 'translate-x-0.5'}"
          ></div>
        </button>
      </div>

      {#if Notifications.enabled}
        <div transition:slide>
          <label for="daily_reminder_time" class="block text-sm font-medium mb-2">Herinneringstyd</label>
          <input
            id="daily_reminder_time"
            type="time"
            value={time}
            onchange={(e) => (Notifications.time = e.target.value)}
            class="bg-primary-20l p-2 w-full rounded-lg border border-primary text-tertiary appearance-none"
          />
        </div>

        <div class="text-xs text-tertiary-30d">
          {#if Notifications.status === "granted"}
            ✓ U het toestemming vir kennisgewings gegee.
          {:else if Notifications.status === "denied"}
            ✗ U het toestemming vir kennisgewings geweier.
          {:else}
            ⚠ Toestemming vir kennisgewings is nog nie versoek nie.
          {/if}
        </div>
      {/if}

      <button
        type="button"
        class="w-full p-2 bg-primary-30l text-tertiary focus:bg-primary-10l active:bg-primary-10l rounded-lg transition-colors text-sm flex gap-2 items-center justify-center disabled:text-tertiary-30d"
        disabled={is_loading}
        onclick={async () => {
          is_loading = true;
          await Notifications.testNotification("Toets Kennisgewing", "Hier is 'n toets kennisgewing.");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          is_loading = false;
        }}
      >
        {#if is_loading}
          <Sync class="animate-spin" size={10} />
        {/if}
        Toets kennisgewings
      </button>
    </div>
  {/if}
</div>

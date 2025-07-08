<script>
  import { slide } from "svelte/transition";
  import { notifications as Notifications } from "$lib/services/Notification.svelte";
  import { onMount } from "svelte";
  import Sync from "$lib/icon/Sync.svelte";
  import Toggle from "$lib/components/Toggle.svelte";
  import Details from "$lib/components/Details.svelte";

  /** @type {string?} */
  let time = $state(null);
  let is_loading = $state(false);

  onMount(async () => {
    await Notifications.init();
    time = Notifications.time;
  });
</script>

<Details label="Kennisgewings">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium">Herhinneringe</span>
    <Toggle bind:value={Notifications.enabled} />
  </div>

  {#if Notifications.enabled}
    <div transition:slide>
      <label for="daily_reminder_time" class="block text-sm font-medium mb-2">Herinneringstyd</label>
      <input
        id="daily_reminder_time"
        type="time"
        value={time}
        onchange={(e) => (Notifications.time = e.target.value)}
        class="focus:outline-none bg-t-primary-700 p-2 w-full rounded-lg border border-primary-600 text-t-secondary appearance-none"
      />
    </div>

    <div class="text-xs text-t-secondary/60">
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
    class="w-full p-2 bg-t-primary-800 text-t-secondary focus:bg-t-primary-900 hover:bg-t-primary-900 active:bg-t-primary-900 rounded-lg transition-colors text-sm flex gap-2 items-center justify-center disabled:text-t-secondary"
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
</Details>

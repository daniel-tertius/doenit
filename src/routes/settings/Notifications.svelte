<script>
  import { slide } from "svelte/transition";
  import { notifications } from "$lib/services/notification.svelte";
  import { CheckCircle, XCircle, Clock } from "$lib/icon";
  import { InputSwitch, InputTime } from "$lib/components/element/input";
  import { ContainerDetails } from "$lib/components/element/container";
  import { t } from "$lib/services/language.svelte";

  let is_loading = $state(false);

  function handleTimeChange({ value }) {
    if (value === notifications.time) return;

    notifications.time = value;
  }

  async function requestPermission() {
    is_loading = true;

    try {
      const status = await notifications.requestPermission();
      notifications.status = status;
    } catch (error) {
      console.error("Permission request failed:", error);
    } finally {
      is_loading = false;
    }
  }
</script>

<ContainerDetails label={t("notifications")}>
  <!-- Main toggle with better explanation -->
  <div class="space-y-4">
    <div class="flex items-start gap-4">
      <div class="flex-1">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">{t("reminders")}</span>
          <InputSwitch bind:value={notifications.enabled} />
        </div>
        <!-- Toggle for past due date notifications -->
        {#if notifications.enabled}
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium">{t("notify_past_due_tasks")}</span>
            <InputSwitch bind:value={notifications.past_tasks_enabled} />
          </div>
        {/if}
      </div>
    </div>

    <!-- Permission status with visual indicator -->
    <div class="flex items-center gap-3 p-3 rounded-lg bg-t-secondary/5 border border-t-secondary/10">
      {#if notifications.status === "granted"}
        <CheckCircle size={20} class="text-green-600 dark:text-green-400" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="text-sm text-green-600 dark:text-green-400">{t("notification_granted")}</span>
          </div>
        </div>
      {:else if notifications.status === "denied"}
        <XCircle size={20} class="text-red-600 dark:text-red-400" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="text-sm text-red-600 dark:text-red-400">{t("notification_denied")}</span>
            <button
              class="text-sm px-3 py-1 rounded-full bg-t-primary-600 text-secondary hover:bg-t-primary-700 transition-colors"
              onclick={requestPermission}
              disabled={is_loading}
            >
              {is_loading ? t("loading") : t("request_permission")}
            </button>
          </div>
        </div>
      {:else}
        <Clock size={20} class="text-yellow-600 dark:text-yellow-400" />
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="text-sm text-yellow-600 dark:text-yellow-400">{t("notification_pending")}</span>
            <button
              class="text-sm px-3 py-1 rounded-full bg-t-primary-600 text-secondary hover:bg-t-primary-700 transition-colors"
              onclick={requestPermission}
              disabled={is_loading}
            >
              {is_loading ? t("loading") : t("request_permission")}
            </button>
          </div>
        </div>
      {/if}
    </div>

    {#if notifications.enabled}
      <div transition:slide class="space-y-4">
        <!-- Time picker with better layout -->
        <div>
          <label for="daily_reminder_time" class="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock size={16} class="text-t-secondary/60" />
            {t("reminder_time")}
          </label>
          <InputTime
            value={notifications.time}
            can_clear={false}
            onchange={handleTimeChange}
            placeholder={t("choose_time")}
          />
        </div>
      </div>
    {/if}
  </div>
</ContainerDetails>

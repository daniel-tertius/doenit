import { cached_notification_past_tasks, cached_notification_time } from "$lib/cached";
import { LocalNotifications } from "@capacitor/local-notifications";
import { data } from "$lib/Data.svelte";
import { t } from "$lib/services";
import { Capacitor } from "@capacitor/core";

class Notification {
  #time: string | null = $state(null);
  #enabled: boolean = $state(false);
  #past_tasks_enabled: boolean = $state(false);

  #status: string | null = $state(null);
  #timeout: number | NodeJS.Timeout = $state(0);

  get time() {
    return this.#time;
  }

  set time(time_value: string | null) {
    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(async () => {
      cached_notification_time.set(time_value);
      this.#time = time_value;

      await this.scheduleNotifications();
    }, 1000);
  }

  get enabled() {
    return this.#enabled;
  }

  set enabled(enabled: boolean) {
    if (typeof enabled !== "boolean") {
      console.warn(`Invalid enabled value: ${enabled}. It should be a boolean.`);
      return;
    }

    this.#enabled = enabled;

    if (enabled) {
      // Set default time if not already set
      if (!this.#time) {
        this.#time = "08:00";
        this.scheduleNotifications();
      }
      cached_notification_time.set(this.#time);
      this.requestPermission().then((status) => {
        this.#status = status;
      });
    } else {
      this.past_tasks_enabled = false;
      cached_notification_time.set(null);
      this.cancelAll();
    }
  }

  get past_tasks_enabled() {
    return this.#past_tasks_enabled;
  }

  set past_tasks_enabled(value: boolean) {
    if (typeof value !== "boolean") {
      console.warn(`Invalid enabled value: ${value}. It should be a boolean.`);
      return;
    }

    this.#past_tasks_enabled = value;
    cached_notification_past_tasks.set(value);
    this.scheduleNotifications();
  }

  get status() {
    return this.#status;
  }

  set status(status: string | null) {
    if (!["granted", "denied", "prompt", "prompt-with-rationale", null].includes(status)) {
      console.warn(
        `Invalid notification status value: ${status}. It should be 'granted', 'denied', 'prompt', or null.`
      );
      return;
    }

    this.#status = status;
  }

  async init() {
    let time = await cached_notification_time.get();
    if (time === undefined) {
      cached_notification_time.set(null);
      time = null;
    }

    this.#time = time;
    this.#enabled = time !== null;
    this.#status = await this.requestPermission();
  }

  /**
   * Requests permission for notifications.
   * @returns {string} - Returns the permission status, which can be "granted", "denied", or "prompt".
   */
  async requestPermission(): Promise<string> {
    try {
      const existing_permission = await LocalNotifications.checkPermissions();

      switch (existing_permission.display) {
        case "granted":
          return "granted";
        case "denied":
          if (Capacitor.isNativePlatform()) {
            // On some platforms, this might open system settings
            await LocalNotifications.changeExactNotificationSetting();
          }

          // Re-check permission after attempting to change settings
          const updated_permission = await LocalNotifications.checkPermissions();
          return updated_permission.display;
        case "prompt":
        case "prompt-with-rationale":
          const permission = await LocalNotifications.requestPermissions();
          return permission.display;

        default:
          console.warn(`Unknown permission status: ${existing_permission.display}`);
          return existing_permission.display;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  async resetNotifications() {
    await this.cancelAll();
  }

  async scheduleNotifications() {
    if (!this.#enabled || !this.#time) {
      console.warn("Notifications are disabled or time is not set.");
      return;
    }

    await this.cancelAll();

    // Schedule a notification for 30 days in advance.
    const notifications = [];

    // Today at the specified time or default to 8:00 AM.
    const date = new Date();
    const [hours = 8, minutes = 0] = this.#time?.split(":").map(Number) ?? [];
    date.setHours(hours, minutes, 0, 0);

    const all_tasks = await data.getAllTasks();
    for (let i = 0; i < 30; i++) {
      if (this.#past_tasks_enabled) {
        const tasks = data.getTasksBeforeDate(all_tasks, date);
        let body = tasks
          .map(
            (task, idx) =>
              `${idx + 1}. ${task.name}${task.due_date && task.due_date.includes(" ") ? ` (${task.due_date.split(" ")[1]})` : ""}`
          )
          .join("\n");
        notifications.push({
          title: tasks.length === 1 ? t("past_due_date_singular") : t("past_due_date", { task_count: tasks.length }),
          body: body,
          id: +`${all_tasks.length}${i + 1}`,
          schedule: { at: new Date(+date) /* Need to copy date */ },
        });
      }

      const tasks = data.getTasksOnDate(all_tasks, date);
      if (!tasks.length) {
        date.setDate(date.getDate() + 1);
        continue;
      }

      // Create a beautiful body for the tasks
      let body = tasks
        .map(
          (task, idx) =>
            `${idx + 1}. ${task.name}${task.due_date && task.due_date.includes(" ") ? ` (${task.due_date.split(" ")[1]})` : ""}`
        )
        .join("\n");

      notifications.push({
        title:
          tasks.length === 1
            ? t("daily_reminder_title_singular")
            : t("daily_reminder_title", { task_count: tasks.length }),
        body: body,
        id: i + 1,
        schedule: { at: new Date(+date) /* Need to copy date */ },
      });

      // TODO: Herhaalde take
      // TODO: Verstreke take

      // Schedule a notification for the tasks with time set in the due date.
      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        const has_due_time = task.due_date?.includes(" ");
        if (!has_due_time) continue;

        // YYYYY-MM-DD HH:mm
        const taskDate = new Date(task.due_date!);

        notifications.push({
          title: task.name,
          body: t("scheduled_for_now"),
          id: +`${i + 1}${j + 1}`,
          schedule: { at: taskDate },
        });
      }

      // Update to next day
      date.setDate(date.getDate() + 1);
    }

    await LocalNotifications.schedule({ notifications });
  }

  async cancelAll() {
    // Cancel all scheduled notifications
    const pending = await LocalNotifications.getPending();
    const ids = pending.notifications.map((n) => ({ id: n.id }));
    if (ids.length > 0) {
      await LocalNotifications.cancel({ notifications: ids });
    }
  }
}

export const notifications = new Notification();

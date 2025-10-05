import { cached_notification_past_tasks, cached_notification_time } from "$lib/cached";
import { LocalNotifications } from "@capacitor/local-notifications";
import { t } from "$lib/services/language.svelte";
import { Capacitor } from "@capacitor/core";
import { DB } from "$lib/DB";
import { sortTasksByDueDate } from "$lib";
import { App } from "@capacitor/app";

class Notification {
  #initiated: boolean = false;
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
    await this.#init();
    App.addListener("appStateChange", async (state) => {
      if (!state.isActive) return;

      const status = await LocalNotifications.checkPermissions();
      this.#status = status.display;
    });
  }

  async #init() {
    let time = await cached_notification_time.get();
    if (time === undefined) {
      cached_notification_time.set(null);
      time = null;
    }

    let past_tasks = await cached_notification_past_tasks.get();
    if (past_tasks == null) {
      cached_notification_past_tasks.set(false);
      past_tasks = false;
    }

    this.#time = time;
    this.#enabled = time !== null;
    this.#past_tasks_enabled = past_tasks;

    const existing_permission = await LocalNotifications.checkPermissions();
    this.#status = existing_permission.display;
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

  async scheduleNotifications(all_tasks?: Task[]) {
    console.debug("[😨 Doenit]: Herskeduleer kennisgewings");

    try {
      if (all_tasks == null) {
        all_tasks = await DB.Task.getAll({ selector: { archived: { $ne: true } } });
      }

      if (!this.#initiated) {
        await this.init();
        this.#initiated = true;
      }

      if (!this.#enabled || !this.#time) {
        console.warn("Notifications are disabled or time is not set.");
        return;
      }

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(this.#time)) {
        console.error(`Invalid time format: ${this.#time}. Expected HH:mm format.`);
        return;
      }

      await this.cancelAll();

      // Schedule a notification for 30 days in advance.
      const notifications = [];

      // Today at the specified time or default to 8:00 AM.
      const date = new Date();
      const [hours = 8, minutes = 0] = this.#time?.split(":").map(Number) ?? [];

      // Validate parsed time values
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error(`Invalid time values: ${hours}:${minutes}. Hours must be 0-23, minutes 0-59.`);
        return;
      }

      date.setHours(hours, minutes, 0, 0);

      all_tasks = sortTasksByDueDate(all_tasks);

      // ID generation constants to avoid collisions
      const PAST_TASKS_ID_BASE = 100000;
      const DAILY_REMINDER_ID_BASE = 200000;
      const TIME_SPECIFIC_ID_BASE = 300000;

      for (let i = 0; i < 30; i++) {
        if (this.#past_tasks_enabled) {
          const tasks = getTasksBeforeDate(all_tasks, date);
          if (!!tasks.length) {
            let body = tasks
              .map(
                (task, idx) =>
                  `${idx + 1}. ${task.name}${task.due_date && task.due_date.includes(" ") ? ` (${task.due_date.split(" ")[1]})` : ""}`
              )
              .join("\n");

            notifications.push({
              title:
                tasks.length === 1 ? t("past_due_date_singular") : t("past_due_date", { task_count: tasks.length }),
              body: body,
              id: PAST_TASKS_ID_BASE + i,
              schedule: { at: new Date(+date) /* Need to copy date */ },
            });
          }
        }

        const tasks = getTasksOnDate(all_tasks, date);
        if (tasks.length > 0) {
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
            id: DAILY_REMINDER_ID_BASE + i,
            schedule: { at: new Date(+date) /* Need to copy date */ },
          });

          // Schedule a notification for the tasks with time set in the due date.
          for (let j = 0; j < tasks.length; j++) {
            const task = tasks[j];
            const has_due_time = task.due_date?.includes(" ");
            if (!has_due_time) continue;

            // Validate YYYY-MM-DD HH:mm format
            const date_time_regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
            if (!date_time_regex.test(task.due_date!)) {
              console.warn(
                `Invalid task due date format: ${task.due_date} for task: ${task.name}. Expected YYYY-MM-DD HH:mm format.`
              );
              continue;
            }

            const task_date = new Date(task.due_date!);

            // Validate that the date is valid
            if (isNaN(task_date.getTime())) {
              console.warn(`Invalid task due date: ${task.due_date} for task: ${task.name}`);
              continue;
            }

            notifications.push({
              title: task.name,
              body: t("scheduled_for_now"),
              id: TIME_SPECIFIC_ID_BASE + i * 1000 + j,
              schedule: { at: task_date },
            });
          }
        }

        // Update to next day
        date.setDate(date.getDate() + 1);
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.debug(`[😨 Doenit]: Scheduled ${notifications.length} notifications`);
      } else {
        console.debug("[😨 Doenit]: No notifications to schedule");
      }
    } catch (error) {
      console.error("Error scheduling notifications:", error);
      throw error; // Re-throw to allow caller to handle
    }
  }

  send(title: string, body: string) {
    LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: new Date().getTime(), // Unique ID based on timestamp
          schedule: { at: new Date(new Date().getTime() + 1000) }, // Schedule for 1 second later
        },
      ],
    });
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

function getTasksOnDate(tasks: Task[], date: Date): Task[] {
  if (!date || !tasks?.length) return [];

  const target_date = new Date(date);
  target_date.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (!task.due_date) return false;

    const task_date = new Date(task.due_date);
    task_date.setHours(0, 0, 0, 0);

    return task_date.toLocaleDateString("en-CA") === target_date.toLocaleDateString("en-CA");
  });
}

function getTasksBeforeDate(tasks: Task[], date: Date): Task[] {
  if (!date || !tasks?.length) return [];

  const target_date = new Date(date);
  target_date.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (!task.due_date) return false;

    const task_date = new Date(task.due_date);
    task_date.setHours(0, 0, 0, 0);

    return task_date < target_date;
  });
}

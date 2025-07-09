import { cached_notification_time } from "$lib/cached";
import { LocalNotifications } from "@capacitor/local-notifications";
import { data } from "$lib/Data.svelte";

class Notification {
  #time: string | null = $state(null);
  #enabled: boolean = $state(false);
  #status: string | null = $state(null);
  #timeout: number | NodeJS.Timeout = $state(0);

  get time() {
    return this.#time;
  }

  set time(theme_value: string | null) {
    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(async () => {
      cached_notification_time.set(theme_value);
      this.#time = theme_value;

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
    cached_notification_time.set(enabled ? this.#time : null);
    if (enabled) {
      this.requestPermission();
    }
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
   *
   * @returns {} - Returns the permission status, which can be "granted", "denied", or "prompt".
   */
  async requestPermission(): Promise<string> {
    const existing_permission = await LocalNotifications.checkPermissions();
    if (existing_permission.display === "prompt") {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display;
    }

    return existing_permission.display;
  }

  async refreshNotification() {}

  async resetNotifications() {
    await this.cancelAll();
  }

  async testNotification(title: string, body: string) {
    try {
      // Request permissions first
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") {
        alert("Notification permissions not granted");
        return;
      }

      // Schedule a notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Toets Kennisgewing",
            body: "Hier is 'n toets kennisgewing!",
            id: Number(Date.now().toString().slice(-9)),
            schedule: { at: new Date(Date.now() + 500) }, // Trigger 5 seconds from now
            actionTypeId: "",
          },
        ],
      });
    } catch (error) {
      alert("Error scheduling notification:" + error + " | " + JSON.stringify(error, null, 2));
    }
  }

  async scheduleNotifications() {
    await this.cancelAll();

    // Schedule a notification for 30 days in advance.
    const notifications = [];

    // Today at the specified time or default to 8:00 AM.
    const date = new Date();
    const [hours = 8, minutes = 0] = this.#time?.split(":").map(Number) ?? [];
    date.setHours(hours, minutes, 0, 0);

    const all_tasks = await data.getAllTasks();
    for (let i = 0; i < 30; i++) {
      const tasks = data.getTasksCountForDate(all_tasks, date);

      if (!tasks.length) {
        date.setDate(date.getDate() + 1);
        continue;
      }

      notifications.push({
        title: "Daaglikse herhinnering",
        body: `Jy het ${
          tasks.length === 1 ? `1 taak` : `${tasks.length} take`
        } om te doen vandag! Sterkte en geniet dit. 😊`,
        id: i + 1,
        schedule: { at: new Date(date) },
        actionTypeId: "",
      });

      // Schedule a notification for the tasks with time set in the due date.
      for (let j = 0; j < tasks.length; j++) {
        const task = tasks[j];
        const has_due_time = task.due_date?.includes(" ");
        if (!has_due_time) continue;

        // YYYYY-MM-DD HH:mm
        const taskDate = new Date(task.due_date);

        notifications.push({
          title: "Jy moet 'n taak doen!",
          body: task.name,
          id: +`${i + 1}${j + 1}`,
          schedule: { at: taskDate },
          actionTypeId: "",
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

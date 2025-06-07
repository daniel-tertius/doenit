import { LocalNotifications } from "@capacitor/local-notifications";

export class NotificationService {
  async requestPermission() {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === "granted";
  }

  async scheduleDailyTask() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log("Notification permission denied");
      return;
    }

    // Cancel existing notifications to avoid duplicates
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    // Schedule multiple notifications in advance (e.g., next 30 days)
    const notifications = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const scheduleDate = new Date();
      scheduleDate.setDate(now.getDate() + i);
      scheduleDate.setHours(19, 0, 0, 0);

      // Only schedule if the time hasn't passed today
      if (scheduleDate > now) {
        notifications.push({
          title: "Daily Reminder",
          body: "You have tasks",
          id: i + 1,
          schedule: {
            at: scheduleDate,
          },
          sound: "default",
          smallIcon: "ic_notification", // Add this line
          iconColor: "#325372", // Optional: match your app's color
        });
      }
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} notifications`);
    }
  }

  async cancelDailyTask() {
    // Cancel all scheduled notifications
    const pending = await LocalNotifications.getPending();
    const ids = pending.notifications.map((n) => ({ id: n.id }));
    if (ids.length > 0) {
      await LocalNotifications.cancel({ notifications: ids });
    }
  }
}

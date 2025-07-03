import { browser } from "$app/environment";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

let notificationId = 0;

export class NotificationService {
  constructor() {
    this.notifications = $state([]);
    this.permission = $state("dark");
    this.checkPermission();
  }

  async checkPermission() {
    if (!browser || !("Notification" in window)) {
      this.permission = "denied";
      return;
    }

    this.permission = Notification.permission;
  }

  showToast(message, type = "info", duration = 5000) {
    const notification = {
      id: ++notificationId,
      message,
      type,
      duration,
      timestamp: Date.now(),
    };

    this.notifications.push(notification);
    return notification.id;
  }

  showNotification(title, options = {}) {
    if (!browser) {
      // Fallback to toast notification
      this.showToast(title, "info");
      return;
    }

    // // Check for Capacitor environment
    // if (Capacitor.isNativePlatform()) {
    //   LocalNotifications.schedule({
    //     notifications: [
    //       {
    //         title: title,
    //         body: options.body || "",
    //         id: ++notificationId,
    //         schedule: { at: new Date(Date.now() + 1000) }, // Show after 1 second
    //         sound: undefined,
    //         attachments: undefined,
    //         actionTypeId: "",
    //         extra: null,
    //       },
    //     ],
    //   }).catch(() => {
    //     // Fallback to toast if plugin not available
    //     this.showToast(title, "info");
    //   });
    //   return;
    // }

    // Web browser notification
    // if (!("Notification" in window) || this.permission !== "granted") {
    //   // Fallback to toast notification
    //   this.showToast(title, "info");
    //   return;
    // }

    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }

  scheduleReminder(message, time) {
    if (!browser) return;

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilReminder = scheduledTime.getTime() - now.getTime();
    return setTimeout(() => {
      this.showNotification("Doenit Herinnering", {
        body: message,
        tag: "daily-reminder",
      });

      // Schedule the next day's reminder
      this.scheduleReminder(message, time);
    }, timeUntilReminder);
  }

  removeNotification(id) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  clearAll() {
    this.notifications = [];
  }
}

// Create a singleton instance
export const notifications = new NotificationService();

import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Alert } from "$lib/core/alert";
import { OnlineDB } from "$lib/OnlineDB";
import { Notify } from "./notifications/notifications";
import user from "$lib/core/user.svelte";
import { t } from "./language.svelte";

class PushNotificationService {
  private token: string | null = null;

  async init() {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Request permission
      const permission = await FirebaseMessaging.requestPermissions();
      if (permission.receive !== "granted") {
        Alert.error(t("push_notification_permission_not_granted"));
        return;
      }

      // Get FCM token
      const result = await FirebaseMessaging.getToken();
      this.token = result.token;

      // Save token to user profile (you'll need to implement this)
      await this.saveTokenToProfile(this.token);

      // Listen for incoming messages
      this.setupMessageListener();
    } catch (error) {
      Alert.error(t("error_initializing_push_notifications") + ": " + error);
    }
  }

  private async saveTokenToProfile(token: string) {
    if (!user.value) return;

    const [db_user] = await OnlineDB.User.getAll({
      filters: [{ field: "email_address", operator: "==", value: user.value.email }],
      limit: 1,
    });

    if (db_user) {
      db_user.fcm_token = token;
      await OnlineDB.User.update(db_user.id, db_user);
    } else {
      await OnlineDB.User.create({ email_address: user.value.email, fcm_token: token });
    }
  }

  private setupMessageListener() {
    // Listen for messages when app is in foreground
    FirebaseMessaging.addListener("notificationReceived", (notification) => {
      this.handleInviteNotification(notification);
    });

    // Listen for notification taps (when app is in background)
    FirebaseMessaging.addListener("notificationActionPerformed", (action) => {
      this.handleInviteNotification(action.notification);
      window.location.pathname = "/friends";
    });
  }

  private handleInviteNotification(notification: any) {
    try {
      const formatted_notification = {
        id: Date.now(),
        title: notification.title || t("new_friend_invite"),
        body: notification.body || t("you_have_new_friend_request"),
        schedule: { at: new Date(Date.now() + 1000) },
        actionTypeId: "FRIEND_INVITE",
        largeBody: notification.body,
      };

      // Show local notification with custom actions
      LocalNotifications.schedule({ notifications: [formatted_notification] });
    } catch (error) {
      Alert.error(`${t("error_showing_invite_notification")}: ${error}`);
    }
  }

  // Method to send push notification (would be called from your backend)
  async sendInviteNotification(email_address: string) {
    const [user] = await OnlineDB.User.getAll({
      filters: [{ field: "email_address", operator: "==", value: email_address }],
      limit: 1,
    });

    await Notify.Push.send({
      title: t("new_friend_invite"),
      body: t("someone_sent_friend_request"),
      email_address: [email_address],
    });
  }

  getToken(): string | null {
    return this.token;
  }
}

export const pushNotificationService = new PushNotificationService();

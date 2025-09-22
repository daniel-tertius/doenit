import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { FIREBASE_CONFIG } from "$lib";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
let messaging: any = null;

// Only initialize messaging on web platform
if (!Capacitor.isNativePlatform()) {
  messaging = getMessaging(app);
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

class NotificationService {
  private fcmToken: string | null = null;
  private initialized = false;

  /**
   * Initialize push notifications and request permission
   */
  async init(): Promise<boolean> {
    try {
      if (this.initialized) return true;

      if (Capacitor.isNativePlatform()) {
        // Native platform (Android/iOS)
        const permissionStatus = await FirebaseMessaging.requestPermissions();

        if (permissionStatus.receive !== "granted") {
          console.warn("Push notification permission not granted");
          return false;
        }

        const result = await FirebaseMessaging.getToken();
        this.fcmToken = result.token;

        // Listen for messages
        await FirebaseMessaging.addListener("notificationReceived", (payload) => {
          console.log("Notification received:", payload);
          this.handleForegroundMessage(payload.notification);
        });

        await FirebaseMessaging.addListener("notificationActionPerformed", (payload) => {
          console.log("Notification action performed:", payload);
          this.handleNotificationClick(payload.notification);
        });
      } else {
        // Web platform
        if (!messaging) {
          console.warn("Firebase messaging not available on this platform");
          return false;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Push notification permission not granted");
          return false;
        }

        // Get FCM token
        this.fcmToken = await getToken(messaging, {
          vapidKey: process.env.PUBLIC_FIREBASE_VAPID_KEY, // TODO: You'll need to set this
        });

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
          this.handleForegroundMessage(payload);
        });
      }

      this.initialized = true;

      // Store token in user profile
      if (this.fcmToken) {
        await this.saveTokenToProfile(this.fcmToken);
      }

      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }

  /**
   * Get the current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Handle foreground messages (when app is open)
   */
  handleForegroundMessage(payload: { title: string; body: string }) {
    // You can show a custom in-app notification here
    this.showInAppNotification(payload);
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(payload: any) {
    console.log("Notification clicked:", payload);

    // Navigate based on notification data
    if (payload.data?.type === "friend_invite") {
      // Navigate to friends screen
      window.location.href = "/friends";
    } else if (payload.data?.type === "friend_accepted") {
      // Navigate to friends screen
      window.location.href = "/friends";
    }
  }

  /**
   * Show in-app notification
   */
  private showInAppNotification(payload: { title: string; body: string }) {
    // Create a simple toast notification
    const notification = document.createElement("div");
    notification.className = "fixed top-4 right-4 bg-blue-500 text-alt p-4 rounded-lg shadow-lg z-50 max-w-sm";
    notification.innerHTML = `
      <div class="font-semibold">${payload.title || "New Notification"}</div>
      <div class="text-sm">${payload.body || ""}</div>
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Save FCM token to user profile
   */
  private async saveTokenToProfile(token: string) {
    try {
      const { userProfileService } = await import("$lib/services/userProfile.svelte");
      await userProfileService.updateFCMToken(token);
    } catch (error) {
      console.error("Error saving FCM token:", error);
    }
  }
}

/**
 * Send push notification to a user (this would typically be done server-side)
 * For now, this is a placeholder that logs the notification
 */
export async function sendPushNotification(
  recipient_email_address: string,
  payload: NotificationPayload
): Promise<void> {
  // In a real implementation, this would:
  // 1. Look up the user's FCM token from their profile
  // 2. Send the notification via Firebase Admin SDK (server-side)
  // 3. Or call a Cloud Function to send the notification

  console.log(`[NOTIFICATION] To: ${recipient_email_address}`, payload);

  // For development, you could implement this as a Cloud Function call:
  /*
  try {
    const response = await fetch('/api/sendNotification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await auth.getAuthToken()}`
      },
      body: JSON.stringify({
        recipient_email_address,
        ...payload
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
  */
}

export const notificationService = new NotificationService();

import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { auth } from "./auth.svelte";

class PushNotificationService {
  private token: string | null = null;

  async init() {
    if (!Capacitor.isNativePlatform()) {
      console.log("🔧 [DEV] Push notifications only work on native platforms");
      return;
    }

    try {
      // Request permission
      const permission = await FirebaseMessaging.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Get FCM token
        const result = await FirebaseMessaging.getToken();
        this.token = result.token;
        
        console.log("FCM Token:", this.token);
        
        // Save token to user profile (you'll need to implement this)
        await this.saveTokenToProfile(this.token);
        
        // Listen for incoming messages
        this.setupMessageListener();
      }
    } catch (error) {
      console.error("Error initializing push notifications:", error);
    }
  }

  private async saveTokenToProfile(token: string) {
    const user = auth.getUser();
    if (!user?.email) return;

    // TODO: Save FCM token to user's profile in Firestore
    // This allows the backend to send targeted notifications
    console.log("TODO: Save FCM token to user profile:", { 
      email: user.email, 
      fcmToken: token 
    });
  }

  private setupMessageListener() {
    // Listen for messages when app is in foreground
    FirebaseMessaging.addListener('notificationReceived', (notification) => {
      console.log('Received notification:', notification);
      
      // Check if it's an invite notification
      const notificationData = (notification as any).data;
      if (notificationData?.type === 'friend_invite') {
        this.handleInviteNotification(notification);
      }
    });

    // Listen for notification taps (when app is in background)
    FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
      console.log('Notification action performed:', action);
      
      const actionData = (action.notification as any).data;
      if (actionData?.type === 'friend_invite') {
        // Navigate to friends page
        window.location.hash = '/friends';
      }
    });
  }

  private handleInviteNotification(notification: any) {
    // Show local notification with custom actions
    LocalNotifications.schedule({
      notifications: [{
        id: Date.now(),
        title: notification.title || 'New Friend Invite',
        body: notification.body || 'You have a new friend request',
        largeBody: notification.body,
        actionTypeId: 'FRIEND_INVITE',
        extra: notification.data,
        schedule: { 
          at: new Date(Date.now() + 1000) // Show immediately
        }
      }]
    });
  }

  // Method to send push notification (would be called from your backend)
  async sendInviteNotification(recipientFCMToken: string, sender_name: string) {
    // This would typically be done from your Firebase Functions backend
    console.log("TODO: Send push notification via Firebase Functions:", {
      to: recipientFCMToken,
      data: {
        type: 'friend_invite',
        sender_name: sender_name
      },
      notification: {
        title: 'New Friend Invite',
        body: `${sender_name} sent you a friend request`
      }
    });
  }

  getToken(): string | null {
    return this.token;
  }
}

export const pushNotificationService = new PushNotificationService();

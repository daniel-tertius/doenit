import { notifications } from "./notification.svelte";
import { inviteService } from "./invites.svelte";
import { auth } from "./auth.svelte";
import { pushNotificationService } from "./pushNotifications.svelte";

class InviteNotificationService {
  private initialized = false;
  private unsubscribeFunctions: Array<() => void> = [];

  async init() {
    if (this.initialized) return;

    console.log("🔔 Initializing invite notification service");

    // Initialize push notifications (for native platforms)
    await pushNotificationService.init();

    // Set up real-time listeners
    this.setupRealtimeListeners();

    // Listen for new invites and show notifications
    this.setupInviteNotifications();

    this.initialized = true;
  }

  private setupRealtimeListeners() {
    if (!auth.is_logged_in) return;

    // Subscribe to received invites
    const unsubscribeReceived = inviteService.subscribeReceivedInvites((invites) => {
      console.log(`📩 Received invites updated: ${invites.length} pending`);

      // Check for truly new invites (you might want to implement a more sophisticated check)
      if (invites.length > 0) {
        this.showNewInviteNotification(invites[0]); // Show notification for the latest invite
      }
    });

    if (unsubscribeReceived) {
      this.unsubscribeFunctions.push(unsubscribeReceived);
    }
  }

  private setupInviteNotifications() {
    // Use your existing notification system to show invite alerts
    // This integrates with the LocalNotifications you already have set up
  }

  private showNewInviteNotification(invite: Invite) {
    const title = "New Friend Invite! 🤝";
    const body = `${invite.sender_name} (${invite.sender_email_address}) wants to be friends`;

    console.log(`🔔 Showing notification: ${title}`);

    // Use your existing notification service
    notifications.send(title, body);

    // Optional: Also show an in-app notification
    this.showInAppNotification(invite);
  }

  private showInAppNotification(invite: Invite) {
    // Create a temporary in-app notification element
    const notification = document.createElement("div");
    notification.className = "fixed top-4 right-4 bg-success text-alt p-4 rounded-lg shadow-lg z-50 max-w-sm";
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          🤝
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-sm">New Friend Invite</h4>
          <p class="text-xs opacity-90">${invite.sender_name} wants to be friends</p>
        </div>
        <button class="text-alt/70 hover:text-alt" onclick="this.parentElement.parentElement.remove()">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transition = "opacity 0.3s";
        notification.style.opacity = "0";
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);

    // Make it clickable to navigate to friends page
    notification.style.cursor = "pointer";
    notification.addEventListener("click", () => {
      window.location.href = "/friends";
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    });
  }
}

export const inviteNotificationService = new InviteNotificationService();

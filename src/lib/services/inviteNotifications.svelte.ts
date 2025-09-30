import { notifications } from "./notification.svelte";
import { inviteService } from "./invites.svelte";
import user from "$lib/core/user.svelte";
import { Alert } from "$lib/core";

class InviteNotificationService {
  private initialized = false;
  private unsubscribeFunctions: Array<() => void> = [];

  async init() {
    if (this.initialized) return;

    // Set up real-time listeners
    this.setupRealtimeListeners();

    this.initialized = true;
  }

  private setupRealtimeListeners() {
    if (!user.value) return;

    // Subscribe to received invites
    const unsubscribeReceived = inviteService.subscribeReceivedInvites((invites) => {
      Alert.success(`📩 Received invites updated: ${invites.length} pending`);

      // Check for truly new invites (you might want to implement a more sophisticated check)
      if (invites.length > 0) {
        this.showNewInviteNotification(invites[0]);
      }
    });

    if (unsubscribeReceived) {
      this.unsubscribeFunctions.push(unsubscribeReceived);
    }
  }

  private showNewInviteNotification(invite: Invite) {
    const title = "New Friend Invite! 🤝";
    const body = `${invite.sender_name} (${invite.sender_email_address}) wants to be friends`;

    // Use your existing notification service
    notifications.send(title, body);

    Alert.success(`New friend invite from ${invite.sender_name}`);
  }
}

export const inviteNotificationService = new InviteNotificationService();

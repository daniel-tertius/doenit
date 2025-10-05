import { notifications } from "./notification.svelte";
import { inviteService } from "./invites.svelte";
import user from "$lib/core/user.svelte";
import { Alert } from "$lib/core/alert";
import { t } from "./language.svelte";

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
      Alert.success(t("received_invites_updated", { count: invites.length }));

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
    const title = t("new_friend_invite_emoji");
    const body = t("wants_to_be_friends", { name: invite.sender_name, email: invite.sender_email_address });

    // Use your existing notification service
    notifications.send(title, body);

    Alert.success(t("new_friend_invite_from", { name: invite.sender_name }));
  }
}

export const inviteNotificationService = new InviteNotificationService();

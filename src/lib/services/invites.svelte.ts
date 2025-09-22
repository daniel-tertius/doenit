import { notificationService } from "./notifications.svelte";
import { INVITE_EXPIRATION_DAYS, normalize } from "$lib";
import { auth } from "$lib/services/auth.svelte";
import DateUtil from "$lib/DateUtil";
import { OnlineDB } from "$lib/OnlineDB";
import { DB } from "$lib/DB";
import { AppNotification } from "./appNotifications.svelte";

class InviteService {
  invites: Invite[] = $state([]);

  handleNewInvites(invites: Invite[]) {
    this.invites = invites;
    if (!invites.length) return;

    try {
      for (const invite of invites) {
        if (invite.recipient_email_address !== normalize(auth.user?.email ?? "")) continue;
        if (invite.status !== "pending") return;

        AppNotification.showSimple(`You have a pending invite from ${invite.sender_email_address}.`);
      }
    } catch (error) {
      console.error("❌ Error processing invite changes:", error);
      alert("Error processing invite changes: " + error.message);
    }
  }
  /**
   * Send an invite to another user
   */
  async sendInvite(recipient_email_address: string): Promise<SimpleResult> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) {
        return { success: false, error_message: "User not authenticated" };
      }

      const existing_invites = await this.getExistingInvite(user.email, recipient_email_address);
      if (existing_invites.length) {
        return { success: false, error_message: "Invite already sent to this email address" };
      }

      const room = await DB.Room.create({
        name: normalize(recipient_email_address.split("@")[0]),
        users: [{ email: normalize(recipient_email_address), pending: true }],
      });

      // Create the invite
      const expires_at = DateUtil.addDays(new Date(), INVITE_EXPIRATION_DAYS);
      await OnlineDB.Invite.create({
        sender_email_address: normalize(user.email),
        sender_name: user.displayName || normalize(user.email),
        recipient_email_address: normalize(recipient_email_address),
        room_id: room.id,
        status: "pending",
        expires_at: DateUtil.format(expires_at, "YYYY-MM-DD HH:mm:ss"),
      });

      // TODO: Send push notification when notifications service is ready

      return { success: true };
    } catch (error) {
      console.error("Error sending invite:", error);
      return { success: false, error_message: "Failed to send invite. Please try again." };
    }
  }

  /**
   * Accept an invite and create friendship
   */
  async acceptInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) {
        return { success: false, message: "User not authenticated" };
      }

      const invite = await OnlineDB.Invite.read(inviteId);
      if (!invite) {
        return { success: false, message: "Invite not found" };
      }

      // Verify this invite is for the current user
      if (invite.recipient_email_address !== normalize(user.email)) {
        return { success: false, message: "This invite is not for you" };
      }

      // Check if invite is still valid
      if (invite.status !== "pending") {
        return { success: false, message: "This invite is no longer valid" };
      }

      if (new Date(invite.expires_at) < new Date()) {
        invite.status = "expired";
        await OnlineDB.Invite.update(inviteId, invite);

        return { success: false, message: "This invite has expired" };
      }

      // Update invite status
      invite.status = "accepted";
      invite.acceptedAt = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
      await OnlineDB.Invite.update(inviteId, invite);

      const room = await DB.Room.create({
        id: invite.room_id,
        name: invite.sender_name,
        users: [{ email: normalize(invite.sender_email_address), pending: false }],
      });

      const user_email = normalize(user.email);
      await OnlineDB.Changelog.create({
        total_reads_needed: room.users.length,
        user_reads_list: [user_email],
        type: "invite_accepted",
        room_id: room.id,
      });

      // TODO: Send push notification when notifications service is ready
      console.log(`Notify ${invite.sender_email_address}: Friend request accepted by ${user.email}`);

      return { success: true, message: "Friend request accepted!" };
    } catch (error) {
      console.error("Error accepting invite:", error);
      return { success: false, message: "Failed to accept invite. Please try again." };
    }
  }

  /**
   * Decline an invite
   */
  async declineInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) {
        return { success: false, message: "User not authenticated" };
      }

      const invite = await OnlineDB.Invite.read(inviteId);
      if (!invite) {
        return { success: false, message: "Invite not found" };
      }

      // Verify this invite is for the current user
      if (invite.recipient_email_address !== normalize(user.email)) {
        return { success: false, message: "This invite is not for you" };
      }

      // Check if invite is still valid
      if (invite.status !== "pending") {
        return { success: false, message: "This invite is no longer valid" };
      }

      if (new Date(invite.expires_at) < new Date()) {
        invite.status = "expired";
        await OnlineDB.Invite.update(inviteId, invite);

        return { success: false, message: "This invite has expired" };
      }

      // Update invite status
      invite.status = "declined";
      invite.acceptedAt = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
      await OnlineDB.Invite.update(inviteId, invite);
      await OnlineDB.Changelog.create({
        room_id: invite.room_id,
        type: "invite_declined",
        user_reads_list: [normalize(user.email)],
        total_reads_needed: 2, // TODO: This still needs to be fixed
      });

      return { success: true, message: "Invite declined" };
    } catch (error) {
      console.error("Error declining invite:", error);
      return { success: false, message: "Failed to decline invite. Please try again." };
    }
  }

  /**
   * Cancel a sent invite
   */
  async cancelInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) {
        return { success: false, message: "User not authenticated" };
      }

      const invite = await OnlineDB.Invite.read(inviteId);
      if (!invite) {
        return { success: false, message: "Invite not found" };
      }

      // Verify this is the sender's invite
      if (invite.sender_email_address !== normalize(user.email)) {
        return { success: false, message: "You can only cancel your own invites" };
      }

      // Update invite status
      invite.status = "cancelled";
      await OnlineDB.Invite.update(inviteId, invite);

      return { success: true, message: "Invite cancelled" };
    } catch (error) {
      console.error("Error cancelling invite:", error);
      return { success: false, message: "Failed to cancel invite. Please try again." };
    }
  }

  /**
   * Get pending invites sent by current user
   */
  async getSentInvites(): Promise<Invite[]> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) return [];

      const invites = await OnlineDB.Invite.getAll({
        filters: [
          { field: "sender_email_address", operator: "==", value: normalize(user.email) },
          { field: "status", operator: "==", value: "pending" },
        ],
        sort: [{ field: "created_at", direction: "desc" }],
      });

      return invites;
    } catch (error) {
      console.error("Error getting sent invites:", error);
      return [];
    }
  }

  /**
   * Get pending invites received by current user
   */
  async getReceivedInvites(): Promise<Invite[]> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) return [];

      const invites = await OnlineDB.Invite.getAll({
        filters: [
          { field: "recipient_email_address", operator: "==", value: normalize(user.email) },
          { field: "status", operator: "==", value: "pending" },
        ],
        sort: [{ field: "created_at", direction: "desc" }],
      });

      // Filter out expired invites and mark them as expired
      const now = new Date();
      const valid_invites: Invite[] = [];
      for (const invite of invites) {
        if (new Date(invite.expires_at) < now) {
          invite.status = "expired";
          await OnlineDB.Invite.update(invite.id, invite);
          continue;
        }

        valid_invites.push(invite);
      }

      return valid_invites;
    } catch (error) {
      alert("ERROR: " + error);
      console.error("Error getting received invites:", error);
      return [];
    }
  }

  /**
   * Subscribe to real-time updates for sent invites
   */
  subscribeSentInvites(callback: (invites: Invite[]) => void): (() => void) | null {
    try {
      const user = auth.getUser();
      if (!user || !user.email) return null;

      // Set up real-time Firestore subscription
      return OnlineDB.Invite.subscribe(
        (invites) => {
          // Filter and process invites
          const validInvites = invites.filter((invite) => {
            // Check if not expired
            if (new Date(invite.expires_at) < new Date()) {
              // Mark as expired (fire and forget)
              OnlineDB.Invite.update(invite.id, { ...invite, status: "expired" });
              return false;
            }
            return true;
          });

          callback(validInvites);
        },
        {
          filters: [
            { field: "sender_email_address", operator: "==", value: normalize(user.email) },
            { field: "status", operator: "==", value: "pending" },
          ],
          sort: [{ field: "created_at", direction: "desc" }],
        }
      );
    } catch (error) {
      console.error("Error setting up sent invites subscription:", error);
      return null;
    }
  }

  /**
   * Subscribe to real-time updates for received invites
   */
  subscribeReceivedInvites(callback: (invites: Invite[]) => void): (() => void) | null {
    try {
      const user = auth.getUser();
      if (!user || !user.email) return null;

      // Set up real-time Firestore subscription
      return OnlineDB.Invite.subscribe(
        (invites) => {
          // Filter and process invites
          const validInvites = invites.filter((invite) => {
            // Check if not expired
            if (new Date(invite.expires_at) < new Date()) {
              // Mark as expired (fire and forget)
              OnlineDB.Invite.update(invite.id, { ...invite, status: "expired" });
              return false;
            }
            return true;
          });

          callback(validInvites);
        },
        {
          filters: [
            { field: "recipient_email_address", operator: "==", value: normalize(user.email) },
            { field: "status", operator: "==", value: "pending" },
          ],
          sort: [{ field: "created_at", direction: "desc" }],
        }
      );
    } catch (error) {
      console.error("Error setting up received invites subscription:", error);
      return null;
    }
  }

  private getExistingInvite(sender_email_address: string, recipient_email_address: string): Promise<Invite[]> {
    return OnlineDB.Invite.getAll({
      filters: [
        { field: "sender_email_address", operator: "==", value: normalize(sender_email_address) },
        { field: "recipient_email_address", operator: "==", value: normalize(recipient_email_address) },
        { field: "status", operator: "==", value: "pending" },
      ],
    });
  }
}

export const inviteService = new InviteService();

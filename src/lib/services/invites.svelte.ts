import { INVITE_EXPIRATION_DAYS, normalize } from "$lib";
import { Notify } from "./notifications/notifications";
import user from "$lib/core/user.svelte";
import { OnlineDB } from "$lib/OnlineDB";
import { Alert } from "$lib/core/alert";
import { t } from "./language.svelte";
import DateUtil from "$lib/DateUtil";
import { DB } from "$lib/DB";

class InviteService {
  invites: Invite[] = $state([]);

  handleNewInvites(invites: Invite[]) {
    if (!user.value) return;

    this.invites = invites;
    if (!invites.length) return;

    try {
      for (const invite of invites) {
        if (invite.recipient_email_address !== user.value.email) continue;
        if (invite.status !== "pending") continue;

        Alert.success(t("you_have_pending_invite_from", { email: invite.sender_email_address }));
      }
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      Alert.error(`${t("error_processing_invite_changes")}: ${error_message}`);
    }
  }

  /**
   * Send an invite to another user
   */
  async sendInvite(recipient_email_address: string): Promise<SimpleResult> {
    try {
      if (!user.value) {
        return { success: false, error_message: t("user_not_authenticated") };
      }

      const existing_invites = await this.getExistingInvite(user.value.email, recipient_email_address);
      if (existing_invites.length) {
        return { success: false, error_message: t("invite_already_sent") };
      }

      const room = await DB.Room.create({
        name: normalize(recipient_email_address.split("@")[0]),
        users: [{ email: normalize(recipient_email_address), pending: true }],
      });

      // Create the invite
      const expires_at = DateUtil.addDays(new Date(), INVITE_EXPIRATION_DAYS);
      await OnlineDB.Invite.create({
        sender_email_address: user.value.email,
        sender_name: user.value.name || user.value.email,
        recipient_email_address: normalize(recipient_email_address),
        room_id: room.id,
        status: "pending",
        expires_at: DateUtil.format(expires_at, "YYYY-MM-DD HH:mm:ss"),
      });

      // const [recipient_user] = await OnlineDB.User.getAll({
      //   filters: [{ field: "email_address", operator: "==", value: normalize(recipient_email_address) }],
      //   limit: 1,
      // });

      await Notify.Push.send({
        body: t("sent_you_friend_request", { name: user.value.name || user.value.email }),
        title: t("new_friend_invite"),
        email_address: [normalize(recipient_email_address)],
      });
      return { success: true };
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      return { success: false, error_message };
    }
  }

  /**
   * Accept an invite and create friendship
   */
  async acceptInvite(invite_id: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!user.value) {
        return { success: false, message: t("user_not_authenticated") };
      }

      const invite = await OnlineDB.Invite.read(invite_id);
      if (!invite) return { success: false, message: t("invite_not_found") };

      // Verify this invite is for the current user
      const is_my_invite = invite.recipient_email_address === user.value.email;
      if (!is_my_invite) return { success: false, message: t("invite_not_for_you") };

      // Check if invite is still valid
      const is_available = invite.status === "pending";
      if (!is_available) return { success: false, message: t("invite_no_longer_valid") };

      const has_expired = new Date(invite.expires_at) < new Date();
      if (has_expired) {
        invite.status = "expired";
        await OnlineDB.Invite.update(invite_id, invite);

        return { success: false, message: t("invite_has_expired") };
      }

      // Update invite status
      invite.status = "accepted";
      invite.acceptedAt = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
      await OnlineDB.Invite.update(invite_id, invite);

      const room = await DB.Room.create({
        id: invite.room_id,
        name: invite.sender_name,
        users: [{ email: invite.sender_email_address, pending: false }],
      });

      const email_address = user.value.email;
      await OnlineDB.Changelog.create({
        total_reads_needed: room.users.length,
        user_reads_list: [email_address],
        type: "invite_accepted",
        room_id: room.id,
      });

      await Notify.Push.send({
        body: t("accepted_your_friend_request", { name: user.value.name || email_address }),
        title: t("friend_request_accepted"),
        email_address: [invite.sender_email_address],
      });

      return { success: true, message: t("friend_request_accepted_success") };
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      return { success: false, message: error_message };
    }
  }

  /**
   * Decline an invite
   */
  async declineInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!user.value) {
        return { success: false, message: t("user_not_authenticated") };
      }

      const invite = await OnlineDB.Invite.read(inviteId);
      if (!invite) return { success: false, message: t("invite_not_found") };

      // Verify this invite is for the current user
      const is_my_invite = invite.recipient_email_address === user.value.email;
      if (!is_my_invite) return { success: false, message: t("invite_not_for_you") };

      // Check if invite is still valid
      const is_available = invite.status === "pending";
      if (!is_available) return { success: false, message: t("invite_no_longer_valid") };

      const has_expired = new Date(invite.expires_at) < new Date();
      if (has_expired) {
        invite.status = "expired";
        await OnlineDB.Invite.update(inviteId, invite);

        return { success: false, message: t("invite_has_expired") };
      }

      // Update invite status
      invite.status = "declined";
      invite.acceptedAt = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
      await OnlineDB.Invite.update(inviteId, invite);
      await OnlineDB.Changelog.create({
        room_id: invite.room_id,
        type: "invite_declined",
        user_reads_list: [user.value.email],
        total_reads_needed: 2, // TODO: This still needs to be fixed
      });

      return { success: true, message: t("invite_declined") };
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      return { success: false, message: error_message };
    }
  }

  /**
   * Cancel a sent invite
   */
  async cancelInvite(inviteId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!user.value) {
        return { success: false, message: t("user_not_authenticated") };
      }

      const invite = await OnlineDB.Invite.read(inviteId);
      if (!invite) {
        return { success: false, message: t("invite_not_found") };
      }

      // Verify this is the sender's invite
      if (invite.sender_email_address !== user.value.email) {
        return { success: false, message: t("you_can_only_cancel_own_invites") };
      }

      // Update invite status
      invite.status = "cancelled";
      await OnlineDB.Invite.update(inviteId, invite);

      return { success: true, message: t("invite_cancelled") };
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      return { success: false, message: error_message };
    }
  }

  /**
   * Get pending invites received by current user
   */
  async getReceivedInvites(): Promise<Invite[]> {
    try {
      if (!user.value) return [];

      const invites = await OnlineDB.Invite.getAll({
        filters: [
          { field: "recipient_email_address", operator: "==", value: user.value.email },
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
      Alert.error(t("error_getting_received_invites") + ": " + error);
      return [];
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

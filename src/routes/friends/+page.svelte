<script>
  import { AppNotification } from "$lib/services/appNotifications.svelte";
  import InputText from "$lib/components/element/input/InputText.svelte";
  import { CardInvite, CardRoom } from "$lib/components/element/card";
  import { inviteService } from "$lib/services/invites.svelte";
  import { Button } from "$lib/components/element/button";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { t } from "$lib/services/language.svelte";
  import { auth } from "$lib/services/auth.svelte";
  import { OnlineDB } from "$lib/OnlineDB";
  import { Check, Leave, Loading } from "$lib/icon";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";
  import { normalize } from "$lib";

  /** @type {Room[]} */
  let rooms = $state([]);

  let open = $state(false);
  let room_name = $state("");
  let edit_room_loading = $state(false);
  /** @type {Room | null} */
  let selected_room = $state(null);
  let error_message = $state("");

  const invites = $derived(inviteService.invites);

  const user_count = $derived(selected_room?.users?.length || 0);

  onMount(() => {
    const sub = DB.Room.subscribe((result) => (rooms = result), {
      selector: {},
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });

  async function saveRoom() {
    if (!selected_room) return;
    if (!room_name) {
      error_message = t("error.empty_category_name");
      return;
    }

    selected_room.name = room_name.trim();
    await DB.Room.update(selected_room?.id, selected_room);

    room_name = "";
    open = false;
  }

  /**
   * @param {Room} room
   */
  function handleEdit(room) {
    room_name = room.name;
    edit_room_loading = false;
    selected_room = room;
    open = true;
  }

  function handleClose() {
    open = false;
    edit_room_loading = false;
    room_name = "";
    error_message = "";
  }

  /**
   * @param {Room?} room
   */
  async function handleLeaveRoom(room) {
    const user = auth.getUser();
    if (!user || !user.email) return;

    if (!room) return;
    edit_room_loading = true;

    try {
      const user_email = normalize(user.email);
      const invites = await OnlineDB.Invite.getAll({
        filters: [
          { field: "room_id", operator: "==", value: room.id },
          { field: "status", operator: "==", value: "pending" },
          { field: "sender_email_address", operator: "==", value: user_email },
        ],
      });

      for (const invite of invites) {
        invite.status = "cancelled";
        OnlineDB.Invite.update(invite.id, invite);
      }

      await DB.Room.delete(room.id);
      await OnlineDB.Changelog.create({
        room_id: room.id,
        type: "left_room",
        total_reads_needed: room.users.length,
        user_reads_list: [user_email],
      });

      handleClose();
    } catch (error) {
      console.error("Error leaving room:", error);
      error_message = t("failed_to_leave_friend");
    }
  }

  /**
   * @param {string} invite_id
   */
  async function acceptInvite(invite_id) {
    try {
      const result = await inviteService.acceptInvite(invite_id);
      if (!result.success) {
        AppNotification.showError(result.message);
        return;
      }

      inviteService.invites = invites.filter(({ id }) => id !== invite_id);
      AppNotification.showSimple(result.message);
    } catch (error) {
      AppNotification.showError("Error accepting invite: " + error);
    }
  }

  /**
   * @param {string} invite_id
   */
  async function declineInvite(invite_id) {
    try {
      const result = await inviteService.declineInvite(invite_id);
      if (!result.success) return;

      inviteService.invites = invites.filter(({ id }) => id !== invite_id);
    } catch (error) {
      AppNotification.showError("Error declining invite: " + error);
    }
  }
</script>

<div class="space-y-2">
  {#each invites as invite (invite.id)}
    {#if invite.recipient_email_address === normalize(auth.user?.email || "")}
      <CardInvite {invite} onaccept={() => acceptInvite(invite.id)} ondecline={() => declineInvite(invite.id)} />
    {/if}
  {/each}

  <!-- Current Friends (Rooms) -->
  {#each rooms as room}
    <CardRoom {...room} onedit={() => handleEdit(room)} />
  {:else}
    <div class="text-center py-8">
      <Check class="text-4xl mx-auto mb-2 opacity-50" />
      <p>{t("no_friends_yet")}</p>
      <p class="text-sm mt-1">{t("accepted_friends_appear_here")}</p>
    </div>
  {/each}
</div>

<!-- Edit Room Modal -->
<Modal bind:is_open={open} title={t("edit_room")} onclose={handleClose}>
  <span class="pb-1">{t("choose_room_name")}</span>
  <InputText bind:value={room_name} focus_on_mount placeholder={t("choose_room_name")} disabled={edit_room_loading} />

  <div class="flex gap-2 mt-4">
    <Button
      class="border-0 bg-error! text-alt"
      onclick={() => handleLeaveRoom(selected_room)}
      type="button"
      disabled={edit_room_loading}
    >
      {#if !edit_room_loading}
        {t("leave_friend")}{user_count > 2 ? t("s") : ""}
        <Leave class="h-full" />
      {:else}
        <Loading />
        {t("leave_friend")}{user_count > 2 ? t("s") : ""}
      {/if}
    </Button>

    <button
      class="bg-primary w-full flex gap-1 items-center text-alt px-4 py-2 rounded-lg justify-center"
      type="button"
      disabled={edit_room_loading}
      onclick={saveRoom}
    >
      <Check class="h-full" />
      <span>{t("save")}</span>
    </button>
  </div>
</Modal>

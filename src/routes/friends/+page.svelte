<script>
  import InputText from "$lib/components/element/input/InputText.svelte";
  import { CardInvite, CardRoom } from "$lib/components/element/card";
  import { inviteService } from "$lib/services/invites.svelte";
  import Button from "$lib/components/element/button/Button.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { t } from "$lib/services/language.svelte";
  import { OnlineDB } from "$lib/OnlineDB";
  import { Check, Leave, Loading } from "$lib/icon";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";
  import user from "$lib/core/user.svelte";
  import { Alert } from "$lib/core/alert";
  import { Notify } from "$lib/services/notifications/notifications";
  import { BACK_BUTTON_FUNCTION } from "$lib";
  import { goto } from "$app/navigation";
  import { backHandler } from "$lib/BackHandler.svelte";

  /** @type {Room?} */
  let selected_room = null;

  /** @type {Room[]} */
  let rooms = $state([]);

  let open = $state(false);
  let room_name = $state("");
  let edit_room_loading = $state(false);
  let error_message = $state("");

  const invites = $derived(inviteService.invites);

  const user_count = $derived(selected_room?.users?.length || 0);

  onMount(() => {
    const sub = DB.Room.subscribe((result) => (rooms = result.sort(sortByPendingAndAlphabetical)), {
      selector: {},
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });

  onMount(() => {
    const token = (BACK_BUTTON_FUNCTION.value = backHandler.register(async () => {
      await goto(`/`);
    }, -1));

    return () => backHandler.unregister(token);
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
   * @param {Room} a
   * @param {Room} b
   */
  function sortByPendingAndAlphabetical(a, b) {
    const a_pending = a.users.some((user) => user.pending);
    const b_pending = b.users.some((user) => user.pending);
    if (a_pending && !b_pending) return -1;
    if (!a_pending && b_pending) return 1;
    return a.name.localeCompare(b.name);
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
    if (!user.value) return;

    if (!room) return;
    edit_room_loading = true;

    try {
      const promises = [];

      promises.push(
        new Promise(async () => {
          const email_address = user.value?.email;
          if (!email_address) return;

          const invites = await OnlineDB.Invite.getAll({
            filters: [
              { field: "room_id", operator: "==", value: room.id },
              { field: "status", operator: "==", value: "pending" },
              { field: "sender_email_address", operator: "==", value: email_address },
            ],
          });

          await Promise.all(
            invites.map((invite) => {
              invite.status = "cancelled";
              return OnlineDB.Invite.update(invite.id, invite);
            })
          );

          resolve(true);
        })
      );

      // Remove tasks assigned to this room
      const tasks = await DB.Task.getAll({ selector: { room_id: room.id } });
      for (const task of tasks) {
        task.room_id = null;
        promises.push(DB.Task.update(task.id, task));
      }

      promises.push(DB.Room.delete(room.id));

      const email_address = user.value.email;
      promises.push(
        OnlineDB.Changelog.create({
          room_id: room.id,
          type: "left_room",
          total_reads_needed: room.users.length,
          user_reads_list: [email_address],
        })
      );

      promises.push(
        new Promise(async (resolve) => {
          const email_addresses = [];
          for (const { email, pending } of room.users) {
            if (email && email !== email_address && !pending) {
              email_addresses.push(email);
            }
          }

          await Notify.Push.send({
            title: t("left_group"),
            body: t("user_left_group", { user_name: user.value.name, room_name: room.name }),
            email_address: email_addresses,
          });

          resolve(true);
        })
      );

      await Promise.all(promises);
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
        Alert.error(result.message);
        return;
      }

      inviteService.invites = invites.filter(({ id }) => id !== invite_id);
    } catch (error) {
      Alert.error("Error accepting invite: " + error);
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
      Alert.error("Error declining invite: " + error);
    }
  }
</script>

{#if !!user.value}
  <div class="space-y-2">
    {#each invites as invite (invite.id)}
      {#if invite.recipient_email_address === user.value.email}
        <CardInvite {invite} onaccept={() => acceptInvite(invite.id)} ondecline={() => declineInvite(invite.id)} />
      {/if}
    {/each}

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
{/if}

<Modal bind:is_open={open} onclose={handleClose} onsubmit={saveRoom}>
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
      type="submit"
      disabled={edit_room_loading}
    >
      <Check class="h-full" />
      <span>{t("save")}</span>
    </button>
  </div>
</Modal>

<script>
  import { Shared, Times } from "$lib/icon";
  import Button from "$lib/components/element/button/Button.svelte";
  import { CardRoom } from "$lib/components/element/card";
  import { onMount, tick } from "svelte";
  import { DB } from "$lib/DB";
  import { t } from "$lib/services/language.svelte";
  import Modal from "./modal/Modal.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} room_id
   */

  /** @type {Props} */
  let { room_id = $bindable() } = $props();

  let show = $state(false);
  /** @type {Room?} */
  let selected_room = $state(null);
  /** @type {Room[]} */
  let rooms = $state([]);
  /** @type {Record<string, HTMLButtonElement>} */
  let roomRefs = $state({});
  let hasScrolled = $state(false);

  onMount(async () => {
    const all_rooms = await DB.Room.getAll();
    rooms = all_rooms.filter((r) => r.users?.every((u) => !u.pending));
    selected_room = rooms.find((r) => r.id === room_id) || null;
  });

  $effect(() => {
    if (!hasScrolled && show && room_id && roomRefs[room_id]) {
      roomRefs[room_id].scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolled = true;
    }
  });

  /**
   * Handles click on a room.
   * @param {Room} room
   */
  async function selectRoom(room) {
    if (!!selected_room && selected_room.id === room.id) {
      selected_room = null;
      room_id = "";
    } else {
      selected_room = room;
      room_id = room.id;
    }

    await tick();
    show = false;
  }
</script>

<div class="grid grid-cols-[40px_auto_128px] py-2 bg-page border-y border-default">
  <Shared class="m-auto" />
  <div class="flex flex-col my-auto truncate">
    <span class="font-bold">{t("share_with_friends_question")}</span>
    {#if !!selected_room}
      <span class="space-x-0.5 flex flex-wrap truncate">
        <span class="italic">{t("shared_with")}</span>
        <span class="font-medium truncate">{selected_room.name}</span>
      </span>
    {/if}
  </div>

  <Button
    type="button"
    aria-label={t("share")}
    onclick={() => {
      show = true;
      hasScrolled = false;
    }}
    class={{
      "bg-card border border-default": !room_id,
      "bg-success/10! border-success! text-success!": !!room_id,
    }}
  >
    <Shared class="flex-shrink-0" />
    <span>{!!room_id ? t("shared") : t("share")}</span>
  </Button>
</div>

<Modal bind:is_open={show} onclose={() => (show = false)}>
  <h1 class="text-xl font-bold">{t("share_with_friends")}</h1>

  <div class="flex-1 overflow-y-auto mb-4 mt-2 rounded-lg space-y-4">
    {#each rooms as room (room.id)}
      <button
        aria-label="{room.name} room"
        type="button"
        class="w-full bg-card border border-default rounded-lg text-start group"
        bind:this={roomRefs[room.id]}
        onclick={() => selectRoom(room)}
      >
        <CardRoom {...room} selected={room.id === room_id} />
      </button>
    {/each}
  </div>
  <Button aria-label={t("close")} onclick={() => (show = false)}>
    <Times size={20} />
    <span>{t("close")}</span>
  </Button>
</Modal>

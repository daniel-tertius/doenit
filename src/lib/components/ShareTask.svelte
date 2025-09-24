<script>
  import { Shared, Times } from "$lib/icon";
  import { fade } from "svelte/transition";
  import Button from "$lib/components/element/button/Button.svelte";
  import { CardRoom } from "$lib/components/element/card";
  import { onMount, tick } from "svelte";
  import { auth } from "$lib/services/auth.svelte";
  import { DB } from "$lib/DB";

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
</script>

{#if auth.is_logged_in}
  <div class="grid grid-cols-[40px_auto_128px] py-2 bg-page border-y border-default">
    <Shared class="m-auto" />
    <div class="flex flex-col my-auto truncate">
      <span class="font-bold">Deel met vriende?</span>
      {#if !!selected_room}
        <span class="space-x-0.5 flex flex-wrap truncate">
          <span class="italic">Gedeel met:</span>
          <span class="font-medium truncate">{selected_room.name}</span>
        </span>
      {/if}
    </div>

    <Button
      type="button"
      aria-label="Share"
      onclick={() => {
        show = true;
        hasScrolled = false;
      }}
      class={{
        "bg-success/10! border-success! text-success!": !!room_id,
      }}
    >
      <Shared />
      <span>{!!room_id ? "Gedeel" : "Deel"}</span>
    </Button>
  </div>
{/if}

{#if show}
  <div
    class="fixed top-0 left-0 w-full h-full flex item-center justify-center bg-black/50 z-50"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150, delay: 200 }}
  >
    <div class="max-w-[90%] w-[600px] h-[66.66%] bg-surface border border-default rounded-lg p-4 m-auto flex flex-col">
      <h1 class="text-xl font-bold">Deel met vriende</h1>

      <div class="flex-1 overflow-y-auto mb-4 mt-2 rounded-lg space-y-4">
        {#each rooms as room (room.id)}
          <button
            aria-label="{room.name} room"
            type="button"
            class="w-full bg-card border border-default rounded-lg text-start group"
            bind:this={roomRefs[room.id]}
            onclick={async () => {
              selected_room = room;
              room_id = room.id;
              await tick();
              show = false;
            }}
          >
            <CardRoom {...room} selected={room.id === room_id} />
          </button>
        {/each}
      </div>
      <Button
        type="button"
        aria-label="Close"
        onclick={() => {
          show = false;
        }}
      >
        <Times size={20} />
        <span>Close</span>
      </Button>
    </div>
  </div>
{/if}

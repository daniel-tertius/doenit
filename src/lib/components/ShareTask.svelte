<script>
  import { Shared, Times } from "$lib/icon";
  import { fade } from "svelte/transition";
  import Button from "$lib/components/element/button/Button.svelte";
  import { CardRoom } from "$lib/components/element/card";
  import { onMount, tick } from "svelte";

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
    rooms = [
      { id: "1", name: "Cynel", created_at: "", users: ["cynel.vanniekerk@protonmail.com"] },
      {
        id: "2",
        name: "UNAFFI Devs",
        created_at: "",
        users: ["tertius@unaffi.com", "ivan@unaffi.com", "dean@unaffi.com"],
      },
      {
        id: "3",
        name: "van Niekerks",
        created_at: "",
        users: [
          "cynel.vanniekerk@protonmail.com",
          "danie.vanniekerk@protonmail.com",
          "heike.vanniekerk@protonmail.com",
        ],
      },
      { id: "4", name: "Room 4", created_at: "", users: ["131415@example.com"] },
      {
        id: "5",
        name: "Room 5",
        created_at: "",
        users: ["161718@example.com", "192021@example.com", "222324@example.com"],
      },
      { id: "6", name: "Room 6", created_at: "", users: ["252627@example.com", "282930@example.com"] },
      {
        id: "7",
        name: "Room 7",
        created_at: "",
        users: ["313233@example.com", "343536@example.com", "373839@example.com", "404142@example.com"],
      },
      { id: "8", name: "Room 8", created_at: "", users: ["434445@example.com"] },
    ];

    selected_room = rooms.find((r) => r.id === room_id) || null;
  });

  $effect(() => {
    if (!hasScrolled && show && room_id && roomRefs[room_id]) {
      roomRefs[room_id].scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolled = true;
    }
  });
</script>

<div class="grid grid-cols-[40px_auto_128px] py-2 border-y border-dark-800">
  <Shared size={32} class="m-auto" />
  <div class="flex flex-col my-auto">
    <span class="font-bold">Deel met vriende?</span>
    {#if !!selected_room}
      <span class="space-x-0.5">
        <span class="italic">Gedeel met:</span><span class="font-medium">{selected_room.name}</span>
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
      "bg-green-300! border-green-800! text-green-800!": !!room_id,
    }}
  >
    <Shared size={16} />
    <span>{!!room_id ? "Gedeel" : "Deel"}</span>
  </Button>
</div>

{#if show}
  <div
    class="fixed top-0 left-0 w-full h-full flex item-center justify-center bg-black/50 z-50"
    in:fade={{ duration: 150 }}
    out:fade={{ duration: 150, delay: 200 }}
  >
    <div
      class="max-w-[90%] w-[600px] h-[66.66%] bg-dark-500 border border-dark-700 rounded-lg p-4 m-auto flex flex-col"
    >
      <h1 class="text-xl font-bold">Deel met vriende</h1>

      <div class="flex-1 overflow-y-auto mb-4 mt-2 rounded-lg space-y-4">
        {#each rooms as room (room.id)}
          <button
            aria-label="{room.name} room"
            type="button"
            class="w-full text-start group"
            bind:this={roomRefs[room.id]}
          >
            <CardRoom
              {...room}
              selected={room.id === room_id}
              onclick={async () => {
                selected_room = room;
                room_id = room.id;
                await tick();
                show = false;
              }}
            />
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

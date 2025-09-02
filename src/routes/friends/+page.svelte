<script>
  import { Button } from "$lib/components/element/button";
  import { CardRoom } from "$lib/components/element/card";
  import InputText from "$lib/components/element/input/InputText.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Edit, Leave, Plus } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  let rooms = $state([]);

  let open = $state(false);
  let room_name = $state("");
  /** @type {Room?} */
  let selected_room = $state(null);
  let error_message = $state("");

  const user_count = $derived(selected_room?.users.length);

  onMount(() => {
    rooms = [
      { id: "1", name: "Cynel", created_at: "", users: ["cynel.vanniekerk@protonmail.com"] },
      {
        id: "2",
        name: "UNAFFI Devs Something verylong that overflows",
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
  });

  function addCategory() {
    if (!room_name) {
      error_message = t("error.empty_category_name");
      return;
    }

    rooms.push({
      id: String(rooms.length + 1),
      name: room_name,
      created_at: new Date().toISOString(),
      users: [],
    });

    room_name = "";
    open = false;
  }

  function handleClose() {
    open = false;
    room_name = "";
    error_message = "";
  }
</script>

<div class="space-y-2">
  {#each rooms as room}
    <CardRoom
      {...room}
      onedit={() => {
        room_name = room.name;
        selected_room = room;
        open = true;
      }}
    />
  {/each}
</div>

<Modal bind:open {footer} title={t("edit_room")} onclose={handleClose}>
  <div class="p-4 space-y-4">
    <div>
      <div class="pb-1">{t("choose_room_name")}</div>
      <InputText bind:value={room_name} focus_on_mount placeholder={t("choose_room_name")} />

      {#if !!error_message}
        <div class="text-error text-sm mt-1 text-right w-full" transition:slide>
          <span>{error_message}</span>
        </div>
      {/if}
    </div>

    <Button class="border-red-200! bg-red-500/40! text-red-200!">
      Verlaat Vriend{user_count > 1 ? "e" : ""}
      <Leave class="h-full" size={20} />
    </Button>
  </div>
</Modal>

{#snippet footer()}
  <button
    class="bg-lime-600 flex gap-1 items-center text-black px-4 py-2 rounded-md"
    type="button"
    onclick={addCategory}
  >
    <Edit class="h-full" size={18} />
    <span>{t("edit")}</span>
  </button>
{/snippet}

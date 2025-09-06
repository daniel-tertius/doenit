<script>
  import { Button } from "$lib/components/element/button";
  import { CardRoom } from "$lib/components/element/card";
  import InputText from "$lib/components/element/input/InputText.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Check, Edit, Leave, Plus, Save } from "$lib/icon";
  import { DB } from "$lib/DB";
  import { t } from "$lib/services/language.svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { auth } from "$lib/services/auth.svelte";

  /** @type {Room[]} */
  let rooms = $state([]);

  let open = $state(false);
  let room_name = $state("");
  /** @type {Room | null} */
  let selected_room = $state(null);
  let error_message = $state("");

  const user_count = $derived(selected_room?.users?.length || 0);

  onMount(() => {
    const sub = DB.Room.subscribe((result) => (rooms = result), {
      selector: {},
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });

  function saveRoom() {
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

  /**
   * @param {Room} room
   */
  function handleEdit(room) {
    room_name = room.name;
    selected_room = room;
    open = true;
  }

  function handleClose() {
    open = false;
    room_name = "";
    error_message = "";
  }
</script>

{#if !auth.is_signed_in}
  <div class="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
    <p class="text-lg text-muted-foreground">
      Verifieer jou epos adres by instellings om die vriende funksie te aktiveer.
    </p>
    <a href="/settings#auth" class="text-lime-500 underline">Gaan na instellings</a>
  </div>
{:else}
  <div class="space-y-2">
    {#each rooms as room}
      <CardRoom {...room} onedit={() => handleEdit(room)} />
    {/each}
  </div>

  <Modal bind:is_open={open} title={t("edit_room")} onclose={handleClose}>
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
    <button
      class="bg-lime-600 flex gap-1 items-center text-black px-4 py-2 rounded-md ml-auto"
      type="button"
      onclick={saveRoom}
    >
      <Check class="h-full" size={18} />
      <span>{t("save")}</span>
    </button>
  </Modal>
{/if}

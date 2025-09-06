<script>
  import { Plus } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { fly, slide } from "svelte/transition";
  import { Button } from "./element/button";
  import InputText from "./element/input/InputText.svelte";
  import { DB } from "$lib/DB.js";

  let open = $state(false);
  let friend_email = $state("");
  let error_message = $state("");
  let is_loading = $state(false);

  /**
   * Validates email format
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function addFriend() {
    if (!friend_email.trim()) {
      error_message = t("required_field");
      return;
    }

    if (!isValidEmail(friend_email)) {
      error_message = t("invalid_email");
      return;
    }

    is_loading = true;
    error_message = "";

    try {
      // Check if room with this user already exists
      const existingRooms = await DB.Room.getAll();
      const roomExists = existingRooms.some(room => 
        room.users.includes(friend_email.toLowerCase())
      );
        
      if (roomExists) {
        error_message = t("friend_already_added");
        return;
      }

      // Create a new room with the friend's email
      const roomName = `${t("friends_with")} ${friend_email.split('@')[0]}`; // Better default name
      
      const newRoom = await DB.Room.create({
        name: roomName,
        users: [friend_email.toLowerCase()],
      });

      // Show success message (in a real app, this would send an invitation)
      alert(t("invite_sent_to", { email: friend_email }));
      
      friend_email = "";
      open = false;
    } catch (error) {
      console.error("Error adding friend:", error);
      error_message = t("add_friend_error");
    } finally {
      is_loading = false;
    }
  }

  function handleClose() {
    open = false;
    friend_email = "";
    error_message = "";
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.key === "Escape") {
      handleClose();
    } else if (event.key === "Enter" && !is_loading && friend_email.trim()) {
      addFriend();
    }
  }
</script>

<button
  class="bg-lime-600/40 text-white flex gap-1 w-15 rounded-full h-15 justify-center items-center px-4 py-2"
  type="button"
  onclick={() => (open = true)}
>
  <Plus size={20} />
</button>

{#if open}
  <div
    class="absolute bottom-[92px] left-0 bg-dark-400 border-y border-dark-600 rounded-t-md p-4 flex gap-2 w-full"
    transition:fly={{ duration: 300, y: 100 }}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-label={t("connect_with_friend")}
    tabindex="-1"
  >
    <div class="flex flex-col w-full gap-2">
      <div class="flex justify-between items-center">
        <span class="font-medium">{t("connect_with_friend")}</span>
        <button
          type="button"
          onclick={handleClose}
          class="text-t-secondary/60 hover:text-t-secondary transition-colors"
          aria-label={t("close")}
        >
          <Plus size={16} class="rotate-45" />
        </button>
      </div>

      <InputText
        bind:value={friend_email}
        placeholder={t("enter_friend_email")}
        type="email"
        oninput={() => (error_message = "")}
        onkeydown={(/** @type {KeyboardEvent} */ e) => {
          if (e.key === "Enter" && !is_loading && friend_email.trim()) {
            addFriend();
          }
        }}
        class={error_message ? "border-error" : ""}
        focus_on_mount={true}
      />

      {#if error_message}
        <div class="text-error text-sm mt-1 text-right w-full" transition:slide>
          <span>{error_message}</span>
        </div>
      {/if}

      <Button
        class="bg-lime-600/40 text-white"
        type="button"
        onclick={addFriend}
        disabled={is_loading || !friend_email.trim()}
      >
        {#if is_loading}
          <span>{t("sending")}</span>
        {:else}
          <span>{t("send_invite")}</span>
        {/if}
      </Button>
    </div>
  </div>
{/if}

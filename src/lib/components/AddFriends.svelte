<script>
  import { inviteService } from "$lib/services/invites.svelte";
  import { t } from "$lib/services/language.svelte";
  import InputText from "./element/input/InputText.svelte";
  import { slide } from "svelte/transition";
  import Button from "./element/button/Button.svelte";
  import { Plus } from "$lib/icon";
  import { isValidEmail, normalize } from "$lib";
  import user from "$lib/core/user.svelte";

  let open = $state(false);
  let friend_email = $state("");
  let error_message = $state("");
  let success_message = $state("");
  let is_loading = $state(false);

  async function sendInvite() {
    if (!user.value) {
      error_message = t("log_in_first");
      return;
    }

    if (!friend_email.trim()) {
      error_message = t("required_field");
      return;
    }

    friend_email = normalize(friend_email);
    if (!isValidEmail(friend_email)) {
      error_message = t("invalid_email");
      return;
    }

    // Check if user is trying to invite themselves
    if (user.value.email === friend_email) {
      error_message = t("cannot_invite_yourself");
      return;
    }

    is_loading = true;
    error_message = "";
    success_message = "";

    try {
      const result = await inviteService.sendInvite(friend_email);
      if (!result.success) {
        error_message = result.error_message;
        return;
      }

      // AppNotification.showSimple(t("invitation_sent"));
    } catch (error) {
      console.error("Error sending invite:", error);
      error_message = t("add_friend_error");
    }

    is_loading = false;
    handleClose();
  }

  function handleClose() {
    open = false;
    friend_email = "";
    error_message = "";
    success_message = "";
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (event.key === "Escape") {
      handleClose();
    } else if (event.key === "Enter" && !is_loading && friend_email.trim()) {
      sendInvite();
    }
  }
</script>

{#if !!user}
  <button
    class="bg-primary text-alt flex gap-1 w-15 rounded-full h-15 justify-center items-center px-4 py-2"
    type="button"
    onclick={() => (open = true)}
  >
    <Plus class="text-xl" />
  </button>
{/if}

{#if open}
  <div
    class="absolute bottom-[92px] left-0 bg-page border-y border-default rounded-t-lg p-4 flex gap-2 w-full"
    transition:slide
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-label={t("connect_with_friend")}
    tabindex="-1"
  >
    <div class="flex flex-col w-full gap-2">
      <div class="flex justify-between items-center">
        <span class="font-medium">{t("connect_with_friend")}</span>
        <button type="button" onclick={handleClose} aria-label={t("close")} class="p-2">
          <Plus class="rotate-45 text-lg" />
        </button>
      </div>

      <InputText
        bind:value={friend_email}
        placeholder={t("enter_friend_email")}
        type="email"
        oninput={() => (error_message = "")}
        onkeydown={(/** @type {KeyboardEvent} */ e) => {
          if (e.key === "Enter" && !is_loading && friend_email.trim()) {
            sendInvite();
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

      {#if success_message}
        <div class="text-success text-sm mt-1 text-right w-full" transition:slide>
          <span>{success_message}</span>
        </div>
      {/if}

      <Button
        class="bg-primary text-alt"
        type="button"
        onclick={sendInvite}
        disabled={is_loading || !friend_email.trim() || !user}
      >
        {#if is_loading}
          <span>{t("sending")}</span>
        {:else}
          <span>{t("send_invite")}</span>
        {/if}
      </Button>

      {#if !user}
        <div class="text-orange-500 text-xs text-center">
          {t("log_in_first")}
        </div>
      {/if}
    </div>
  </div>
{/if}

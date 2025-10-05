<script>
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Alert } from "$lib/core/alert";
  import user, { signIn, signOut } from "$lib/core/user.svelte";
  import { t } from "$lib/services/language.svelte";

  let is_open = $state(false);

  async function handleSignIn() {
    const result = await signIn();
    if (result.success) return;

    Alert.error(result.error_message || t("something_went_wrong"));
  }

  async function handleSignOut() {
    is_open = false;

    const result = await signOut();
    if (result.success) return;

    Alert.error(result.error_message || t("something_went_wrong"));
  }
</script>

<div class="bg-surface rounded-lg items-center p-4 flex flex-col relative gap-4">
  {#if !user.value}
    <div class="text-center space-y-0.5">
      <h2 class="text-2xl font-semibold">{t("you_are_not_logged_in")}</h2>
      <p class="text-sm text-muted">{t("please_log_in_profile")}</p>
    </div>

    <button
      type="button"
      aria-label={t("log_in_with_google")}
      class="flex items-center bg-primary text-alt font-medium py-2 px-4 rounded-lg"
      onclick={handleSignIn}
    >
      {t("log_in_with_google")}
    </button>
  {:else}
    <button
      aria-label="teken uit"
      type="button"
      class="flex justify-start gap-4 w-full"
      onclick={() => (is_open = true)}
    >
      {#if user.value.avatar}
        <img
          src={user.value.avatar}
          alt={t("profile")}
          class="w-13 h-13 my-auto rounded-full"
          referrerpolicy="no-referrer"
        />
      {/if}

      <div class="space-y-0.5">
        <h2 class="text-2xl font-semibold">
          {user.value.name}
        </h2>
        <p class="text-sm font-medium text-muted">
          {user.value.email}
        </p>
      </div>
    </button>
  {/if}
</div>

<Modal bind:is_open class="max-w-[80%]!" onclose={() => (is_open = false)}>
  <div class="font-medium mb-2 text-lg">{t("sign_out")}?</div>
  <div class="flex gap-1 w-full justify-between">
    <button class="py-1 px-3 w-20 h-10 bg-card rounded-lg" onclick={() => (is_open = false)}>
      {t("no")}
    </button>
    <button class="py-1 px-3 w-20 h-10 bg-primary rounded-lg text-alt" onclick={() => handleSignOut()}>
      {t("yes")}
    </button>
  </div>
</Modal>

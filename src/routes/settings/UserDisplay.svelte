<script>
  import { Alert } from "$lib/core";
  import user, { signIn, signOut } from "$lib/core/user.svelte";
  import { t } from "$lib/services/language.svelte";

  async function handleSignIn() {
    const result = await signIn();
    if (result.success) return;

    Alert.error(result.error_message || t("something_went_wrong"));
  }

  async function handleSignout() {
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
    <div class="flex justify-start gap-4 w-full">
      <!-- Profile Picture -->
      <img
        src={user.value.avatar}
        alt={t("profile")}
        class="w-13 h-13 my-auto rounded-full"
        referrerpolicy="no-referrer"
      />

      <!-- User Info -->
      <div class="space-y-0.5">
        <h2 class="text-2xl font-semibold">
          {user.value.name}
        </h2>
        <p class="text-sm text-muted">
          {user.value.email}
        </p>
      </div>

      <button
        type="button"
        aria-label={t("sign_out")}
        class="underline text-sm text-muted opacity-80 absolute top-4 right-4"
        onclick={handleSignout}
      >
        {t("sign_out")}
      </button>
    </div>
  {/if}
</div>

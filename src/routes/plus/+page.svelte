<script>
  import { t } from "$lib/services/language.svelte";
  import { Crown, Check, Users, DownloadCloud } from "$lib/icon";
  import user from "$lib/core/user.svelte";
  import GetDoenitPlus from "$lib/components/GetDoenitPlus.svelte";
  import { BACK_BUTTON_FUNCTION } from "$lib";
  import { backHandler } from "$lib/BackHandler.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // Check if user has Plus subscription
  // TODO: Replace with actual subscription check from user data
  // @ts-ignore - Property will be added to User type
  const has_plus = $derived(user.value?.has_plus_subscription ?? false);

  // Benefits list
  const benefits = $derived([
    {
      icon: Users,
      title: t("benefit_rooms"),
      description: t("benefit_rooms_desc"),
    },
    {
      icon: DownloadCloud,
      title: t("benefit_backup"),
      description: t("benefit_backup_desc"),
    },
  ]);

  onMount(() => {
    const token = (BACK_BUTTON_FUNCTION.value = backHandler.register(async () => {
      await goto(`/`);
    }, -1));

    return () => backHandler.unregister(token);
  });

  async function handleSubscribe() {
    // TODO: Implement actual subscription logic
    // This will be handled by iOS App Store / Google Play Store
    console.log("Subscribe button clicked");
  }
</script>

<GetDoenitPlus class="bg-page" />
{#if false}
  <div class="min-h-screen pb-20">
    <!-- Header Section -->
    <div class="bg-surface border-b border-default p-6 text-center">
      <div class="flex justify-center mb-4">
        <div class="bg-primary/20 rounded-full p-4">
          <Crown class="text-5xl text-primary" />
        </div>
      </div>
      <h1 class="text-3xl font-bold mb-2">{t("doenit_plus")}</h1>
      <p class="text-t-secondary">{t("unlock_plus_features")}</p>
    </div>

    <!-- Current Plan Status -->
    {#if has_plus}
      <div class="mx-4 mt-4 bg-surface rounded-lg p-4 border border-primary">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-t-secondary">{t("current_plan")}</p>
            <p class="text-lg font-semibold text-primary">{t("plus_plan")}</p>
          </div>
          <Crown class="text-3xl text-primary" />
        </div>
      </div>
    {:else}
      <div class="mx-4 mt-4 bg-surface rounded-lg p-4 border border-default">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-t-secondary">{t("current_plan")}</p>
            <p class="text-lg font-semibold">{t("free_plan")}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Pricing Section -->
    {#if !has_plus}
      <div class="mx-4 mt-6">
        <div class="bg-primary rounded-lg p-6 text-alt">
          <div class="text-center mb-4">
            <div class="text-4xl font-bold mb-2">R20</div>
            <div class="text-lg opacity-90">{t("per_month")}</div>
          </div>

          <div class="space-y-2 mb-6 text-center">
            <p class="text-sm opacity-90">{t("trial_then_price")}</p>
            <p class="text-sm opacity-90">{t("auto_renews_monthly")}</p>
            <p class="text-sm opacity-90">{t("cancel_anytime")}</p>
          </div>

          <button
            type="button"
            onclick={handleSubscribe}
            class="w-full bg-alt text-primary py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
          >
            {t("start_free_trial")}
          </button>
        </div>
      </div>
    {/if}

    <!-- Benefits Section -->
    <div class="mx-4 mt-6">
      <h2 class="text-xl font-bold mb-4">{t("plus_benefits")}</h2>

      <div class="space-y-4">
        {#each benefits as benefit}
          {@const Icon = benefit.icon}
          <div class="bg-surface rounded-lg p-4 border border-default">
            <div class="flex items-start gap-4">
              <div class="bg-primary/20 rounded-full p-3 flex-shrink-0">
                <Icon class="text-2xl text-primary" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-lg mb-1">{benefit.title}</h3>
                <p class="text-t-secondary text-sm">{benefit.description}</p>
              </div>
              {#if has_plus}
                <Check class="text-2xl text-success flex-shrink-0" />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Why Plus Section -->
    <div class="mx-4 mt-8 mb-6">
      <h2 class="text-xl font-bold mb-4">{t("why_plus")}</h2>

      <div class="bg-surface rounded-lg p-4 border border-default space-y-4">
        <div>
          <h3 class="font-semibold mb-2">{t("plus_feature_collaboration")}</h3>
          <p class="text-t-secondary text-sm">{t("plus_feature_collaboration_desc")}</p>
        </div>

        <div class="border-t border-default pt-4">
          <h3 class="font-semibold mb-2">{t("plus_feature_peace_of_mind")}</h3>
          <p class="text-t-secondary text-sm">{t("plus_feature_peace_of_mind_desc")}</p>
        </div>
      </div>
    </div>
  </div>
{/if}

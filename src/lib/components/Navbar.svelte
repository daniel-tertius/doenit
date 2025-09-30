<script>
  import { page } from "$app/state";
  import user from "$lib/core/user.svelte";
  import { Categories, Home, Check, Settings, Shared } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { fly } from "svelte/transition";

  let isReady = false;

  setTimeout(() => {
    isReady = true;
  }, 300);

  let { onclose } = $props();

  const NAVIGATION_TIMES = $derived([
    { Icon: Home, label: t("home"), href: "/" },
    { Icon: Check, label: t("completed_tasks"), href: "/complete" },
    { Icon: Categories, label: t("categories"), href: "/categories" },
    // { Icon: Shared, label: t("friends"), href: "/friends", show: !!user.value },
    { Icon: Settings, label: t("settings"), href: "/settings" },
  ]);
</script>

<svelte:window
  onclick={() => {
    if (isReady) onclose();
  }}
/>

<aside
  transition:fly={{ x: -100 }}
  class="fixed top-0 left-0 w-64 h-full flex flex-col items-center justify-center bg-page shadow-r-lg z-50"
>
  <h2 class="text-lg font-semibold">{t("menu")}</h2>
  <ul class="mt-4 space-y-0">
    {#each NAVIGATION_TIMES as { Icon, label, href, show }}
      {#if show === undefined || show}
        {@const is_active = page.url.pathname === href}
        <li>
          <a
            {href}
            draggable="false"
            class="grid grid-cols-[32px_auto] gap-1 py-4 px-8 rounded-lg"
            class:bg-card={is_active}
            class:font-semibold={is_active}
          >
            <Icon class="text-xl my-auto" />
            <p class="my-auto">{label}</p>
          </a>
        </li>
      {/if}
    {/each}
  </ul>
</aside>

<script>
  import { page } from "$app/state";
  import { Categories, Home, Check, Settings } from "$lib/icon";
  import { t } from "$lib/services";
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
    { Icon: Settings, label: t("settings"), href: "/settings" },
  ]);
</script>

<svelte:window
  onclick={() => {
    if (isReady) onclose();
  }}
/>

<aside transition:fly={{ x: -100 }} class="fixed top-0 left-0 w-64 h-full bg-t-primary shadow-lg z-50">
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-lg font-semibold text-t-secondary">{t("menu")}</h2>
    <ul class="mt-4 space-y-2">
      {#each NAVIGATION_TIMES as { Icon, label, href }}
        {@const is_active = page.url.pathname === href}
        <li class="text-t-secondary">
          <a
            {href}
            draggable="false"
            class="flex gap-1 py-2 px-4 rounded transition-colors duration-300 hover:bg-t-primary-600"
            class:bg-t-primary-700={is_active}
            class:font-semibold={is_active}
          >
            <Icon />
            <p>{label}</p>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</aside>

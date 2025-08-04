<script>
  import { page } from "$app/state";
  import { Categories, Home, Check, Settings } from "$lib/icon";
  import { fly } from "svelte/transition";

  let isReady = false;

  setTimeout(() => {
    isReady = true;
  }, 300);

  let { onclose } = $props();

  const item = [
    { Icon: Home, label: "Tuis", href: "/" },
    { Icon: Check, label: "Voltooide Take", href: "/complete" },
    { Icon: Categories, label: "Kategorieë", href: "/categories" },
    { Icon: Settings, label: "Instellings", href: "/settings" },
  ];
</script>

<svelte:window
  onclick={() => {
    if (isReady) onclose();
  }}
/>

<aside transition:fly={{ x: -100 }} class="fixed top-0 left-0 w-64 h-full bg-t-primary shadow-lg z-50">
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-lg font-semibold text-t-secondary">Kieslys</h2>
    <ul class="mt-4 space-y-2">
      {#each item as { Icon, label, href }}
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

<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Loading, Back } from "$lib/icon";
  import { Capacitor } from "@capacitor/core";
  import { StatusBar } from "@capacitor/status-bar";
  import { onMount } from "svelte";

  let top = $state(0);

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/"].includes(page.url.pathname));

  function onclick() {
    goto("/");
  }

  onMount(async () => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setOverlaysWebView({ overlay: true });

    // @ts-ignore
    const { height = 0 } = await StatusBar.getInfo();
    top = height;
  });
</script>

{#if show}
  <div class="absolute left-0 z-50 flex items-center justify-center h-12" style="top: {top}px">
    <button
      class="rounded-full bg-t-primary-700 hover:bg-t-primary-800 m-1 font-semibold text-tertiary *:transition-all *:duration-300 focus:outline-none"
      {onclick}
    >
      <div class="h-10 w-10 p-1 flex justify-center items-center">
        {#if navigating.to}
          <Loading size={24} class="text-t-secondary" />
        {:else if !is_home}
          <Back size={24} class="text-t-secondary" />
        {/if}
      </div>
    </button>
  </div>
{/if}

<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Loading, Back } from "$lib/icon";
  import { App } from "@capacitor/app";
  import { Capacitor } from "@capacitor/core";
  import { onMount } from "svelte";

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/"].includes(page.url.pathname));

  function onclick() {
    window.history.back();
  }

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        if (!is_home) {
          goto("/");
        }
      });
    }

    return () => {
      App.removeAllListeners();
    };
  });
</script>

{#if show}
  <div class="absolute top-0 left-0 z-50 flex items-center justify-center h-12">
    <button
      class="rounded-full bg-[#5b758e] m-1 font-semibold text-white *:transition-all *:duration-300 hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
      {onclick}
    >
      <div class="h-10 w-10 p-1 flex justify-center items-center">
        {#if navigating.to}
          <Loading size={24} color="#d6dde3" />
        {:else if !is_home}
          <Back size={24} color="#d6dde3" />
        {/if}
      </div>
    </button>
  </div>
{/if}

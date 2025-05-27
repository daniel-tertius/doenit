<script>
  import { page } from "$app/state";
  import CreateItemButton from "$lib/components/CreateItemButton.svelte";
  import HomeButton from "$lib/components/HomeButton.svelte";
  import NavbarButton from "$lib/components/NavbarButton.svelte";
  import PageHeading from "$lib/components/PageHeading.svelte";

  import { browser } from "$app/environment";
  import "../app.css";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import { data } from "./Data.svelte";
  import { onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { App } from "@capacitor/app";
  import { goto } from "$app/navigation";

  let { children } = $props();

  const is_home = $derived(page.url.pathname === "/");

  let platform = $state("Unknown");

  $effect(() => {
    if (browser) {
      const userAgent = navigator.userAgent;
      platform = userAgent;
    }
  });

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        if (is_home) {
          App.exitApp();
        } else {
          goto("/");
        }
      });
    }

    return () => {
      App.removeAllListeners();
    };
  });
</script>

<div class="h-screen flex flex-col">
  <PageHeading />
  <main class="grow flex flex-col bg-[#325372]">
    <div class="grow flex flex-col relative max-w-[1000px] md:mx-auto p-2 mb-20 overflow-auto">
      {@render children()}
    </div>
  </main>

  <div
    class="flex fixed bottom-0 w-full gap-1 text-[#d6dde3] p-4 border-t border-[#d6dde3] bg-[#325372] h-20 justify-between"
  >
    <NavbarButton />

    {#if is_home}
      <CategoryFilter bind:categories={data.selected_category_ids} />
    {/if}

    <CreateItemButton />
    <HomeButton />
  </div>
</div>

<!-- <div class="text-wrap font-mono">
  {platform} // Mozilla/5.0 (Linux; Android 15;
</div> -->

<script>
  import CreateItemButton from "$lib/components/CreateItemButton.svelte";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import NavbarButton from "$lib/components/NavbarButton.svelte";
  import PageHeading from "$lib/components/PageHeading.svelte";
  import HomeButton from "$lib/components/HomeButton.svelte";
  import { Capacitor } from "@capacitor/core";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { App } from "@capacitor/app";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import "../app.css";

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

<PageHeading />
<main class="grow flex flex-col overflow-y-auto max-w-[1000px] md:mx-auto p-2">
  {@render children()}
</main>

<nav class="flex gap-2 shadow-sm text-[#d6dde3] p-4 border-t border-[#d6dde3] bg-[#325372] justify-between">
  <NavbarButton />

  {#if is_home}
    <CategoryFilter />
  {/if}

  <CreateItemButton />
  <HomeButton />
</nav>

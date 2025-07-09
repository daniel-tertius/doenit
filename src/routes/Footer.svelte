<script>
  import { page } from "$app/state";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import CreateItemButton from "$lib/components/CreateItemButton.svelte";
  import HomeButton from "$lib/components/HomeButton.svelte";
  import NavbarButton from "$lib/components/NavbarButton.svelte";

  const home_show = $derived(["/complete", "/categories", "/settings", "/new"].includes(page.url.pathname));
  const create_show = $derived(!["/complete", "/categories", "/settings", "/new"].includes(page.url.pathname));
  const is_home = $derived(page.url.pathname === "/");
</script>

<nav class="flex gap-2 p-4 border-t border-primary-600 bg-t-primary justify-between">
  <NavbarButton />

  {#if is_home}
    <CategoryFilter />
  {/if}

  
  {#if create_show}
    <CreateItemButton />
  {/if}

  {#if home_show}
    <HomeButton />
  {/if}
</nav>

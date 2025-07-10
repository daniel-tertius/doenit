<script>
  import { page } from "$app/state";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import { ButtonMainSubmit, ButtonNavbar } from "$lib/components/element/button";

  const is_home = $derived(page.url.pathname === "/");
</script>

<nav
  class="flex gap-2 p-4 border-t border-primary-600 bg-t-primary justify-between"
  style="padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px))"
>
  <ButtonNavbar />

  {#if is_home}
    <CategoryFilter />
  {/if}

  <ButtonMainSubmit />
</nav>

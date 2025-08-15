<script>
  import { page } from "$app/state";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import { ButtonMainSubmit, ButtonNavbar } from "$lib/components/element/button";

  const is_home = $derived(page.url.pathname === "/");
</script>

<nav class="flex gap-2 p-4 border-t border-light-500 dark:border-dark-400 bg-t-primary justify-between">
  <ButtonNavbar />

  {#if is_home}
    <CategoryFilter />
  {/if}

  <ButtonMainSubmit />
</nav>

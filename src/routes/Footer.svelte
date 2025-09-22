<script>
  import { ButtonMainSubmit, ButtonNavbar } from "$lib/components/element/button";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import AddFriends from "$lib/components/AddFriends.svelte";
  import { page } from "$app/state";

  const is_home = $derived(page.url.pathname === "/");
  const is_friends = $derived(page.url.pathname === "/friends");
  const is_create = $derived(page.url.pathname === "/create");
</script>

{#if !is_create}
  <nav class="relative bg-surface shadow-t-sm flex gap-2 p-4 z-10 border-t border-default justify-between">
    <ButtonNavbar />

    {#if is_home}
      <CategoryFilter />
    {:else if is_friends}
      <AddFriends />
    {/if}

    <ButtonMainSubmit />
  </nav>
{/if}

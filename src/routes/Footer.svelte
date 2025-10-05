<script>
  import ButtonMainSubmit from "$lib/components/element/button/ButtonMainSubmit.svelte";
  import ButtonNavbar from "$lib/components/element/button/ButtonNavbar.svelte";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import AddFriends from "$lib/components/AddFriends.svelte";
  import { page } from "$app/state";

  const is_home = $derived(page.url.pathname === "/");
  const is_friends = $derived(page.url.pathname === "/friends");
  const hide_footer = $derived(page.url.pathname === "/create" || page.params.item_id);
</script>

{#if !hide_footer}
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

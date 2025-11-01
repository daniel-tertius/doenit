<script>
  import ButtonMainSubmit from "$lib/components/element/button/ButtonMainSubmit.svelte";
  import ButtonNavbar from "$lib/components/element/button/ButtonNavbar.svelte";
  import CategoryFilter from "$lib/components/CategoryFilter.svelte";
  import Hotbar from "$lib/components/Hotbar.svelte";
  import { page } from "$app/state";

  const is_home = $derived(page.url.pathname === "/");
  const is_task_page = $derived(page.url.pathname === "/create" || page.params.item_id);
</script>

<nav class="shadow-t-sm">
  {#if is_home}
    <Hotbar />
  {/if}

  {#if !is_task_page}
    <div class="relative bg-surface flex gap-2 p-4 z-10 border-t border-default justify-between">
      <ButtonNavbar />

      {#if is_home}
        <CategoryFilter />
      {/if}

      <ButtonMainSubmit />
    </div>
  {/if}
</nav>

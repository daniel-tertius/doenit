<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Home } from "$lib/icon";
  import Loading from "$lib/icon/Loading.svelte";

  const show = $derived(["/complete", "/categories", "/settings", "/new"].includes(page.url.pathname));

  function onclick() {
    goto("/");
  }
</script>

{#if show}
  <button
    type="button"
    class="flex justify-center items-center rounded-full h-15 w-15 bg-primary-20l p-3 font-semibold text-tertiary transition-colors hover:bg-primary-10l focus:outline-none focus:ring-2 focus:ring-primary-20l focus:ring-offset-2"
    {onclick}
  >
    {#if navigating.to}
      <Loading size={24} class="text-tertiary" />
    {:else}
      <Home size={24} class="text-tertiary" />
    {/if}
  </button>
{/if}

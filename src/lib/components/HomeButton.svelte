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
    class="flex justify-center items-center rounded-full h-15 w-15 bg-t-primary-700 p-3 font-semibold text-t-secondary transition-colors hover:bg-t-primary-800"
    {onclick}
  >
    {#if navigating.to}
      <Loading size={24} />
    {:else}
      <Home size={24} />
    {/if}
  </button>
{/if}

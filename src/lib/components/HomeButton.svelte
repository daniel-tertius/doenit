<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Home } from "$lib/icon";
  import Loading from "$lib/icon/Loading.svelte";

  const show = $derived(["/complete", "/categories"].includes(page.url.pathname));

  function onclick() {
    goto("/");
  }
</script>

{#if show}
  <button
    type="button"
    class="flex justify-center items-center rounded-full h-15 w-15 bg-[#5b758e] p-3 font-semibold text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
    {onclick}
  >
    {#if navigating.to}
      <Loading size={24} color="#d6dde3" />
    {:else}
      <Home size={24} color="#d6dde3" />
    {/if}
  </button>
{/if}

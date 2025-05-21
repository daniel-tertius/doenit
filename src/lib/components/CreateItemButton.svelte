<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Plus, Back, Loading } from "$lib/icon";

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/complete", "/categories"].includes(page.url.pathname));

  function onclick() {
    if (is_home) {
      goto("/create");
    } else {
      goto("/");
    }
  }
</script>

{#if show}
  <button
    type="button"
    class="flex justify-center items-center rounded-full h-12 w-12 bg-[#5b758e] p-3 font-semibold text-white *:transition-all *:duration-300 hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
    {onclick}
  >
    {#if navigating.to}
      <Loading size={24} color="#d6dde3" />
    {:else if is_home}
      <Plus size={24} color="#d6dde3" />
    {:else}
      <Back size={24} color="#d6dde3" />
    {/if}
  </button>
{/if}

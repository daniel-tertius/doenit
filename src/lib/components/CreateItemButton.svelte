<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { Plus } from "$lib/icon";

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
    class="flex justify-center items-center rounded-full h-12 w-12 bg-[#5b758e] p-3 font-semibold text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
    {onclick}
  >
    <Plus size={24} color={is_home ? "#d6dde3" : "#BE2546"} class={is_home ? "" : "rotate-45"} />
  </button>
{/if}

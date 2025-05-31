<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Plus, Loading, Check } from "$lib/icon";
  import { untrack } from "svelte";

  let is_form_page = $state(false);

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/complete", "/categories"].includes(page.url.pathname));

  function onclick() {
    if (is_home) {
      goto("/create");
    } else {
      goto("/");
    }
  }

  $effect(() => {
    page.url;
    untrack(() => {
      is_form_page = !!document.getElementById("form");
    });
  });
</script>

{#if show}
  <button
    type={is_form_page ? "submit" : "button"}
    form={is_form_page ? "form" : null}
    class="flex justify-center items-center aspect-square rounded-full h-15 w-15 bg-[#5b758e] p-3 font-semibold text-white *:transition-all *:duration-300 hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
    onclick={is_form_page ? null : onclick}
  >
    {#if navigating.to}
      <Loading size={24} color="#d6dde3" />
    {:else if is_home}
      <Plus size={24} color="#d6dde3" />
    {:else}
      <Check size={24} color="#d6dde3" />
    {/if}
  </button>
{/if}

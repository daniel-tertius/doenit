<script>
  import { goto } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Plus, Loading, Check } from "$lib/icon";
  import { untrack } from "svelte";

  let is_form_page = $state(false);

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/complete", "/categories", "/about", "/new"].includes(page.url.pathname));

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
    class="flex justify-center items-center aspect-square rounded-full h-15 w-15 bg-primary-20l p-3 font-semibold text-tertiary *:transition-all *:duration-300 hover:bg-primary-10l focus:outline-none focus:ring-2 focus:ring-primary-20l focus:ring-offset-2"
    onclick={is_form_page ? null : onclick}
  >
    {#if navigating.to}
      <Loading size={24} class="text-tertiary" />
    {:else if is_home}
      <Plus size={24} class="text-tertiary" />
    {:else}
      <Check size={24} class="text-tertiary" />
    {/if}
  </button>
{/if}

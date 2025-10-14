<script>
  import { navigating, page } from "$app/state";
  import { Loading, Back } from "$lib/icon";

  const { onclick, ...rest } = $props();

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/"].includes(page.url.pathname));
</script>

{#if show}
  <button type="button" aria-label="Go back button" class="font-semibold h-full aspect-square p-1 max-h-12" {onclick}>
    <div {...rest} class={["flex justify-center items-center rounded-full aspect-square h-full", rest.class]}>
      {#if navigating.to}
        <Loading />
      {:else if !is_home}
        <Back class="text-2xl" />
      {/if}
    </div>
  </button>
{/if}

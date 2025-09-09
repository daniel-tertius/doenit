<script>
  import { navigating, page } from "$app/state";
  import { Loading, Back } from "$lib/icon";
  import { goto } from "$app/navigation";

  const is_home = $derived(page.url.pathname === "/");
  const show = $derived(!["/"].includes(page.url.pathname));

  function onclick() {
    goto("/");
  }
</script>

<div class="h-full mr-2 flex items-center justify-start">
  {#if show}
    <button type="button" aria-label="Go back button" class="font-semibold h-full aspect-square p-1 max-h-12" {onclick}>
      <div class="flex justify-center items-center rounded-full bg-card aspect-square h-full">
        {#if navigating.to}
          <Loading />
        {:else if !is_home}
          <Back class="text-2xl" />
        {/if}
      </div>
    </button>
  {/if}
</div>

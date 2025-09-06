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

<div class="h-full aspect-square flex items-start justify-center">
  {#if show}
    <button type="button" aria-label="Go back button" class="rounded-full bg-card mx-1 my-auto font-semibold" {onclick}>
      <div class="h-4xl w-4xl p-1 flex justify-center items-center">
        {#if navigating.to}
          <Loading />
        {:else if !is_home}
          <Back class="text-5xl" />
        {/if}
      </div>
    </button>
  {/if}
</div>

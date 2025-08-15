<script>
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { ButtonBack } from "$lib/components/element/button";
  import DeleteAll from "../lib/components/DeleteAll.svelte";

  /** @type {Record<string, string>} */
  const TITLES = {
    "/": "Taaklys",
    "/create": "Nuwe taak",
    "/[item_id]": "Wysig taak",
    "/complete": "Voltooide take",
    "/categories": "Kategorieë",
    "/settings": "Instellings",
  };

  const title = $derived(TITLES[page.route.id ?? "/"] || "Taaklys");
</script>

<div class="relative bg-t-primary shadow-md">
  <div class="w-full h-12 relative mx-auto p-2">
    {#key title}
      <div
        transition:fade={{ duration: 100 }}
        class="absolute inset-0 w-fit mx-auto flex items-center justify-center gap-1"
      >
        <img alt="logo" src="logo.png" height="35px" width="35px" />
        <h1 class="text-3xl font-bold text-tertiary text-center h-10 mx-auto">
          {title}
        </h1>
      </div>
    {/key}
  </div>

  <ButtonBack />
  <DeleteAll />
</div>

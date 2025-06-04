<script>
  import { page } from "$app/state";
  import { fade, slide } from "svelte/transition";
  import BackButton from "./BackButton.svelte";

  const TITLES = {
    "/": "Taaklys",
    "/create": "Nuwe taak",
    "/[item_id]": "Wysig taak",
    "/complete": "Voltooide take",
    "/categories": "Kategorieë",
  };
  const title = $derived(TITLES[page.route.id ?? "/"] || "Taaklys");
</script>

<div class="relative bg-[#325372] shadow-md">
  <div class="w-full h-12 relative mx-auto p-2">
    {#key title}
      <div class="absolute inset-0 w-fit mx-auto flex items-center justify-center">
        <h1 transition:fade={{ duration: 100 }} class="text-3xl font-bold text-[#d6dde3] text-center h-10 mx-auto">
          {title}
        </h1>
      </div>
    {/key}
  </div>

  <BackButton />
</div>

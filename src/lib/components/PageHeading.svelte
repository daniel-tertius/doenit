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

<div class="relative h-12 bg-[#325372] shadow-md">
  {#key title}
    <div class="absolute inset-0 w-fit mx-auto flex items-center justify-center">
      <h1 transition:fade={{ duration: 100 }} class="text-3xl font-bold text-[#d6dde3] text-center h-10 mx-auto">
        {title}
      </h1>
    </div>
  {/key}

  <BackButton />
</div>

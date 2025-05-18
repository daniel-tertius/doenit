<script>
  import { page } from "$app/state";
  import { slide } from "svelte/transition";

  const TITLES = {
    "/": "Taak lys",
    "/create": "Nuwe taak",
    "/[item_id]": "Wysig taak",
    "/complete": "Voltooide take",
    "/categories": "Kategorieë",
  };
  const title = $derived(TITLES[page.route.id ?? "/"] || "Taak lys");
</script>

<div class="p-3 bg-[#325372]">
  {#key title}
    <h1 in:slide={{ axis: "x" }} class="text-3xl font-bold text-[#d6dde3] w-full text-center h-10 mx-auto">
      {title}
    </h1>
  {/key}
</div>

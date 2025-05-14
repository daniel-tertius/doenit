<script>
  import { Undo } from "$lib/icon";
  import { fly } from "svelte/transition";

  let { show, onclick } = $props();
</script>

{#if show}
  <div class="fixed bottom-0 right-0 w-full p-2" in:fly={{ duration: 300, x: "-100%" }} out:fly={{ duration: 300, x: "100%" }}>
    <button
      class="p-4 w-full h-full flex gap-1 justify-center border border-[#233a50]/50 rounded-lg bg-black/50"
      type="submit"
      {onclick}
    >
      <span class="my-auto text-white">Merk as onvoltooi</span>
      <Undo color="#fff" />
    </button>
  </div>
{/if}

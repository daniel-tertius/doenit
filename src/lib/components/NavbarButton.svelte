<script>
  import { Burger } from "$lib/icon";
  import Navbar from "./Navbar.svelte";

  let is_open = $state(false);
</script>

<div class="">
  <button
    type="button"
    class="flex justify-center items-center rounded-md h-12 w-12 bg-[#5b758e] p-2 font-semibold text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
    onclick={() => (is_open = !is_open)}
  >
    <Burger color="#fff" size={28} />
  </button>
</div>

{#if is_open}
  <Navbar onclose={() => (is_open = false)} />
{/if}

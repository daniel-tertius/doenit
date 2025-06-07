<script>
  import { Burger } from "$lib/icon";
  import Navbar from "./Navbar.svelte";

  let is_open = $state(false);
</script>

<div class="">
  <button
    type="button"
    class="flex justify-center items-center rounded-md h-15 w-15 bg-primary-20l p-2 font-semibold text-tertiary transition-colors hover:bg-primary-10l focus:outline-none focus:ring-2 focus:ring-primary-20l focus:ring-offset-2"
    onclick={() => (is_open = !is_open)}
  >
    <Burger class="text-tertiary" size={28} />
  </button>
</div>

{#if is_open}
  <Navbar onclose={() => (is_open = false)} />
{/if}

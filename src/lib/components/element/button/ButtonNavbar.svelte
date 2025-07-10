<script>
  import { Burger } from "$lib/icon";
  import Navbar from "../../Navbar.svelte";

  let is_open = $state(false);
</script>

<div class="">
  <button
    type="button"
    class="flex justify-center items-center rounded-md h-15 w-15 bg-t-primary-700 p-2 transition-colors hover:bg-t-primary-800"
    onclick={() => (is_open = !is_open)}
  >
    <Burger class="text-t-secondary" size={28} />
  </button>
</div>

{#if is_open}
  <Navbar onclose={() => (is_open = false)} />
{/if}

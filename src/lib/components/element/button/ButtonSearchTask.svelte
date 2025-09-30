<script>
  import { Search } from "$lib/icon";
  import { fade } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {(p0: boolean) => void} [onclick]
   */

  /** @type {Props} */
  const { onclick = () => {} } = $props();

  let show = $state(false);

  function handleClick() {
    show = !show;
    onclick(show);
  }
</script>

<button
  class="h-full relative aspect-square flex justify-center items-center overflow-hidden"
  onclick={handleClick}
  type="button"
  aria-label="Search tasks"
>
  <!-- Improved slash -->
  <div
    class="absolute mr-1.5 w-2/3 h-0.5 border-2 rounded-full -rotate-45 duration-200"
    class:opacity-0={!show}
    style="transform: translate({show ? 0 : 100}%, 0%);"
  ></div>

  <Search class="text-3xl" />
</button>

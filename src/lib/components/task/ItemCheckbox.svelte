<script>
  import { Check } from "$lib/icon";
  import { tick } from "svelte";
  import { longpress } from "../long";

  let {
    tick_animation = $bindable(false),
    is_selected = $bindable(false),
    onselect = () => {},
    onlongpress = () => {},
    ...rest
  } = $props();

  const is_checked = $derived(is_selected || tick_animation);

  async function onclick() {
    tick_animation = !tick_animation;
    await tick();

    const start_time = performance.now();
    await onselect();
    const elapsed_time = performance.now() - start_time;

    if (elapsed_time < 500) await wait(500 - elapsed_time);
  }

  /** @param {number} ms */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
</script>

<button
  {...rest}
  use:longpress
  type="button"
  aria-label="check"
  {onlongpress}
  {onclick}
  class="absolute top-1/2 -translate-y-1/2 left-0 hover:bg-t-primary-700 hover:opacity-50 p-4 rounded-full {rest.class}"
>
  <div
    class="rounded-md border shadow-inner shadow-primary-800 transition-all duration-300 bg-slate-100 border-primary-900 h-5 w-5 flex items-center justify-center"
    class:bg-blue-600!={is_checked}
    class:border-blue-700!={is_checked}
  >
    {#if is_checked}
      <Check class="text-primary-invert" />
    {/if}
  </div>
</button>

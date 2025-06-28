<script>
  import { Check } from "$lib/icon";
  import { tick } from "svelte";
  import { longpress } from "../long";

  let {
    checkoff_animation = $bindable(false),
    is_selected = $bindable(false),
    onselect = () => {},
    onlongpress = () => {},
    ...rest
  } = $props();

  const is_checked = $derived(is_selected || checkoff_animation);

  async function onclick() {
    checkoff_animation = !checkoff_animation;
    await tick();

    const start_time = performance.now();
    await onselect();
    const elapsed_time = performance.now() - start_time;

    if (elapsed_time < 500) await wait(500 - elapsed_time);
  }

  /** @param {number} ms */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
</script>

<div {...rest} class="absolute top-1/2 -translate-y-1/2 left-4 {rest.class}">
  <button
    use:longpress
    {onlongpress}
    type="button"
    aria-label="check"
    class="rounded-md border shadow-inner shadow-tertiary transition-all duration-300 bg-primary-invert border-primary-invert-20d h-6 w-6 flex items-center justify-center"
    class:bg-blue-600!={is_checked}
    class:border-blue-700!={is_checked}
    {onclick}
  >
    {#if is_checked}
      <Check class="text-primary-invert" />
    {/if}
  </button>
</div>

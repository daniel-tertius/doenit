<script>
  import { Check } from "$lib/icon";
  import { longpress } from "../long";
  import { waitAtLeast } from "$lib";

  let {
    tick_animation = $bindable(false),
    is_selected = $bindable(false),
    onselect = async () => {},
    onlongpress = () => {},
    ...rest
  } = $props();

  const is_checked = $derived(is_selected || tick_animation);

  async function onclick() {
    tick_animation = !tick_animation;
    await waitAtLeast(async () => await onselect(), 500);
  }
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
      <Check class="text-white" />
    {/if}
  </div>
</button>

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

  async function onclick(e) {
    e.stopPropagation();

    tick_animation = !tick_animation;
    await waitAtLeast(() => onselect(e), 500);
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
    class="rounded-md border shadow-inner shadow-dark-600 transition-all duration-300 bg-slate-100 border-dark-700 h-5 w-5 flex items-center justify-center"
    class:shadow-inner={!is_checked}
    class:bg-blue-600!={is_checked}
    class:border-blue-700!={is_checked}
  >
    {#if is_checked}
      <Check class="text-white" />
    {/if}
  </div>
</button>

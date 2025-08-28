<script>
  import { Check } from "$lib/icon";
  import { longpress } from "../../long";
  import { t } from "$lib/services/language.svelte";

  let {
    tick_animation = $bindable(false),
    is_selected = $bindable(false),
    onselect = async () => {},
    onlongpress = () => {},
    ...rest
  } = $props();

  const is_checked = $derived(is_selected || tick_animation);

  /**
   * Handles the click event on the checkbox.
   * @param {Event} e
   */
  async function onclick(e) {
    tick_animation = !tick_animation;
    onselect(e);
  }
</script>

<button
  {...rest}
  use:longpress
  type="button"
  aria-label={t("check")}
  {onlongpress}
  {onclick}
  class="absolute top-1/2 -translate-y-1/2 left-0 hover:bg-t-primary-700 hover:opacity-50 p-4 rounded-full {rest.class}"
>
  <div
    class="rounded-md border shadow-inner shadow-dark-600 transition-all duration-300 bg-slate-100 border-dark-700 h-6 w-6 flex items-center justify-center"
    class:shadow-inner={!is_checked}
    class:bg-blue-600!={is_checked}
    class:border-blue-700!={is_checked}
  >
    {#if is_checked}
      <Check class="text-white" />
    {/if}
  </div>
</button>

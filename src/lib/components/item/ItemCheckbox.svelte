<script>
  import { Check } from "$lib/icon";
  import { tick } from "svelte";

  let { checkoff_animation = $bindable(), is_selected, onselect } = $props();

  const is_checked = $derived(is_selected || checkoff_animation);
</script>

<button
  type="button"
  aria-label="check"
  class="absolute top-1/2 -translate-y-1/2 left-3 rounded-md border-2 transition-all duration-300 {is_checked
    ? 'bg-blue-600 border-blue-700'
    : 'bg-transparent border-gray-400'} h-7 w-7 flex items-center justify-center transition-colors duration-200"
  onclick={async () => {
    checkoff_animation = true;
    await tick();
    const start_time = performance.now();
    await onselect();
    const elapsed_time = performance.now() - start_time;
    if (elapsed_time < 500) {
      await new Promise((resolve) => setTimeout(resolve, 500 - elapsed_time));
    }
  }}
>
  {#if is_checked}
    <Check class="text-gray-200" />
  {/if}
</button>

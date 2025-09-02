<script>
  import { ButtonClear } from "../button";

  let { value = $bindable(), focus_on_mount = false, can_clear = false, ...rest } = $props();

  function clearValue() {
    value = "";
  }

  /**
   * Focus the input element when it is mounted.
   * @param {HTMLElement} el
   */
  function init(el) {
    if (!focus_on_mount) return;

    setTimeout(() => {
      el?.focus();
      el?.click();
    }, 100);
  }
</script>

<div class="relative w-full">
  <input
    {...rest}
    type="text"
    use:init
    bind:value
    class={["bg-t-primary-600 border border-dark-900 p-2 h-12 w-full rounded-lg placeholder:text-t-secondary/60", rest.class ?? ""]}
  />

  {#if can_clear && value}
    <ButtonClear onclick={clearValue} />
  {/if}
</div>

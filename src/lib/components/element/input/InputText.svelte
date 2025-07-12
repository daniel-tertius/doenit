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

    setTimeout(() => el?.focus());
  }
</script>

<div class="relative w-full">
  <input
    {...rest}
    type="text"
    use:init
    bind:value
    class={[
      {
        "bg-t-primary-600 p-2 w-full rounded-lg placeholder:text-t-secondary/60": true,
      },
      rest.class ?? "",
    ]}
  />

  {#if can_clear && value}
    <ButtonClear onclick={clearValue} />
  {/if}
</div>

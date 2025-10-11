<script>
  import ButtonClear from "../button/ButtonClear.svelte";

  let { value = $bindable(), placeholder, focus_on_mount = false, can_clear = false, ...rest } = $props();

  /** @type {HTMLTextAreaElement | null} */
  let textarea = null;

  /**
   * Adjust the height of the textarea based on content
   */
  function adjustHeight() {
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * 4; // 4 lines max

    textarea.style.height = `${Math.min(scrollHeight, maxHeight) + 2}px`;
  }

  /**
   * Handle input event
   */
  function handleInput() {
    adjustHeight();
  }

  /**
   * Clear the textarea value
   */
  function clearValue() {
    value = "";
    if (textarea) {
      textarea.style.height = "auto";
    }
  }

  /**
   * Focus the textarea when it is mounted
   * @param {HTMLTextAreaElement} el
   */
  function init(el) {
    textarea = el;

    if (focus_on_mount) {
      setTimeout(() => {
        el?.focus();
        el?.click();
      }, 100);
    }

    // Initial height adjustment
    adjustHeight();
  }

  // Adjust height when value changes externally
  $effect(() => {
    value;
    setTimeout(() => adjustHeight(), 0);
  });
</script>

<div class="relative w-full">
  <textarea
    {...rest}
    use:init
    bind:value
    oninput={handleInput}
    {placeholder}
    rows="1"
    class={[
      "bg-card border border-default p-2 w-full rounded-lg placeholder:text-muted outline-none focus:ring-1 ring-primary resize-none overflow-y-auto",
      rest.class ?? "",
    ]}
  ></textarea>

  {#if can_clear && value}
    <ButtonClear onclick={clearValue} />
  {/if}
</div>

<script>
  import { fade, scale } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {boolean} [open=false] - Whether the modal is open.
   * @property {string} [title=""] - The title of the modal.
   * @property {boolean} [closeOnEscape=true] - Whether to close the modal on Escape key press.
   * @property {boolean} [closeOnOutsideClick=true] - Whether to close the modal when clicking outside.
   * @property {() => *} [children] - The content of the modal.
   * @property {() => *} [footer] - The footer content of the modal.
   * @property {() => *} [onclose] - Callback function to call when the modal is closed.
   */

  /** @type {Props} */
  let {
    open = $bindable(false),
    title = "",
    closeOnEscape = true,
    closeOnOutsideClick = true,
    children,
    onclose,
    footer,
  } = $props();

  function close() {
    if (onclose) onclose();
    open = false;
  }

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    if (closeOnEscape && e.key === "Escape" && open) {
      close();
    }
  }

  /**
   * @param {Event} e
   */
  function handleOutsideClick(e) {
    if (closeOnOutsideClick && e.target === e.currentTarget && open) {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <button
    type="button"
    class="modal-backdrop"
    aria-label="backdrop"
    onclick={handleOutsideClick}
    transition:fade={{ duration: 200 }}
  >
  </button>

  <div class="modal-content" transition:scale={{ start: 0.95, duration: 200 }}>
    <div class="modal-header">
      <h2 class="font-semibold text-primary">{title}</h2>
      <button type="button" class="close-button" onclick={close} aria-label="Close modal">✕</button>
    </div>
    <div class="modal-body">
      {@render children?.()}
    </div>
    <div class="modal-footer">
      <button type="button" class="py-2 px-4 bg-secondary text-tertiary rounded-md" onclick={close}>Kanselleer</button>
      {@render footer?.()}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .modal-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 101;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    color: #6c757d;
  }

  .modal-body {
    overflow-y: auto;
    flex: 1 1 auto;
  }

  .modal-footer {
    padding: 1rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
  }
</style>

<script>
  import { fade } from "svelte/transition";
  import { quadInOut } from "svelte/easing";
  import { Times } from "$lib/icon";

  /**
   * @typedef {Object} Props
   * @property {boolean} [close_button=true]
   * @property {boolean} [is_open=true]
   * @property {function(Event=): void} [onclose]
   *
   */

  /** @type {Props & { [key: string]: any }} */
  let { is_open = $bindable(true), children, close_button = true, onclose = () => {}, ...rest } = $props();
</script>

{#if is_open}
  <div
    class="fixed top-0 left-0 z-50 flex h-dvh w-dvw items-center justify-center bg-black/40"
    transition:fade={{ duration: 125, easing: quadInOut }}
    onclick={onclose}
    role="none"
  >
    <div
      class={[
        "relative shadow-lg max-h-[90dvh] w-[500px] max-w-[90dvw] overflow-y-auto rounded-lg bg-surface p-4",
        close_button && "pt-5",
        rest.class || "",
      ]}
      onclick={(e) => e.stopPropagation()}
      role="none"
    >
      {#if close_button}
        <button
          class="absolute top-0 right-0 p-2 rounded-full aspect-square"
          aria-label="Close modal"
          title="Close"
          onclick={onclose}
        >
          <Times class="text-lg" />
        </button>
      {/if}
      {@render children()}
    </div>
  </div>
{/if}

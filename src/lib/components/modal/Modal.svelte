<script>
  import { fade } from "svelte/transition";
  import { quadInOut } from "svelte/easing";
  import { Times } from "$lib/icon";
  import { untrack } from "svelte";
  import { Device } from "@capacitor/device";
  import { t } from "$lib/services/language.svelte";
  // import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
  // import { theme } from "$lib/services/theme.svelte";
  // import { DEFAULT_HEX_COLOR } from "$lib";

  /**
   * @typedef {Object} Props
   * @property {boolean} [close_button=true]
   * @property {boolean} [is_open=true]
   * @property {function(Event=): void} [onclose]
   *
   */

  /** @type {Props & { [key: string]: any }} */
  let { is_open = $bindable(true), children, close_button = true, onclose = () => {}, ...rest } = $props();

  $effect(() => {
    is_open;

    untrack(async () => {
      const info = await Device.getInfo();
      if (+info.osVersion <= 14) return;

      // TODO Get the colour of the white over black/50 and (dark theme).
      // EdgeToEdge.setBackgroundColor({
      //   color: theme.value === "dark" ? (DEFAULT_HEX_COLOR + is_open ? "44" : "") : "#F5F5F5",
      // });
    });
  });
</script>

{#if is_open}
  <div
    class="fixed top-0 left-0 z-50 flex h-dvh w-dvw items-center justify-center bg-black/40"
    transition:fade={{ duration: 125, easing: quadInOut }}
    onclick={onclose}
    role="none"
  >
    <form
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
          class="absolute top-2 right-2 p-2 rounded-full aspect-square"
          aria-label={t("close_modal")}
          title={t("close")}
          onclick={onclose}
        >
          <Times class="text-lg" />
        </button>
      {/if}
      {@render children()}
    </form>
  </div>
{/if}

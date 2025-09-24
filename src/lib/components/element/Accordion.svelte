<script>
  import { DownChevron, Lock } from "$lib/icon";
  import { slide } from "svelte/transition";
  import { t } from "$lib/services/language.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} label
   * @property {boolean} [show=false]
   * @property {boolean} [disabled=false]
   * @property {string} [disabled_message=""]
   * @property {import("svelte").Snippet} children
   */

  /** @type {Props} */
  let { children, label, show = $bindable(false), disabled = false, disabled_message = "" } = $props();
</script>

<div class="bg-surface rounded-lg {disabled ? 'opacity-60' : ''}">
  <button
    type="button"
    aria-label={t("accordion_toggle")}
    aria-expanded={show}
    {disabled}
    class="focus:outline-none w-full p-4 flex items-center justify-between rounded-lg transition-colors {disabled
      ? 'cursor-not-allowed'
      : 'hover:bg-t-primary-700 active:bg-t-primary-700'}"
    onclick={() => {
      if (!disabled) {
        show = !show;
      }
    }}
  >
    <div class="flex items-center gap-2">
      {#if disabled}
        <Lock class="text-lg" />
      {/if}
      <span class="font-semibold text-lg">
        {label}
      </span>
      <span>
        {disabled && disabled_message ? `(${disabled_message})` : ""}
      </span>
    </div>
    {#if !disabled}
      <DownChevron class="text-xl {show ? 'rotate-180' : ''}" />
    {/if}
  </button>

  {#if show && !disabled}
    <div transition:slide class="px-4 pb-4 space-y-3">
      {@render children()}
    </div>
  {/if}
</div>

<script>
  import ContextMenu from "$lib/components/ContextMenu.svelte";

  let show = $state(false);

  function toggle() {
    show = !show;
  }
</script>

<div class="h-full p-1">
  <button
    id="meer-opsies"
    aria-label="More options"
    type="button"
    class="bg-card rounded-full h-full aspect-square p-1"
    onclick={toggle}
  >
    <svg class="pointer-events-none h-full aspect-square" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
      <path
        class="pointer-events-none"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 6v.01M12 12v.01M12 18v.01"
      />
    </svg>
  </button>
</div>

{#if show}
  <ContextMenu bind:show />
{/if}

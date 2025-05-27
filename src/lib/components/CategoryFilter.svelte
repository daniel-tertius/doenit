<script>
  import { DownChevron } from "$lib/icon";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { data } from "../../routes/Data.svelte";

  let { categories = $bindable() } = $props();

  let showDropdown = $state(false);

  onMount(async () => {
    await data.refreshCategories();
  });
</script>

<svelte:window onclick={() => (showDropdown = false)} />

{#if showDropdown}
  <div transition:fade class="fixed inset-0 h-[calc(100%-80px)] w-full z-1 bg-black/25"></div>

  <div
    transition:slide
    class="absolute bottom-full left-0 right-0 mt-1 bg-[#325372] border border-[#d6dde3] rounded-t-md max-h-[66dvh] overflow-y-auto z-10"
  >
    {#each data.categories as { id, name } (id)}
      <button class="w-full flex items-center gap-1" onclick={(e) => e.stopPropagation()}>
        <label for={id} class="w-full flex p-2 hover:bg-[#3d648a] cursor-pointer text-left">
          <input {id} type="checkbox" bind:group={categories} value={id} class="mr-2" />
          {name}
        </label>
      </button>
    {/each}
  </div>
{/if}
<div class="relative w-full mx-2">
  <button
    class="bg-[#325372] w-full text-[#d6dde3] border-1 border-[#d6dde3] rounded h-12 px-2 flex items-center justify-between"
    onclick={(e) => {
      e.stopPropagation();
      showDropdown = !showDropdown;
    }}
  >
    {categories?.length ? `${categories.length} Categories Selected` : "All Categories"}
    <DownChevron class={showDropdown ? "-rotate-180" : ""} />
  </button>
</div>

<!-- TODO: Add Search -->
<!-- TODO: Save Filter in DB -->

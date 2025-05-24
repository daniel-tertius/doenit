<script>
  import { DownChevron } from "$lib/icon";
  import { slide } from "svelte/transition";

  let { all_categories = [], categories = $bindable() } = $props();

  let showDropdown = $state(false);
</script>

<svelte:window onclick={() => (showDropdown = false)} />

<div class="relative w-full mx-2">
  {#if showDropdown}
    <div
      transition:slide
      class="absolute bottom-full left-0 right-0 mt-1 bg-[#325372] border-2 border-[#d6dde3] rounded max-h-[50dvh] overflow-y-auto z-10"
    >
      {#each all_categories as { id, name } (id)}
        <button class="w-full flex items-center gap-1" onclick={(e) => e.stopPropagation()}>
          <label for={id} class="w-full flex p-2 hover:bg-[#3d648a] cursor-pointer text-left">
            <input {id} type="checkbox" bind:group={categories} value={id} class="mr-2" />
            {name}
          </label>
        </button>
      {/each}
    </div>
  {/if}

  <button
    class="bg-[#325372] w-full text-[#d6dde3] border-2 border-[#d6dde3] rounded h-12 px-2 flex items-center justify-between"
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

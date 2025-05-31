<script>
  import { DownChevron } from "$lib/icon";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { data } from "../../routes/Data.svelte";
  import CategoryButton from "./CategoryButton.svelte";
  import Plus from "$lib/icon/Plus.svelte";
  import CategoryCreateModal from "./CategoryCreateModal.svelte";

  let show_dropdown = $state(false);
  let is_adding = $state(false);
  let category_id = $state("");

  onMount(async () => {
    await data.refreshCategories();
  });
</script>

<svelte:window onclick={() => (show_dropdown = false)} />

{#if show_dropdown}
  <div
    transition:fade
    class="fixed inset-0 w-full z-1 bg-black/25"
    style="height: calc(100% - 93px - env(safe-area-inset-bottom, 0px));"
  ></div>

  <div
    transition:slide
    class="absolute left-0 right-0 mt-1 bg-[#325372] border border-[#d6dde3] rounded-t-md max-h-[66dvh] overflow-y-auto z-10"
    style="bottom: calc(93px + env(safe-area-inset-bottom, 0px))"
  >
    {#each data.categories as { id, name } (id)}
      <CategoryButton {id} {name} />
    {/each}

    <button class="relative w-full flex items-center gap-1 px-4" onclick={() => (is_adding = true)}>
      <Plus />
      <span class="w-full flex p-2 hover:bg-[#3d648a] cursor-pointer text-left font-semibold">
        Skep nuwe kategorie
      </span>
    </button>
  </div>
{/if}

<div class="relative w-full my-auto">
  <button
    class="bg-[#325372] w-full text-[#d6dde3] border-1 border-[#d6dde3] rounded h-12 px-2 flex items-center justify-between"
    onclick={(e) => {
      e.stopPropagation();
      show_dropdown = !show_dropdown;
    }}
  >
    {!!data.selected_categories_hash.size
      ? `${data.selected_categories_hash.size} Kategorieë geselekteer`
      : "Alle Kategorieë"}
    <DownChevron class={show_dropdown ? "-rotate-180" : ""} />
  </button>
</div>

<!-- TODO: Add Search -->

<CategoryCreateModal
  bind:open={is_adding}
  oncreate={async (new_category_id) => {
    await data.refreshCategories();
    data.selected_categories_hash.add(new_category_id);
  }}
  onclose={() => {
    category_id = "";
  }}
/>

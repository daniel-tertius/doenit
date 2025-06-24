<script>
  import { DownChevron } from "$lib/icon";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { data } from "../../routes/Data.svelte";
  import CategoryButton from "./CategoryButton.svelte";
  import Plus from "$lib/icon/Plus.svelte";
  import CategoryCreateModal from "./CategoryCreateModal.svelte";
  import PriorityFilter from "./PriorityFilter.svelte";
  import { selectedCategories } from "$lib/cached";

  const DEFAULT_NAME = "Standaard";

  let show_dropdown = $state(false);
  let is_adding = $state(false);

  /** @type {import('$lib/DB/DB').Category?} */
  let default_category = $state(null);

  onMount(async () => {
    await data.refreshCategories();
    default_category = data.categories.find(({ name }) => name === DEFAULT_NAME) ?? null;
  });

  function filterTasks() {
    let tasks = data.all_tasks;
    tasks = data.filterTasksByPriority(tasks);
    tasks = data.filterTasksByCategory(tasks);
    data.tasks = tasks;
  }
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
    class="absolute left-0 right-0 mt-1 bg-primary border-0 border-tertiary rounded-t-md max-h-[66dvh] overflow-y-auto z-10"
    style="bottom: calc(93px + env(safe-area-inset-bottom, 0px))"
  >
    <div class="text-center text-tertiary pt-1 -mb-2">
      <span class="h-fit leading-tight">Filtreer op:</span>
    </div>
    <PriorityFilter bind:important={data.filter.important} bind:urgent={data.filter.urgent} onclick={filterTasks} />

    {#if default_category}
      <CategoryButton id={default_category.id} name={default_category.name} />
    {/if}

    {#each data.categories ?? [] as { id, name } (id)}
      {#if name != DEFAULT_NAME}
        <CategoryButton {id} {name} />
      {/if}
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
    class="bg-primary-20l w-full text-tertiary border-0 border-tertiary rounded-md h-15 px-4 flex items-center justify-between"
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
    selectedCategories.set([...data.selected_categories_hash]);
  }}
/>

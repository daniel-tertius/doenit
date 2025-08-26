<script>
  import { Plus, DownChevron } from "$lib/icon";
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import { data } from "$lib/Data.svelte";
  import CategoryButton from "./CategoryButton.svelte";
  import CategoryCreateModal from "./CategoryCreateModal.svelte";
  import PriorityFilter from "./PriorityFilter.svelte";
  import { selectedCategories } from "$lib/cached";
  import { t } from "$lib/services";

  let show_dropdown = $state(false);
  let is_adding = $state(false);

  /** @type {Category?} */
  let default_category = $state(null);

  onMount(async () => {
    await data.refreshCategories();
    default_category = data.categories.find(({ is_default }) => is_default) ?? null;
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
  <div transition:fade class="fixed inset-0 w-full z-1 bg-black/25" style="height: calc(100% - 93px);"></div>

  <div
    transition:slide
    class="absolute left-0 text-t-secondary right-0 mt-1 bg-t-primary rounded-t-md max-h-[66dvh] overflow-y-auto z-10"
    style="bottom: calc(92px)"
  >
    <div class="text-center font-semibold pt-1 -mb-2">
      <span class="h-fit leading-tight">{t("filter_on")}:</span>
    </div>
    <PriorityFilter bind:important={data.filter.important} bind:urgent={data.filter.urgent} onclick={filterTasks} />

    {#if default_category}
      <CategoryButton id={default_category.id} name={t("DEFAULT_NAME")} />
    {/if}

    {#each data.categories ?? [] as { id, name, is_default } (id)}
      {#if !is_default}
        <CategoryButton {id} {name} />
      {/if}
    {/each}

    <button
      class="rounded relative w-full bg-active/30 flex items-center gap-1 px-4"
      onclick={() => (is_adding = true)}
    >
      <Plus />
      <span class="w-full flex p-2 cursor-pointer text-left font-semibold">{t("create_new_category")}</span>
    </button>
  </div>
{/if}

<div class="relative w-full">
  <button
    class="bg-t-primary-700 w-full text-t-secondary rounded-md h-15 px-4 flex items-center justify-between hover:bg-t-primary-700 transition-colors"
    onclick={(e) => {
      e.stopPropagation();
      show_dropdown = !show_dropdown;
    }}
  >
    {#if data.selected_categories_hash.size === 0}
      {t("all_categories")}
    {:else if data.selected_categories_hash.size === 1}
      {t("category_selected")}
    {:else}
      {t("categories_selected", { count: data.selected_categories_hash.size })}
    {/if}

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

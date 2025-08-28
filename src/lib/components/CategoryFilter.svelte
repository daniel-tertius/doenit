<script>
  import { Plus, DownChevron } from "$lib/icon";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { Selected } from "$lib/Data.svelte";
  import CategoryButton from "./CategoryButton.svelte";
  import CategoryCreateModal from "./CategoryCreateModal.svelte";
  import { selectedCategories } from "$lib/cached";
  import { t } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB";

  let show_dropdown = $state(false);
  let is_adding = $state(false);

  /** @type {Category?} */
  let default_category = $state(null);
  /** @type {Category[]} */
  let categories = $state([]);

  onMount(async () => {
    default_category = await DB.Category.getDefault();
  });

  onMount(() => {
    const sub = DB.Category.subscribe((result) => (categories = result), {
      selector: { archived: { $ne: true }, is_default: { $ne: true } },
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });
</script>

{#if show_dropdown}
  <div
    transition:slide
    class="absolute left-0 text-t-secondary right-0 mt-1 border border-t-primary-800 bg-t-primary rounded-t-md max-h-[66dvh] overflow-y-auto z-10"
    style="bottom: calc(92px)"
  >
    <div class="text-center font-semibold pt-1">
      <span class="h-fit leading-tight">{t("filter_on")}:</span>
    </div>

    {#if default_category}
      <CategoryButton id={default_category.id} name={t("DEFAULT_NAME")} />
    {/if}
    {#each categories as { id, name } (id)}
      <CategoryButton {id} {name} />
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
    {#if Selected.categories.size === 0}
      {t("all_categories")}
    {:else if Selected.categories.size === 1}
      {t("category_selected")}
    {:else}
      {t("categories_selected", { count: Selected.categories.size })}
    {/if}

    <DownChevron class={show_dropdown ? "-rotate-180" : ""} />
  </button>
</div>

<CategoryCreateModal
  bind:open={is_adding}
  oncreate={async (new_category_id) => {
    Selected.categories.add(new_category_id);
    selectedCategories.set([...Selected.categories]);
  }}
/>

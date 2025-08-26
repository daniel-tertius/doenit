<script>
  import InputText from "$lib/components/element/input/InputText.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Trash, Plus, Edit, Check } from "$lib/icon";
  import { t } from "$lib/services";
  import { fly, slide } from "svelte/transition";
  import { data } from "$lib/Data.svelte";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";

  let new_category_name = $state("");
  let edited_category_name = $state("");
  /** @type {string?} */
  let default_id;

  let error_message = $state("");
  let is_editing = $state(false);
  /** @type {Category?} */
  let category = $state(null);

  /** @type {Category?} */
  let default_category = $state(null);
  onMount(async () => {
    await data.refreshCategories();

    default_category = data.categories.find(({ is_default }) => is_default) ?? null;
    default_id = default_category?.id ?? "";
  });

  /**
   * @param {string} id
   */
  async function deleteCategory(id) {
    if (id === default_id) return;

    await DB.Category.archive(id);

    data.selected_categories_hash.delete(id);
    const index = data.categories.findIndex((category) => category.id === id);
    if (index !== -1) {
      data.categories.splice(index, 1);
    }

    data.refreshCategories();
  }

  /**
   * @param {Event} e
   */
  async function createCategory(e) {
    e.preventDefault();

    if (!new_category_name?.trim()) {
      error_message = t("enter_category_name");
      return;
    }

    await data.createCategory({ name: new_category_name.trim() });
    new_category_name = "";
  }

  async function editCategory() {
    if (!category) return;

    if (!edited_category_name.trim()) {
      error_message = t("enter_category_name");
      return;
    }

    category.name = edited_category_name.trim();
    await data.updateCategory(category);

    category = null;
    is_editing = false;
  }

  function openEditModal(cat) {
    category = cat;
    edited_category_name = cat.name;
    is_editing = true;
    error_message = "";
  }
</script>

<div class="flex flex-col space-y-2 text-t-secondary">
  <div>
    <form onsubmit={createCategory} class="flex gap-2 items-center h-12">
      <InputText
        bind:value={new_category_name}
        placeholder={t("enter_new_category_name")}
        class="w-full h-12 rounded-md dark:bg-dark-300 dark:border-dark-700 bg-white border border-light-500 px-4 py-2 text-sm font-medium transition-colors focus:outline-none"
        oninput={() => (error_message = "")}
      />

      <button
        class="h-full rounded-md dark:bg-dark-300 dark:border-dark-700 bg-light-200 border border-light-300 px-4 py-2 font-medium transition-colors hover:bg-t-primary-800 focus:outline-none"
      >
        <Plus />
      </button>
    </form>

    {#if error_message}
      <div class="text-error-20l text-sm mt-1 flex justify-end">
        {error_message}
      </div>
    {/if}
  </div>

  <div class="flex flex-col space-y-2">
    {#if default_category}
      <div in:slide out:fly={{ x: 100 }} class="flex items-center justify-between p-2 bg-t-primary-700 rounded-md">
        <div class="text-lg font-semibold">{t("DEFAULT_NAME")}</div>
      </div>
    {/if}

    {#each data.categories as category (category.id)}
      {#if !category.is_default}
        <div in:slide out:fly={{ x: 100 }} class="flex items-center justify-between bg-t-primary-700 rounded-md">
          <button class="p-2 w-fit" onclick={() => openEditModal(category)}>
            <Edit />
          </button>

          <div class="p-2 pl-0 w-full text-lg font-semibold">{category.name}</div>

          <button class="p-2 text-error hover:text-error-20d" onclick={() => deleteCategory(category.id)}>
            <Trash />
          </button>
        </div>
      {/if}
    {/each}
  </div>
</div>

<Modal bind:open={is_editing} {footer} title={t("edit_category_name")}>
  {#if category}
    <div class="p-4">
      <InputText
        bind:value={edited_category_name}
        focus_on_mount
        placeholder={t("enter_category_name")}
        oninput={() => (error_message = "")}
      />

      {#if !!error_message}
        <div class="text-error text-sm mt-1 text-right w-full" transition:slide>
          <span>{error_message}</span>
        </div>
      {/if}
    </div>
  {/if}
</Modal>

{#snippet footer()}
  <button
    class="bg-lime-600 flex gap-1 items-center text-black px-4 py-2 rounded-md"
    type="button"
    onclick={editCategory}
  >
    <Check class="h-full" size={18} />
    <span>{t("save")}</span>
  </button>
{/snippet}

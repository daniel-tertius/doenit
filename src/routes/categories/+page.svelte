<script>
  import { Trash, Plus, Edit, Check } from "$lib/icon";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { data } from "$lib/Data.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";

  const DEFAULT_NAME = "Standaard";

  let new_category_name = $state("");
  let edited_category_name = $state("");
  /** @type {string?} */
  let default_id;

  let error_message = $state("");
  let is_editing = $state(false);
  /** @type {import('$lib/DB/DB').Category?} */
  let category = $state(null);

  /** @type {import('$lib/DB/DB').Category?} */
  let default_category = $state(null);
  onMount(async () => {
    await data.refreshCategories();

    default_category = data.categories.find(({ name }) => name === DEFAULT_NAME) ?? null;
    default_id = default_category?.id ?? "";
  });

  /**
   * @param {string} id
   */
  async function deleteCategory(id) {
    if (id === default_id) return;

    const Db = DB.getInstance();
    await Db.Category.archive(id);

    const index = data.categories.findIndex((category) => category.id === id);
    if (index !== -1) {
      data.categories.splice(index, 1);
    }
  }

  /**
   * @param {Event} e
   */
  async function createCategory(e) {
    e.preventDefault();

    if (!new_category_name?.trim()) {
      error_message = "Benoem jou kategorie";
      return;
    }

    await data.createCategory({ name: new_category_name.trim() });
    new_category_name = "";
  }

  async function editCategory() {
    if (!category) return;

    if (!edited_category_name.trim()) {
      error_message = "Benoem jou kategorie";
      return;
    }

    category.name = edited_category_name.trim();
    await data.updateCategory(category);

    category = null;
    is_editing = false;
  }

  function init(el) {
    setTimeout(() => el?.focus());
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
      <input
        type="text"
        oninput={() => (error_message = "")}
        bind:value={new_category_name}
        placeholder="Voer nuwe kategorienaam in…"
        class="w-full h-full rounded-md bg-t-primary px-4 py-2 text-sm font-medium transition-colors focus:outline-none"
      />

      <button
        class="h-full rounded-md bg-t-primary-700 px-4 py-2 font-medium transition-colors hover:bg-t-primary-800 focus:outline-none"
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
        <div class="text-lg font-semibold">{default_category.name}</div>
      </div>
    {/if}

    {#each data.categories as category (category.id)}
      {#if category.name != DEFAULT_NAME}
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

<Modal bind:open={is_editing} {footer} title="Skep Kategorie">
  {#if category}
    <div class="p-4">
      <input
        type="text"
        use:init
        placeholder="Kies 'n naam vir jou kategorie"
        class="p-2 w-full rounded-lg border border-primary-600 mt-2"
        bind:value={edited_category_name}
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
    <span>Stoor</span>
  </button>
{/snippet}

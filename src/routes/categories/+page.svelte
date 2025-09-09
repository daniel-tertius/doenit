<script>
  import InputText from "$lib/components/element/input/InputText.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import { Trash, Plus, Edit, Check } from "$lib/icon";
  import { t } from "$lib/services/language.svelte";
  import { fly, slide } from "svelte/transition";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";

  let new_category_name = $state("");
  /** @type {string?} */
  let default_id;

  let error_message = $state("");
  let is_editing = $state(false);
  /** @type {{ name: string, id?: string }?} */
  let category = $state(null);
  /** @type {Category[]} */
  let categories = $state([]);

  onMount(() => {
    const sub = DB.Category.subscribe((result) => (categories = result), {
      selector: { archived: { $ne: true }, is_default: { $ne: true } },
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });

  onMount(async () => {
    const category = await DB.Category.getDefault();
    default_id = category.id;
  });

  /**
   * @param {Event} e
   */
  async function createCategory(e) {
    e.preventDefault();

    if (!new_category_name?.trim()) {
      error_message = t("enter_category_name");
      return;
    }

    await DB.Category.create({
      name: new_category_name.trim(),
      is_default: false,
    });

    new_category_name = "";
  }

  async function editCategory() {
    if (!category?.id) return;
    if (category.id === default_id) return;

    if (!category.name.trim()) {
      error_message = t("enter_category_name");
      return;
    }

    await DB.Category.update(category.id, { name: category.name.trim() });

    category = null;
    is_editing = false;
  }

  /**
   * @param {string} id
   */
  async function deleteCategory(id) {
    if (id === default_id) return;

    await DB.Category.archive(id);
  }

  /**
   * @param {Category} cat
   */
  function openEditModal({ name, id }) {
    category = { name, id };
    is_editing = true;
    error_message = "";
  }
</script>

<div class="flex flex-col space-y-4 pt-2 overflow-x-hidden">
  <div>
    <form onsubmit={createCategory} class="flex gap-2 items-center h-12">
      <InputText
        bind:value={new_category_name}
        placeholder={t("enter_new_category_name")}
        class="w-full h-12! rounded-lg bg-card border border-default px-4 py-2 text-sm font-medium focus:outline-none"
        oninput={() => (error_message = "")}
      />

      <button class="h-full rounded-lg bg-card border border-default px-4 py-2 font-medium focus:outline-none">
        <Plus />
      </button>
    </form>

    {#if error_message}
      <div class="text-error text-sm mt-1 flex justify-end">
        {error_message}
      </div>
    {/if}
  </div>

  <div class="flex flex-col space-y-2">
    <div class="flex items-center justify-between px-4 py-2 bg-surface rounded-md">
      <div class="text-lg font-semibold">{t("DEFAULT_NAME")}</div>
    </div>

    {#each categories as category (category.id)}
      <div
        in:slide
        out:fly={{ x: 100 }}
        class="grid grid-cols-[52px_1fr_48px] items-center justify-between bg-surface rounded-lg"
      >
        <button class="h-full w-full flex justify-center items-center" onclick={() => openEditModal(category)}>
          <div class="rounded-full p-2 w-fit flex justify-center items-center bg-card">
            <Edit />
          </div>
        </button>

        <div class="py-3 w-full text-lg font-semibold">{category.name}</div>

        <button class="h-full text-error flex items-center justify-center" onclick={() => deleteCategory(category.id)}>
          <Trash />
        </button>
      </div>
    {/each}
  </div>
</div>

<Modal bind:is_open={is_editing} onclose={() => (is_editing = false)}>
  {#if category}
    <div class="space-y-4">
      <div class="text-lg font-semibold">{t("edit_category_name")}</div>
      <InputText
        bind:value={category.name}
        focus_on_mount
        placeholder={t("enter_category_name")}
        oninput={() => (error_message = "")}
      />

      {#if !!error_message}
        <div class="text-error text-sm mt-1 text-right w-full" transition:slide>
          <span>{error_message}</span>
        </div>
      {/if}

      <button
        class="bg-primary flex gap-1 items-center text-white px-4 py-2 rounded-lg ml-auto"
        type="button"
        onclick={editCategory}
      >
        <Check class="h-full" size={18} />
        <span>{t("save")}</span>
      </button>
    </div>
  {/if}
</Modal>

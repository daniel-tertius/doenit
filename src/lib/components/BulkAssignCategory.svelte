<script>
  import ModalCreateCategory from "$lib/components/modal/ModalCreateCategory.svelte";
  import { t } from "$lib/services/language.svelte";
  import { Categories, Plus } from "$lib/icon";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";
  import Modal from "./modal/Modal.svelte";
  import { waitAtLeast } from "$lib";
  import { Selected } from "$lib/selected";

  /**
   * @typedef {Object} Props
   * @property {() => void} onclose
   */

  /** @type {Props} */
  const { onclose } = $props();

  /** @type {Category[]} */
  let categories = $state([]);
  let is_open = $state(false);
  let is_adding = $state(false);
  /** @type {string?} */
  let category_id = $state(null);

  onMount(() => {
    const sub = DB.Category.subscribe(assignCategories, {
      selector: { archived: { $ne: true }, is_default: { $ne: true } },
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });

  /**
   * @param {Category[]} new_categories
   */
  function assignCategories(new_categories) {
    const is_mounted = !categories.length;
    categories = new_categories;

    if (is_mounted) return;
    const category_exists = categories.some((c) => c.id === category_id);
    if (!category_exists) category_id = "";
  }

  /**
   * Select a category
   * @param {string} id
   */
  async function selectCategory(id) {
    category_id = id;

    await waitAtLeast(async () => {
      const task_ids = [...Selected.tasks];
      const tasks = await DB.Task.getAll({ selector: { id: { $in: task_ids } } });
      const promises = tasks.map(async (task) => {
        if (task.category_id === id) return Promise.resolve(task);
        task.category_id = id;
        await DB.Task.update(task.id, task);
        return task;
      });

      await Promise.all(promises);
    }, 200);

    onclose();
    is_open = false;
  }
</script>

<div>
  <button
    type="button"
    aria-label="Share Task"
    onclick={() => (is_open = true)}
    class="rounded-lg bg-card border border-default font-medium flex justify-between items-center p-4 w-full"
  >
    <span>{t('bulk_assign_category')}</span>
    <Categories />
  </button>

  <Modal bind:is_open>
    <h1 class="font-bold mb-4 leading-[120%]">{t("choose_category")}</h1>
    <div class="mb-4">
      {#each categories as category}
        {@const is_selected = category.id === category_id}
        <button
          type="button"
          onclick={() => selectCategory(category.id)}
          class={[
            "text-left flex border rounded-lg border-primary w-full py-2 outline-none",
            is_selected && "bg-primary/20",
            !is_selected && "border-transparent",
          ]}
        >
          <div
            class={[
              "my-auto mx-2 flex items-center justify-center w-4 h-4 aspect-square rounded-full border",
              is_selected ? "border-primary" : "",
            ]}
          >
            {#if is_selected}
              <div class="w-2 h-2 bg-primary rounded-full m-auto"></div>
            {/if}
          </div>

          <div class={["w-full p-1", !is_selected && "border-default"]}>
            <span>{category.name}</span>
          </div>
        </button>
      {:else}
        <p class="text-muted italic">{t("no_categories_yet")}</p>
      {/each}
    </div>

    <div>
      <button
        type="button"
        class="w-full mt-1 h-12 bg-card border border-default rounded-md flex items-center justify-center gap-2"
        onclick={() => {
          is_adding = true;
          is_open = false;
        }}
      >
        <Plus />
        <span>{t("add_category")}</span>
      </button>
    </div>
  </Modal>

  <ModalCreateCategory
    bind:open={is_adding}
    oncreate={(new_category_id) => {
      selectCategory(new_category_id);
    }}
    onclose={() => {
      category_id = "";
      onclose();
    }}
  />
</div>

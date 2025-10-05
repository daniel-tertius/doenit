<script>
  import ModalCreateCategory from "$lib/components/modal/ModalCreateCategory.svelte";
  import { t } from "$lib/services/language.svelte";
  import { DownChevron, Times } from "$lib/icon";
  import { onMount } from "svelte";
  import { DB } from "$lib/DB";

  let { category_id = $bindable() } = $props();

  /** @type {Category[]} */
  let categories = $state([]);
  let is_adding = $state(false);

  $effect(() => {
    if (category_id === null) {
      is_adding = true;
    }
  });

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
</script>

<div class="relative">
  <select
    id="category"
    bind:value={category_id}
    class="bg-card p-2 w-full border border-default rounded-lg open:text-normal appearance-none outline-none focus:ring ring-primary pr-6 truncate {!category_id &&
      'text-normal'}"
  >
    <option value="">{t("choose_category")}</option>
    {#each categories as category (category.id)}
      {#if !category.is_default}
        <option value={category.id}>{category.name}</option>
      {/if}
    {/each}
    <option class="font-semibold" value={null}>+ {t("create_category")}</option>
  </select>

  {#if category_id}
    <button onclick={() => (category_id = "")} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
      <Times size={18} />
    </button>
  {:else}
    <DownChevron class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" size={18} />
  {/if}
</div>

<ModalCreateCategory
  bind:open={is_adding}
  oncreate={(new_category_id) => {
    category_id = new_category_id;
  }}
  onclose={() => {
    category_id = "";
  }}
/>

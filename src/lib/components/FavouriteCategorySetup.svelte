<script>
  import { Cached } from "$lib/core/cache.svelte";
  import { SvelteSet } from "svelte/reactivity";
  import Tag from "$lib/components/Tag.svelte";
  import { onMount, untrack } from "svelte";
  import { DB } from "$lib/DB";
  import { Selected } from "$lib/selected";
  import { slide } from "svelte/transition";

  /** @type {Category[]} */
  let categories = $state([]);
  let is_initialized = $state(false);

  /** @type {SvelteSet<Category['id']>} */
  const selected_category_ids = new SvelteSet();

  $effect(() => {
    selected_category_ids.size;

    untrack(() => {
      if (!is_initialized) return;

      Cached.favouriteCategories.value = [...selected_category_ids].join(",");
    });
  });

  onMount(() => {
    const sub = DB.Category.subscribe(
      (result) =>
        (categories = result.sort((a, b) => {
          const aSelected = selected_category_ids.has(a.id) ? 1 : 0;
          const bSelected = selected_category_ids.has(b.id) ? 1 : 0;
          if (aSelected !== bSelected) {
            return bSelected - aSelected; // selected first
          }
          return a.name.localeCompare(b.name);
        })),
      {
        selector: { archived: { $ne: true }, is_default: { $ne: true } },
      }
    );

    return () => sub.unsubscribe();
  });

  onMount(async () => {
    is_initialized = true;
    const ids = Cached.favouriteCategories.value?.split(",") ?? [];
    for (const id of ids) {
      if (!id) continue;

      selected_category_ids.add(id);
    }
  });

  /**
   * @param {string} category_id
   */
  function toggle(category_id) {
    if (selected_category_ids.has(category_id)) {
      selected_category_ids.delete(category_id);
      Selected.categories.delete(category_id);
    } else {
      selected_category_ids.add(category_id);
      Selected.categories.add(category_id);
    }
  }
</script>

<div class="flex gap-1 flex-wrap">
  {#each categories as category (category.id)}
    {@const is_selected = !!selected_category_ids.has(category.id)}

    <Tag onclick={() => toggle(category.id)} {is_selected} class="max-w-60">
      <span class="truncate">{category.name}</span>
    </Tag>
  {/each}
</div>

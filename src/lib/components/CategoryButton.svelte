<script>
  import { selectedCategories } from "$lib/cached";
  import { data } from "$lib/Data.svelte";
  import { InputCheckbox } from "./element/input";

  let { id, name } = $props();

  const is_selected = $derived(data.selected_categories_hash.has(id));

  /**
   * Handles the selection of a category.
   * @param {*} event
   */
  function onselect(event) {
    if (event) event.stopPropagation();

    if (is_selected) {
      data.selected_categories_hash.delete(id);
    } else {
      data.selected_categories_hash.add(id);
    }
    selectedCategories.set([...data.selected_categories_hash]);

    let tasks = data.all_tasks;
    tasks = data.filterTasksByPriority(tasks);
    tasks = data.filterTasksByCategory(tasks);
    data.tasks = tasks;
  }
</script>

<button
  class={{
    "relative w-full flex items-center gap-1": true,
    "bg-t-primary-600": is_selected,
  }}
  onclick={onselect}
>
  <InputCheckbox {is_selected} tick_animation={is_selected} />
  <span class="w-full flex pl-12 p-2 cursor-pointer text-left">
    {name}
  </span>
</button>

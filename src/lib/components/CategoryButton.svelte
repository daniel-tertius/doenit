<script>
  import { selectedCategories } from "$lib/cached";
  import { Selected } from "$lib/Data.svelte";
  import { InputCheckbox } from "./element/input";

  let { id, name } = $props();

  const is_selected = $derived(Selected.categories.has(id));

  /**
   * Handles the selection of a category.
   * @param {Event} event
   */
  function onselect(event) {
    event.stopPropagation();

    if (is_selected) {
      Selected.categories.delete(id);
    } else {
      Selected.categories.add(id);
    }
    selectedCategories.set([...Selected.categories]);
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

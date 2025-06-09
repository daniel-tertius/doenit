<script>
  import { Times } from "$lib/icon";
  import { data } from "../../routes/Data.svelte";
  import CategoryCreateModal from "./CategoryCreateModal.svelte";

  let { category_id = $bindable() } = $props();

  const DEFAULT_NAME = "Standaard";

  let is_adding = $state(false);

  $effect(() => {
    if (category_id === null) {
      is_adding = true;
    }
  });
</script>

<div class="relative">
  <select
    id="category"
    bind:value={category_id}
    class="bg-primary-20l p-2 w-full rounded-lg border border-primary open:text-tertiary appearance-none pr-5 truncate {!category_id &&
      'text-tertiary-20d'}"
  >
    <option value="">Kies 'n kategorie</option>
    {#each data.categories as category (category.id)}
      {#if category.name != DEFAULT_NAME}
        <option value={category.id}>{category.name}</option>
      {/if}
    {/each}
    <option class="font-semibold" value={null}>+ Skep kategorie</option>
  </select>

  {#if category_id}
    <button onclick={() => (category_id = "")} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
      <Times class="text-tertiary" size={18} />
    </button>
  {/if}
</div>

<CategoryCreateModal
  bind:open={is_adding}
  oncreate={(new_category_id) => {
    category_id = new_category_id;
  }}
  onclose={() => {
    category_id = "";
  }}
/>

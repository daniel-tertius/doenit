<script>
  import { DownChevron, Times } from "$lib/icon";
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
    class="bg-t-primary-700 p-2 w-full border border-primary-600 rounded-md open:text-t-secondary appearance-none pr-6 truncate {!category_id &&
      'text-t-secondary/60'}"
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
    <button onclick={() => (category_id = "")} class="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-t-secondary">
      <Times size={18} />
    </button>
  {:else}
    <DownChevron class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-t-secondary" size={18} />
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

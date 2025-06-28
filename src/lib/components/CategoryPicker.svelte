<script>
  import { Times } from "$lib/icon";
  import DownChevron from "$lib/icon/DownChevron.svelte";
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
    class="bg-bg-light p-2 w-full rounded-md open:text-text appearance-none pr-5 truncate {!category_id &&
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
    <button onclick={() => (category_id = "")} class="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-text">
      <Times size={18} />
    </button>
  {:else}
    <DownChevron class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text" size={18} />
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

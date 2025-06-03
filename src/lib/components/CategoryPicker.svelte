<script>
  import { Times } from "$lib/icon";
  import { data } from "../../routes/Data.svelte";
  import CategoryCreateModal from "./CategoryCreateModal.svelte";

  let { category_id = $bindable() } = $props();

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
    class="bg-[#233a50]/50 p-2 w-full rounded-lg border border-[#223a51] open:text-gray-100 appearance-none pr-5 truncate"
    class:text-gray-400={!category_id}
  >
    <option value="">Kies 'n kategorie (opsioneel)</option>
    {#each data.categories as category (category.id)}
      <option value={category.id}>{category.name}</option>
    {/each}
    <option class="font-semibold bg-green-500/20" value={null}>+ Skep kategorie</option>
  </select>

  {#if category_id}
    <button onclick={() => (category_id = "")} class="absolute right-0 top-1/2 -translate-y-1/2 p-2">
      <Times class="text-slate-300" size={18} />
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

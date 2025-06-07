<script>
  import { Plus } from "$lib/icon";
  import { slide } from "svelte/transition";
  import Modal from "./modal/Modal.svelte";
  import { data } from "../../routes/Data.svelte";

  let { open = $bindable(), oncreate, onclose = () => {} } = $props();

  let new_category_name = $state("");
  let error_message = $state("");

  function init(el) {
    setTimeout(() => el?.focus());
  }

  async function addCategory() {
    if (!new_category_name.trim()) {
      error_message = "Voer 'n geldige kategorie naam in";
      return; // Do not create an empty category
    }

    open = false;
    data.createTask;
    const category = await data.createCategory({
      name: new_category_name.trim(),
    });

    new_category_name = "";
    open = false;
    oncreate(category?.id);
  }
</script>

<Modal bind:open {footer} title="Skep Kategorie" {onclose}>
  <div class="p-4 text-black">
    <input
      type="text"
      use:init
      placeholder="Kies 'n naam vir jou kategorie"
      class="p-2 w-full rounded-lg border border-primary mt-2"
      bind:value={new_category_name}
    />

    {#if !!error_message}
      <div class="text-red-500 text-sm mt-1" transition:slide>
        {error_message}
      </div>
    {/if}
  </div>
</Modal>

{#snippet footer()}
  <button
    class="bg-lime-500 flex gap-1 items-center text-black px-4 py-2 rounded-md"
    type="button"
    onclick={addCategory}
  >
    <Plus class="h-full" size={18} />
    <span>Skep</span>
  </button>
{/snippet}

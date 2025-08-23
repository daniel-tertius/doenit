<script>
  import { Plus } from "$lib/icon";
  import { slide } from "svelte/transition";
  import Modal from "./modal/Modal.svelte";
  import { data } from "$lib/Data.svelte";
  import InputText from "./element/input/InputText.svelte";
  import { t } from "$lib/services";

  let { open = $bindable(), oncreate, onclose: handleClose = () => {} } = $props();

  let new_category_name = $state("");
  let error_message = $state("");

  function init(el) {
    setTimeout(() => el?.focus());
  }

  async function addCategory() {
    if (!new_category_name.trim()) {
      error_message = t("enter_category_name");
      return;
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

  function onclose(e) {
    new_category_name = "";
    handleClose(e);
  }
</script>

<Modal bind:open {footer} title={t("create_category")} {onclose}>
  <div class="p-4">
    <InputText bind:value={new_category_name} focus_on_mount placeholder={t("choose_category_name")} />

    {#if !!error_message}
      <div class="text-error text-sm mt-1 text-right w-full" transition:slide>
        <span>{error_message}</span>
      </div>
    {/if}
  </div>
</Modal>

{#snippet footer()}
  <button
    class="bg-lime-600 flex gap-1 items-center text-black px-4 py-2 rounded-md"
    type="button"
    onclick={addCategory}
  >
    <Plus class="h-full" size={18} />
    <span>{t("create")}</span>
  </button>
{/snippet}

<script>
  import InputText from "../element/input/InputText.svelte";
  import { t } from "$lib/services/language.svelte";
  import { slide } from "svelte/transition";
  import Modal from "./Modal.svelte";
  import { Plus } from "$lib/icon";
  import { DB } from "$lib/DB";

  /**
   * @typedef {Object} Props
   * @property {boolean} [open=false] - Whether the modal is open.
   * @property {(name: string) => *} [oncreate] - Callback function to call when a category is created.
   * @property {() => *} [onclose] - Callback function to call when the modal is closed.
   */

  /** @type {Props} */
  let { open = $bindable(false), oncreate, onclose } = $props();

  let new_category_name = $state("");
  let error_message = $state("");

  async function addCategory() {
    if (!new_category_name.trim()) {
      error_message = t("enter_category_name");
      return;
    }

    open = false;
    const category = await DB.Category.create({
      name: new_category_name.trim(),
      is_default: false,
    });

    new_category_name = "";
    open = false;
    if (oncreate) {
      oncreate(category.id);
    }
  }

  function handleClose() {
    new_category_name = "";
    open = false;
    error_message = "";
    if (onclose) onclose();
  }
</script>

<Modal bind:is_open={open} onclose={handleClose}>
  <h2 class="text-lg font-semibold mb-2">{t("create_new_category")}</h2>
  <InputText bind:value={new_category_name} focus_on_mount placeholder={t("choose_category_name")} />

  {#if !!error_message}
    <div class="text-error text-sm mt-1 text-right w-full" transition:slide>
      <span>{error_message}</span>
    </div>
  {/if}

  <button
    class="bg-primary flex gap-1 items-center text-alt px-4 py-2 rounded-md ml-auto mt-4"
    type="button"
    onclick={addCategory}
  >
    <Plus size={18} />
    <span>{t("create")}</span>
  </button>
</Modal>

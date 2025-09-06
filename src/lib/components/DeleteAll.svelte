<script>
  import { t } from "$lib/services/language.svelte";
  import { fade } from "svelte/transition";
  import { Selected } from "$lib/selected";
  import Modal from "./modal/Modal.svelte";
  import { Trash } from "$lib/icon";
  import { page } from "$app/state";
  import { untrack } from "svelte";
  import { DB } from "$lib/DB";

  let is_deleting = $state(false);

  const page_route = $derived(page.route.id);

  $effect(() => {
    page_route;

    untrack(() => {
      Selected.tasks.clear();
    });
  });

  function deleteAll() {
    DB.Task.delete([...Selected.tasks.values()]);
    Selected.tasks.clear();
    is_deleting = false;
  }
</script>

<div class="h-full aspect-square flex items-end justify-between top-1">
  <!-- TODO Translation -->
  {#if Selected.tasks.size}
    <button
      transition:fade
      aria-label="Delete tasks label"
      class="aspect-square bg-error h-full rounded-md w-fit max-h-12 my-auto"
      onclick={() => (is_deleting = true)}
      type="button"
    >
      <Trash class="text-xl m-auto" />
    </button>
  {/if}
</div>

<Modal bind:is_open={is_deleting} title={t("delete_permanently")}>
  <p class="p-4">
    {Selected.tasks.size > 1 ? t("delete_confirmation_multiple") : t("delete_confirmation_single")}
  </p>
  <button
    class="bg-error flex gap-1 items-center text-white ml-auto px-4 py-2 rounded-md"
    type="button"
    onclick={deleteAll}
  >
    <Trash class="h-full" size={18} />
    <span>{t("delete")}</span>
  </button>
</Modal>

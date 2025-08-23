<script>
  import { slide } from "svelte/transition";
  import { data } from "$lib/Data.svelte";
  import { Trash } from "$lib/icon";
  import Modal from "./modal/Modal.svelte";
  import { untrack } from "svelte";
  import { page } from "$app/state";
  import { t } from "$lib/services";

  let is_deleting = $state(false);

  const page_route = $derived(page.route.id);
  $effect(() => {
    page_route;
    untrack(() => {
      data.selected_tasks_hash.clear();
    });
  });

  function deleteAll() {
    data.deleteTasks([...data.selected_tasks_hash.values()]);
    data.selected_tasks_hash.clear();
    is_deleting = false;
  }
</script>

{#if data.selected_tasks_hash.size}
  <div transition:slide class="absolute z-1 right-1 flex items-end justify-between top-1">
    <button
      class="px-4 py-2 flex gap-1 bg-error-10d text-tertiary rounded-md hover:bg-error-20d transition-colors"
      onclick={() => (is_deleting = true)}
      type="button"
    >
      <Trash />
    </button>
  </div>
{/if}

<Modal bind:open={is_deleting} {footer} title={t("delete_permanently")}>
  <p class="p-4">
    {data.selected_tasks_hash.size > 1 ? t("delete_confirmation_multiple") : t("delete_confirmation_single")}
  </p>
</Modal>

{#snippet footer()}
  <button
    class="bg-error-10d flex gap-1 items-center text-white px-4 py-2 rounded-md"
    type="button"
    onclick={deleteAll}
  >
    <Trash class="h-full" size={18} />
    <span>{t("delete")}</span>
  </button>
{/snippet}

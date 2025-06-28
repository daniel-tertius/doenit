<script>
  import { slide } from "svelte/transition";
  import { data } from "../../routes/Data.svelte";
  import { Trash } from "$lib/icon";
  import Modal from "./modal/Modal.svelte";
  import { onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { StatusBar } from "@capacitor/status-bar";

  let is_deleting = $state(false);
  let top = $state(0);

  onMount(async () => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setOverlaysWebView({ overlay: true });

    // @ts-ignore
    const { height = 0 } = await StatusBar.getInfo();
    top = height;
  });

  function deleteAll() {
    data.deleteTasks([...data.selected_tasks_hash.values()]);
    data.selected_tasks_hash.clear();
    is_deleting = false;
  }
</script>

{#if data.selected_tasks_hash.size}
  <div transition:slide class="absolute z-1 right-1 flex items-end justify-between" style="top: {top + 4}px">
    <button
      class="px-4 py-2 flex gap-1 bg-error-10d text-tertiary rounded-md hover:bg-error-20d transition-colors"
      onclick={() => (is_deleting = true)}
      type="button"
    >
      <Trash />
    </button>
  </div>
{/if}

<Modal bind:open={is_deleting} {footer} title="Vee permanent uit?">
  <p class="p-4">Is u seker u wil hierdie {data.selected_tasks_hash.size > 1 ? "take" : "taak"} permanent uitvee?</p>
</Modal>

{#snippet footer()}
  <button class="bg-error-10d flex gap-1 items-center text-white px-4 py-2 rounded-md" type="button" onclick={deleteAll}>
    <Trash class="h-full" size={18} />
    <span>Skrap</span>
  </button>
{/snippet}

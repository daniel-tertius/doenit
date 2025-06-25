<script>
  import { fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data as Data } from "../Data.svelte.js";
  import Trash from "$lib/icon/Trash.svelte";
  import Modal from "$lib/components/modal/Modal.svelte";
  import ItemCheckbox from "$lib/components/item/ItemCheckbox.svelte";
  import { onMount } from "svelte";
  import { Capacitor } from "@capacitor/core";
  import { StatusBar } from "@capacitor/status-bar";
  import EditTask from "$lib/components/EditTask.svelte";

  let { data } = $props();

  let task = $state(data.task);
  let is_deleting = $state(false);
  let error_message = $state("");
  let other_interval = $state(data.task.repeat_interval_number > 1 ? data.task.repeat_interval : "");
  let top = $state(0);

  onMount(async () => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setOverlaysWebView({ overlay: true });

    // @ts-ignore
    const { height = 0 } = await StatusBar.getInfo();
    top = height;
  });

  $effect(() => {
    if (!task.due_date) {
      task.repeat_interval = "";
      task.repeat_interval_number = 1;
      task.start_date = null;
    }
  });

  $effect(() => {
    if (task.repeat_interval === "weekly_custom_days") {
      task.start_date = task.due_date;
    }
  });

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (task.repeat_interval_number > 1) {
      task.repeat_interval = other_interval;
    }

    await Data.updateTask(task);

    //@ts-ignore
    onclose(event);
  }

  async function onclose() {
    await goto("/");
  }

  async function deleteTask() {
    await Data.deleteTasks([task.id]);
    await goto("/");
  }
</script>

<button
  type="button"
  class="fixed"
  style="right: calc(12px + env(safe-area-inset-right, 0px));"
  style:top="{top + 12}px"
  onclick={() => {
    is_deleting = true;
  }}
  aria-label="Sluit"
>
  <Trash class="w-6 h-6" color="#E01D1D" />
</button>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-4 text-tertiary grow relative">
  <EditTask bind:error_message bind:task bind:other_interval />

  <div class="grid gap-2 grid-cols-[auto_min-content] w-full h-11 items-center">
    <span class="font-bold text-left">Voltooi</span>
    <button
      class="relative w-11 h-11"
      type="button"
      onclick={() => {
        if (task.archived) {
          task.completed = 0;
          task.archived = false;
        } else {
          task.completed++;
        }
      }}
    >
      <ItemCheckbox is_selected={!!task.archived} checkoff_animation={!!task.archived} class="left-auto right-2.5" />
    </button>
  </div>
</form>

<Modal bind:open={is_deleting} {footer} title="Skrap Taak?">
  <p class="p-4">Is u seker u wil hierdie taak skrap?</p>
</Modal>

{#snippet footer()}
  <button
    class="bg-red-600 flex gap-1 items-center text-tertiary px-4 py-2 rounded-md"
    type="button"
    onclick={deleteTask}
  >
    <Trash class="h-full" size={18} />
    <span>Skrap</span>
  </button>
{/snippet}

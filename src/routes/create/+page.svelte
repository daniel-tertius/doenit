<script>
  import { fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { data as Data } from "../Data.svelte";
  import EditTask from "$lib/components/EditTask.svelte";

  /** @typedef {import('$lib/DB/DB').Task} Task */

  let { data } = $props();

  let task = $state(data.task);

  let other_interval = $state("");
  let error = $state({});

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();

    if (task.repeat_interval_number > 1) {
      task.repeat_interval = other_interval;
    }

    const result = await Data.createTask(task);
    console.log("Create task result:", result);
    if (!result.success) {
      error = result.error;
      return;
    }

    await goto(`/?new_id=${result.task.id}`);
  }
</script>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-4 text-tertiary grow relative">
  <EditTask bind:error bind:task bind:other_interval />
</form>

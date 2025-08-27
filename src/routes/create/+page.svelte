<script>
  import { fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import EditTask from "$lib/components/EditTask.svelte";
  import { language, t } from "$lib/services";
  import { DB } from "$lib/DB.js";

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

    const result = await createTask(task);
    if (!result.success) {
      error = result.error;
      return;
    }

    await goto(`/?new_id=${result.task.id}`);
  }

  /**
   * @param {Omit<Task, "id" | "created_at">} task
   * @returns {Promise<{ success: true, task: Task} | { success: false, error: { [x: string]: string } }>}
   */
  async function createTask(task) {
    if (!task) return { success: false, error: { message: "Geen Taak gevind" } };

    task.completed = 0;
    task.archived = false;

    task.name = task.name.trim();
    task.description = task.description?.trim() ?? "";
    const validation = validateTask(task);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const new_task = await DB.Task.create(task);
    return { success: true, task: new_task };
  }

  /**
   *
   * @param {Partial<Task>} task
   * @returns {{ success: true, task: Task} | { success: false, error: { [x: string]: string } }}
   */
  function validateTask(task) {
    if (!task) return { success: false, error: { message: "Geen Taak gevind" } };
    if (!task.name?.trim()) return { success: false, error: { name: "Wat moet gedoen word?" } };

    if (!!task.start_date && !!task.due_date && !!task.due_date && task.start_date > task.due_date) {
      return { success: false, error: { date: t("start_date_before_end") } };
    }

    if (task.archived && !task.completed) {
      task.archived = false;
    }

    if (!!task.completed && !task.repeat_interval) {
      if (!task.completed_at)
        task.completed_at = new Date().toLocaleString(language.value === "af" ? "af-ZA" : "en-US");
      if (!task.archived) task.archived = true;
    }

    // @ts-ignore
    return { success: true, task };
  }
</script>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-4 text-tertiary grow relative">
  <EditTask bind:error bind:task bind:other_interval />
</form>

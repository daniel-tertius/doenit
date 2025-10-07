<script>
  import { fly } from "svelte/transition";
  import { goto, onNavigate } from "$app/navigation";
  import EditTask from "$lib/components/EditTask.svelte";
  import { t, language } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB.js";
  import { OnlineDB } from "$lib/OnlineDB.js";
  import { navigating } from "$app/state";
  import { Check, Loading } from "$lib/icon";
  import user from "$lib/core/user.svelte.js";
  import { Notify } from "$lib/services/notifications/notifications.js";
  import { RateApp } from "$lib/services/rateApp.js";
  import { Alert } from "$lib/core/alert.js";

  let { data } = $props();

  let task = $state(data.task);

  let other_interval = $state("");
  let error = $state({});
  let is_saving = $state(false);

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    try {
      event.preventDefault();

      is_saving = true;

      if (task.repeat_interval_number > 1) {
        task.repeat_interval = other_interval;
      }

      const result = await createTask(task);
      if (!result.success) {
        error = result.error;
        return;
      }

      await goto(`/?new_id=${result.task.id}`);
    } catch (error) {
      Alert.error(`${t("error_creating_task")}: ${error}`);
    }

    is_saving = false;
  }

  /**
   * @param {Omit<Task, "id" | "created_at">} task
   * @returns {Promise<{ success: true, task: Task} | { success: false, error: { [x: string]: string } }>}
   */
  async function createTask(task) {
    if (!task) return { success: false, error: { message: t("no_task_found") } };

    task.completed = 0;
    task.archived = false;

    task.name = task.name.trim();
    task.description = task.description?.trim() ?? "";
    const validation = validateTask(task);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const new_task = await DB.Task.create(task);

    if (task.room_id) {
      if (!user.value) return { success: true, task: new_task };

      const room = await DB.Room.get(task.room_id);
      if (!room) throw new Error("Room not found");

      const email_address = user.value.email;
      await OnlineDB.Changelog.create({
        type: "create",
        data: JSON.stringify(new_task),
        room_id: task.room_id || "",
        total_reads_needed: room.users.length,
        user_reads_list: [email_address],
      });

      const email_addresses = [];
      for (const { email, pending } of room.users) {
        if (email && email !== email_address && !pending) {
          email_addresses.push(email);
        }
      }

      await Notify.Push.send({
        title: t("task_created"),
        body: t("task_was_created", { task_name: task.name }),
        email_address: email_addresses,
      });
    }

    return { success: true, task: new_task };
  }

  /**
   *
   * @param {Partial<Task>} task
   * @returns {{ success: true, task: Task} | { success: false, error: { [x: string]: string } }}
   */
  function validateTask(task) {
    if (!task) return { success: false, error: { message: t("no_task_found") } };
    if (!task.name?.trim()) return { success: false, error: { name: t("what_must_be_done") } };

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

  onNavigate(async () => {
    // Check daily usage for rating prompt
    await RateApp.checkDailyUsage();
  });
</script>

<form id="form" {onsubmit} in:fly={{ duration: 300, x: "-100%" }} class="space-y-4 grow relative pb-16">
  <EditTask bind:error bind:task bind:other_interval />
</form>

<button
  type="submit"
  form="form"
  class="absolute bottom-4 right-4 flex justify-center text-alt bg-primary items-center aspect-square rounded-full h-15 w-15 p-3"
  aria-label={t("create_new_item")}
  disabled={is_saving || !!navigating.to}
>
  {#if is_saving || navigating.to}
    <Loading class="text-2xl" />
  {:else}
    <Check class="text-2xl" />
  {/if}
</button>

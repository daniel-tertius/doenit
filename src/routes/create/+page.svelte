<script>
  import { goto } from "$app/navigation";
  import EditTask from "$lib/components/EditTask.svelte";
  import { t, language } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB.js";
  import { OnlineDB } from "$lib/OnlineDB.js";
  import user from "$lib/core/user.svelte.js";
  import { Notify } from "$lib/services/notifications/notifications.js";
  import { Alert } from "$lib/core/alert.js";
  import { onMount, setContext } from "svelte";
  import { backHandler } from "$lib/BackHandler.svelte.js";
  import { BACK_BUTTON_FUNCTION } from "$lib";
  import { Photos } from "$lib/services/photos.svelte.js";
  import { SvelteSet } from "svelte/reactivity";

  let { data } = $props();

  let error = $state({});
  let task = $state(data.task);
  let is_saving = $state(false);
  let other_interval = $state("");

  /** @type {SvelteSet<string>} */
  const deleted_photo_ids = new SvelteSet();
  setContext("deleted_photo_ids", deleted_photo_ids);

  onMount(() => {
    const token = (BACK_BUTTON_FUNCTION.value = backHandler.register(async () => {
      const has_changes = Object.keys(data.task).some((key) => {
        const original_value = data.task[key];
        const current_value = task[key];

        // Handle primitive values.
        if (typeof original_value !== "object" || original_value === null) {
          return original_value !== current_value;
        }

        // For objects/arrays, do a shallow comparison or use JSON for deep comparison.
        return JSON.stringify(original_value) !== JSON.stringify(current_value);
      });

      if (has_changes) {
        const discard = await Alert.confirm({
          title: "Skrap veranderinge?",
          message: "U het ongestoorde veranderinge.",
          cancelText: "Nee",
          confirmText: "Skrap",
        });

        if (!discard) return;
      }

      goto("/");
    }, -1));

    return () => backHandler.unregister(token);
  });

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

      // Delete removed photos
      const ids = [...deleted_photo_ids.values()];
      const promised = ids.map((p) => Photos.deletePhoto(p));
      await Promise.all(promised);

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
</script>

<EditTask bind:error bind:task bind:other_interval {onsubmit} />

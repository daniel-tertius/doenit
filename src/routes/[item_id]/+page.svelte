<script>
  import { goto } from "$app/navigation";
  import { Trash } from "$lib/icon";
  import Modal from "$lib/components/modal/Modal.svelte";
  import InputCheckbox from "$lib/components/element/input/InputCheckbox.svelte";
  import EditTask from "$lib/components/EditTask.svelte";
  import { t } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB.js";
  import { OnlineDB } from "$lib/OnlineDB.js";
  import user from "$lib/core/user.svelte.js";
  import { Notify } from "$lib/services/notifications/notifications.js";
  import { Alert } from "$lib/core/alert.js";
  import { getContext } from "svelte";

  const { data } = $props();

  /** @type {Value<Function?>}*/
  const onBack = getContext("onBackFunction");
  onBack.value = async () => {
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

    onBack.value = null;
    goto("/");
  };

  let task = $state(data.task);
  let is_deleting = $state(false);
  let is_saving = $state(false);
  let error = $state({});
  let other_interval = $state(data.task.repeat_interval_number > 1 ? data.task.repeat_interval : "");

  $effect(() => {
    if (!!task.due_date) return;

    task.repeat_interval = "";
    task.repeat_interval_number = 1;
    task.start_date = null;
  });

  $effect(() => {
    if (task.repeat_interval !== "weekly_custom_days") return;

    task.start_date = task.due_date;
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

      const result = await DB.Task.update(task.id, task);
      if (!result) {
        error = { message: t("error_updating_task") };
        return;
      }

      if (user.value && task.room_id) {
        const room = await DB.Room.get(task.room_id);
        if (room) {
          const email_address = user.value.email;
          await OnlineDB.Changelog.create({
            type: "update",
            data: JSON.stringify(task),
            room_id: task.room_id,
            total_reads_needed: room.users.length,
            user_reads_list: [email_address],
          });

          const is_task_shared = !data.task.room_id;
          if (is_task_shared) {
            const email_addresses = [];
            for (const { email, pending } of room.users) {
              if (email && email !== email_address && !pending) {
                email_addresses.push(email);
              }
            }

            await Notify.Push.send({
              title: t("task_shared"),
              body: t("task_was_shared", { task_name: task.name }),
              email_address: email_addresses,
            });
          }
        }
      }

      is_saving = false;
      await goto("/");
    } catch (error) {
      Alert.error(`${t("error_updating_task")}: ${error}`);
    }
  }

  async function deleteTask() {
    await DB.Task.delete(task.id);
    await goto("/");
  }

  /**
   * @param {Event} event
   */
  async function handleSelectTask(event) {
    try {
      event.stopPropagation();
      if (task.archived) {
        task.completed = 0;
        task.archived = false;
      } else {
        task.completed++;
      }

      await DB.Task.update(task.id, task);
      if (task.room_id) {
        if (!user.value) return;

        const room = await DB.Room.get(task.room_id);
        if (!room) return;

        const email_address = user.value.email;
        OnlineDB.Changelog.create({
          type: "complete",
          task_id: task.id,
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
          title: t("task_completed"),
          body: t("task_was_completed", { task_name: task.name }),
          email_address: email_addresses,
        });
      }
    } catch (error) {
      Alert.error(`${t("error_updating_task")}: ${error}`);
    }
  }
</script>

<button
  type="button"
  class="fixed top-5 right-5 flex justify-center items-center"
  onclick={() => {
    is_deleting = true;
  }}
  aria-label={t("close")}
>
  <Trash class="text-2xl text-error" />
</button>

<EditTask bind:error bind:task bind:other_interval {onsubmit} />

<div class="h-12 flex">
  <div class="font-bold text-left my-auto w-full">{t("complete")}</div>

  <InputCheckbox
    class="static! top-0! translate-0! left-0! bottom-0! right-0! p-2!"
    onselect={handleSelectTask}
    is_selected={!!task.archived}
    tick_animation={!!task.archived}
  />
</div>

<Modal bind:is_open={is_deleting} onclose={() => (is_deleting = false)} class="space-y-4">
  <h2 class="font-bold text-lg">{t("delete_task")}</h2>
  <p>{t("delete_task_confirmation")}</p>
  <button class="bg-error flex gap-1 items-center text-alt ml-auto px-4 py-2 rounded-md" onclick={deleteTask}>
    <Trash class="h-full" size={18} />
    <span>{t("delete")}</span>
  </button>
</Modal>

<script>
  import { goto } from "$app/navigation";
  import EditTask from "$lib/components/EditTask.svelte";
  import { t } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB.js";
  import { OnlineDB } from "$lib/OnlineDB.js";
  import user from "$lib/core/user.svelte.js";
  import { Notify } from "$lib/services/notifications/notifications.js";
  import { Alert } from "$lib/core/alert.js";
  import { setContext } from "svelte";
  import { Photos } from "$lib/services/photos.svelte.js";
  import { SvelteSet } from "svelte/reactivity";
  import SaveChanges from "$lib/components/SaveChanges.svelte";

  const { data } = $props();

  let error = $state({});
  let task = $state(data.task);
  let is_saving = $state(false);
  let other_interval = $state("");

  /** @type {SvelteSet<string>} */
  const deleted_photo_ids = new SvelteSet();
  setContext("deleted_photo_ids", deleted_photo_ids);

  /**
   * @param {Event} event
   */
  async function onsubmit(event) {
    event.preventDefault();
    await createTask(task);
  }

  /**
   * @param {Omit<Task, "id" | "created_at" | "updated_at">} task
   * @returns {Promise<Result<string>>}
   */
  async function createTask(task) {
    is_saving = true;

    try {
      if (task.repeat_interval_number > 1) {
        task.repeat_interval = other_interval;
      }

      const new_task = await DB.Task.create(task);

      if (task.room_id && !!user.value?.is_friends_enabled) {
        const room = await DB.Room.get(task.room_id);

        // TODO: Vertaal
        if (!room) throw new Error("Vriend nie gevind");

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

      // Delete removed photos
      const ids = [...deleted_photo_ids.values()];
      const promised = ids.map((p) => Photos.deletePhoto(p));
      await Promise.all(promised);

      await goto(`/?new_id=${new_task.id}`);

      is_saving = false;
      return { success: true, data: new_task.id };
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      Alert.error(error_message);
      is_saving = false;
      return { success: false, error_message };
    }
  }
</script>

<SaveChanges original={data.task} changed={task} onsave={createTask} />
<div class="mb-20">
  <EditTask bind:error bind:task bind:other_interval {onsubmit} />
</div>

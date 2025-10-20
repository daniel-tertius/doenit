import { Capacitor } from "@capacitor/core";
import { OnlineDB } from "$lib/OnlineDB";
import user from "$lib/core/user.svelte";
import { DB } from "$lib/DB";
import { Notify } from "./notifications/notifications";
import { t } from "$lib/services/language.svelte";
import { sortTasksByDueDate } from "$lib";

export interface TaskWidgetPlugin {
  updateWidget({
    tasks,
    categories,
  }: {
    tasks: Task[];
    categories: Category[];
  }): Promise<{ success: boolean; message: string }>;

  updateLanguage({ language }: { language: string }): Promise<{ success: boolean }>;
}

const TaskWidget = Capacitor.registerPlugin<TaskWidgetPlugin>("TaskWidget");

export class Widget {
  static async updateLanguage(language: string) {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Widget language update called on web platform - ignoring");
      return;
    }

    try {
      const result = await TaskWidget.updateLanguage({ language });
      console.log("[💬 Widget]: Language update result:", JSON.stringify(result));
    } catch (error) {
      console.error("[💬 Widget]: Language update error:", error);
      alert(t("failed_to_update_widget_language") + " " + JSON.stringify(error));
    }
  }

  /**
   * Update the widget display
   */
  static async updateWidget(tasks?: Task[]) {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Widget update called on web platform - ignoring");
      return;
    }

    try {
      if (!tasks) {
        tasks = sortTasksByDueDate(await DB.Task.getAll({ selector: { archived: false } }));
      }

      const categories = await DB.Category.getAll({
        selector: {
          id: { $in: tasks.map((task) => task.category_id).filter(Boolean) },
        },
      });

      const result = await TaskWidget.updateWidget({ tasks, categories });
      console.log("[💬 Widget]:", JSON.stringify(result));
    } catch (error) {
      console.error("[💬 Widget]:", error);
      alert(t("failed_to_update_widget") + " " + JSON.stringify(error));
    }
  }

  static async finishTasks(task_ids: string) {
    console.log("[💬 Doenit] Task IDs: " + task_ids);

    const tasks = await DB.Task.getAll({ selector: { id: { $in: task_ids.split(",") } } });
    console.log("[💬 Doenit] Tasks Found!");
    if (!tasks?.length) {
      return console.warn("[⚠️ Doenit] No Tasks found with IDs: " + task_ids);
    }

    for (const task of tasks) {
      if (!task.archived) continue;

      console.warn("[⚠️ Doenit] Task already archived: " + task.id);
    }

    const updates = tasks.map(async (task) => {
      await DB.Task.complete(task);
      if (!task.room_id) return;

      const room = await DB.Room.get(task.room_id);
      if (!room) throw new Error("Room not found");

      if (!user.value) return;

      const email_address = user.value.email;
      await OnlineDB.Changelog.create({
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
    });
    await Promise.all(updates);

    console.log("[💬 Doenit] Tasks updated successfully");
  }
}

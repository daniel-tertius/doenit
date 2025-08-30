import { DB } from "$lib/DB";
import { Capacitor } from "@capacitor/core";
import type { TaskWidgetPlugin } from "$lib/capacitor-plugins/task-widget";

const TaskWidget = Capacitor.registerPlugin<TaskWidgetPlugin>("TaskWidget");

export class Widget {
  /**
   * Update the widget display
   */
  static async updateWidget(tasks: Task[]) {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Widget update called on web platform - ignoring");
      return;
    }

    const categories = await DB.Category.getAll({
      selector: {
        id: { $in: tasks.map((task) => task.category_id).filter(Boolean) },
      },
    });

    try {
      const result = await TaskWidget.updateWidget({ tasks, categories });
      console.log("[💬 Widget]:", JSON.stringify(result));
    } catch (error) {
      console.error("[💬 Widget]:", error);
      alert("Failed to update widget:" + JSON.stringify(error));
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

    const updates = tasks.map((t) => DB.Task.complete(t));
    await Promise.all(updates);

    console.log("[💬 Doenit] Tasks updated successfully");
  }
}

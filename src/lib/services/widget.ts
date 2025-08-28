import { DB } from "$lib/DB";
import { Capacitor } from "@capacitor/core";

interface TaskWidgetPlugin {
  updateWidget({ tasks }: { tasks: Task[] }): Promise<{ success: boolean; message: string }>;
}

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
        id: { $in: tasks.map((task) => task.category_id) },
      },
    });

    const map = new Map(categories.map((category) => [category.id, category]));
    for (const task of tasks) {
      if (!task.category_id) return;

      const category = map.get(task.category_id);
      if (!category) continue;

      task.category = category;
    }

    try {
      console.debug("[Doenit]: Updating widget", JSON.stringify(tasks));
      await TaskWidget.updateWidget({ tasks });
    } catch (error) {
      alert("Failed to update widget:" + JSON.stringify(error));
    }
  }
}

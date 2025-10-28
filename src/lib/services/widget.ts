import { Capacitor } from "@capacitor/core";
import { OnlineDB } from "$lib/OnlineDB";
import user from "$lib/core/user.svelte";
import { DB } from "$lib/DB";
import { Notify } from "./notifications/notifications";
import { t } from "$lib/services/language.svelte";
import { sortTasksByDueDate } from "$lib";

export interface TaskWidgetPlugin {
  updateTasks({
    tasks,
    categories,
  }: {
    tasks: Task[];
    categories: Category[];
  }): Promise<{ success: boolean; message: string }>;

  updateLanguage({ language }: { language: string }): Promise<{ success: boolean }>;
  updateTheme({ theme }: { theme: string }): Promise<{ success: boolean }>;
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
      alert(t("failed_to_update_widget") + " " + JSON.stringify(error));
    }
  }

  static async updateTheme(theme: string) {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Widget theme update called on web platform - ignoring");
      return;
    }

    try {
      const result = await TaskWidget.updateTheme({ theme });
      console.log("[💬 Widget]: Theme update result:", JSON.stringify(result));
    } catch (error) {
      console.error("[💬 Widget]: Theme update error:", error);
      alert(t("failed_to_update_widget") + " " + JSON.stringify(error));
    }
  }

  /**
   * Update the widget display
   */
  static async updateTasks(tasks?: Task[]) {
    if (!Capacitor.isNativePlatform()) {
      console.warn("Widget update called on web platform - ignoring");
      return;
    }

    try {
      if (!tasks) {
        tasks = await DB.Task.getAll({ selector: { archived: false } });
      }

      tasks = sortTasksByDueDate(tasks).slice(0, 20);
      const category_ids = tasks.map((task) => task.category_id).filter(Boolean);
      const categories = await DB.Category.getAll({ selector: { id: { $in: category_ids } } });

      const result = await TaskWidget.updateTasks({ tasks, categories });
      console.log("[💬 Widget]:", JSON.stringify(result));
    } catch (error) {
      console.error("[💬 Widget]:", error);
      alert(t("failed_to_update_widget") + " " + JSON.stringify(error));
    }
  }
}

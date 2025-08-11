import type { TaskWidgetPlugin } from "$lib/capacitor-plugins/task-widget";
import type { Task } from "$lib/DB/DB";
import { Capacitor } from "@capacitor/core";

const TaskWidget = Capacitor.registerPlugin<TaskWidgetPlugin>("TaskWidget");

export class Widget {
  /**
   * Update the widget display
   */
  static async updateWidget(tasks: Task[]) {
    if (!Capacitor.isNativePlatform()) {
      alert("Widget update called on web platform - ignoring");
      return;
    }

    try {
      await TaskWidget.updateWidget({ tasks });
    } catch (error) {
      alert("Failed to update widget:" + JSON.stringify(error));
    }
  }
}

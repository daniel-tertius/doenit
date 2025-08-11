import type { Task } from "$lib/DB/DB";

export interface TaskWidgetPlugin {
  updateWidget({ tasks }: { tasks: Task[] }): Promise<{ success: boolean; message: string }>;
}

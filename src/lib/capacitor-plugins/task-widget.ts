export interface TaskWidgetPlugin {
  updateWidget({
    tasks,
    categories,
  }: {
    tasks: Task[];
    categories: Category[];
  }): Promise<{ success: boolean; message: string }>;
}

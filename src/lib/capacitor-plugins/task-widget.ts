export interface TaskWidgetPlugin {
  updateWidget(options: { tasks: any[] }): Promise<{ success: boolean; message: string }>;
}

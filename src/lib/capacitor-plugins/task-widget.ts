export interface TaskWidgetPlugin {
  updateWidget(): Promise<{ success: boolean; message: string }>;
}

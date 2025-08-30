package doenit.app;

public class Const {
    public static final String DB_NAME = "DoenitWidgetPrefs";
    public static final String TASK_ID = "completed_task_id";

    public static final String TASKS = "updatedTasksJson";
    public static final String CATEGORIES = "updatedCategoriesJson";

    // Widget data keys
    public static final String WIDGET_TASKS = "widget_tasks";
    public static final String WIDGET_CATEGORIES = "widget_categories";

    // Intent actions
    public static final String ACTION_ADD_TASK = "ADD_TASK";
    public static final String ACTION_COMPLETE_TASK = "COMPLETE_TASK";
    public static final String ACTION_OPEN_TASK = "OPEN_TASK";
    public static final String EXTRA_TASK_ID = "task_id";

    // Broadcast actions
    public static final String BROADCAST_TASK_COMPLETED = "doenit.app.TASK_COMPLETED";

    // Log tags
    public static final String LOG_TAG_DOENIT_DB = "[🌐 Doenit DB]";
    public static final String LOG_TAG_DOENIT = "[😨 Doenit]";
    public static final String LOG_TAG_DOENIT_UPDATE = "[😨 Doenit]";
    public static final String LOG_TAG_DOENIT_WIDGET = "[😨 Doenit]";
    public static final String LOG_TAG_DOENIT_UTILS = "[😨 Doenit]";
    public static final String LOG_TAG_TASK_WIDGET = "[😨 Doenit]";
    public static final String LOG_TAG_DOENIT_SIMPLE = "[😨 Doenit]";
}

package doenit.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.content.ComponentName;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.util.Log;
import android.net.Uri;

import doenit.app.R;

import java.util.Set;
import java.util.Locale;
import java.util.Date;
import java.util.Calendar;

import java.text.SimpleDateFormat;
import java.text.ParseException;

import org.json.JSONObject;
import org.json.JSONException;
import org.json.JSONArray;

public class TaskWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_ADD_TASK = Const.ACTION_ADD_TASK;
    public static final String ACTION_COMPLETE_TASK = Const.ACTION_COMPLETE_TASK;
    public static final String ACTION_OPEN_TASK = Const.ACTION_OPEN_TASK;
    public static final String EXTRA_TASK_ID = Const.EXTRA_TASK_ID;

    public static void updateTasksData(Context context, String tasksJson, String categoriesStr) {
        try {
            DB.saveData(Const.WIDGET_TASKS, tasksJson);
            DB.saveData(Const.WIDGET_CATEGORIES, categoriesStr);
    
            // Update all widgets
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName cn = new ComponentName(context, TaskWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(cn);
    
            Log.d(Const.LOG_TAG_DOENIT_UPDATE, "Found " + appWidgetIds.length + " widget instances");
    
            for (int i = 0; i < appWidgetIds.length; i++) {
                updateAppWidget(context, appWidgetManager, appWidgetIds[i]);
            }
    
            // Notify that the data has changed so ListView refreshes
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.widget_list_view);
            Log.d(Const.LOG_TAG_DOENIT_UPDATE, "Notified " + appWidgetIds.length + " widgets of data change");
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT, "Error updating widget tasks data", e);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        DB.init(context);
        for (int i = 0; i < appWidgetIds.length; i++) {
            updateAppWidget(context, appWidgetManager, appWidgetIds[i]);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        String action = intent.getAction();
        Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "onReceive called with action: " + action);
        Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Intent extras: " + intent.getExtras());

        if (ACTION_ADD_TASK.equals(action)) {
            try {
                Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Handling ADD_TASK action");
                // Open CreateTaskActivity for fastest startup
                Intent appIntent = new Intent(context, CreateTaskActivity.class);
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP
                        | Intent.FLAG_ACTIVITY_SINGLE_TOP);

                context.startActivity(appIntent);
            } catch (Exception e) {
                Log.e(Const.LOG_TAG_TASK_WIDGET, "Failed to start CreateTaskActivity", e);
            }
        } else if (ACTION_COMPLETE_TASK.equals(action)) {
            String taskId = intent.getStringExtra(EXTRA_TASK_ID);
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Handling COMPLETE_TASK action for taskId: " + taskId);

            if (taskId != null) {
                // Handle task completion
                completeTask(context, taskId);

                // Update all widgets
                AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                ComponentName cn = new ComponentName(context, TaskWidgetProvider.class);
                int[] appWidgetIds = appWidgetManager.getAppWidgetIds(cn);

                // Notify data changed first
                appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.widget_list_view);

                // Then update the widgets
                for (int appWidgetId : appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId);
                }

                Intent appIntent = new Intent(context, MainActivity.class);
                appIntent.putExtra("route", "/");
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                context.startActivity(appIntent);
            } else {
                Log.e(Const.LOG_TAG_TASK_WIDGET, "COMPLETE_TASK action received but no task ID found");
            }
        } else if (ACTION_OPEN_TASK.equals(action)) {
            try {
                String taskId = intent.getStringExtra(EXTRA_TASK_ID);
                Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Handling OPEN_TASK action for taskId: " + taskId);

                if (taskId != null) {
                    // Open the app to view/edit the task
                    Intent appIntent = new Intent(context, MainActivity.class);
                    appIntent.putExtra("route", "/" + taskId);
                    appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    context.startActivity(appIntent);
                    Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Started MainActivity to view task: " + taskId);
                }
            } catch (Exception e) {
                Log.e(Const.LOG_TAG_TASK_WIDGET, "Failed to start MainActivity", e);
            }
        } else {
            // Found unhandled action: android.appwidget.action.APPWIDGET_UPDATE
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Unhandled action: " + action);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "[updateAppWidget] " + appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.task_widget);
        setWidgetColors(context, views);

        // Set up the list view
        Intent serviceIntent = new Intent(context, TaskWidgetService.class);
        views.setRemoteAdapter(R.id.widget_list_view, serviceIntent);

        // Set up PendingIntent template for COMPLETE_TASK actions
        Intent completeTemplateIntent = new Intent(context, TaskWidgetProvider.class);
        PendingIntent completeTemplatePendingIntent = PendingIntent.getBroadcast(
                context,
                appWidgetId,
                completeTemplateIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
        views.setPendingIntentTemplate(R.id.widget_list_view, completeTemplatePendingIntent);

        // Set up empty view
        views.setEmptyView(R.id.widget_list_view, R.id.empty_view);

        String empty_text = TaskUtil.getListIsEmptyString();
        views.setTextViewText(R.id.empty_view, empty_text);

        // Set up add task button
        Intent addTaskIntent = new Intent(context, TaskWidgetProvider.class);
        addTaskIntent.setAction(ACTION_ADD_TASK);
        PendingIntent addTaskPendingIntent = PendingIntent.getBroadcast(
                context,
                appWidgetId + 1000,
                addTaskIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.add_button, addTaskPendingIntent);

        // Set up click action for app name/logo to open main app
        Intent appIntent = new Intent(context, MainActivity.class);
        appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainAppPendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId + 2000,
                appIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        views.setOnClickPendingIntent(R.id.app_name, mainAppPendingIntent);
        views.setOnClickPendingIntent(R.id.app_logo, mainAppPendingIntent);

        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);

        Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Updated widget " + appWidgetId + " with PendingIntent template");
    }

    static void setWidgetColors(Context context, RemoteViews views) {
        Resources resources = context.getResources();

        views.setInt(R.id.widget_body, "setBackgroundResource", Drawable.mainContainer());
        views.setInt(R.id.widget_header, "setBackgroundResource", Drawable.headerContainer());

        int app_name_text_res_id = Colors.get("text-strong");
        int app_name_text_color = resources.getColor(app_name_text_res_id);
        views.setTextColor(R.id.app_name, app_name_text_color);

        views.setInt(R.id.add_button, "setBackgroundResource", Drawable.addButton());
        views.setImageViewResource(R.id.add_button, Drawable.iconAdd());

        int empty_view_text_res_id = Colors.get("text-normal");
        int empty_view_text_color = resources.getColor(empty_view_text_res_id);
        views.setInt(R.id.empty_view, "setTextColor", empty_view_text_color);
    }

    /**
     * Update language for widgets. Saves new language to SharedPreferences and
     * triggers an update for all widget instances so they re-read the language.
     * Call this from the app when the user changes language.
     */
    public static void updateLanguage(Context context, String language) {
        try {
            DB.saveData("language", language);

            // Trigger immediate update for all widgets
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName cn = new ComponentName(context, TaskWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(cn);

            Log.d(Const.LOG_TAG_DOENIT_SIMPLE,
                    "updateLanguage: updating " + appWidgetIds.length + " widget(s) to language=" + language);

            // Update each widget (this will call updateAppWidget)
            for (int id : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, id);
            }

            // Notify ListView to refresh
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.widget_list_view);

            // Also send a standard broadcast update (helps some launchers)
            Intent intent = new Intent(context, TaskWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT, "Error updating widget language", e);
        }
    }

    public static void updateTheme(Context context, String theme) {
        try {
            DB.saveData("theme", theme);

            // Trigger immediate update for all widgets
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName cn = new ComponentName(context, TaskWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(cn);

            Log.d(Const.LOG_TAG_DOENIT_SIMPLE,
                    "updateTheme: updating " + appWidgetIds.length + " widget(s) to theme=" + theme);

            // Update each widget (this will call updateAppWidget)
            for (int id : appWidgetIds) {
                updateAppWidget(context, appWidgetManager, id);
            }

            // Notify ListView to refresh
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetIds, R.id.widget_list_view);

            // Also send a standard broadcast update (helps some launchers)
            Intent intent = new Intent(context, TaskWidgetProvider.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
            context.sendBroadcast(intent);
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT, "Error updating widget theme", e);
        }
    }

    public static void completeTask(Context context, String taskId) {
        try {
            // Send broadcast to notify main app of task completion
            Intent broadcastIntent = new Intent(Const.BROADCAST_TASK_COMPLETED);
            broadcastIntent.putExtra("taskId", taskId);
            context.sendBroadcast(broadcastIntent);
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Broadcast sent for task completion: " + taskId);

            // Also store in SharedPreferences as backup
            String taskIds = DB.getString(Const.TASK_ID);
            if (taskIds == null) {
                taskIds = taskId;
            } else {
                taskIds += "," + taskId;
            }
            DB.saveData(Const.TASK_ID, taskIds);
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT, "Error completing task", e);
        }
    }

    private static String calculateNextDueDate(JSONObject task) throws JSONException {
        String repeatInterval = task.optString("repeat_interval", "");
        String currentDueDate = task.optString("due_date", "");
        int repeatIntervalNumber = task.optInt("repeat_interval_number", 1);

        if (repeatInterval.isEmpty() || currentDueDate.isEmpty()) {
            return null;
        }

        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date currentDate = dateFormat.parse(currentDueDate);

            Calendar calendar = Calendar.getInstance();
            calendar.setTime(currentDate);

            switch (repeatInterval) {
                case "daily":
                    calendar.add(Calendar.DAY_OF_MONTH, 1 * repeatIntervalNumber);
                    break;
                case "workdaily":
                    int daysToAdd = 1;
                    int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
                    if (dayOfWeek == Calendar.FRIDAY) {
                        daysToAdd = 3; // Skip weekend
                    } else if (dayOfWeek == Calendar.SATURDAY) {
                        daysToAdd = 2; // Skip Sunday
                    }
                    calendar.add(Calendar.DAY_OF_MONTH, daysToAdd);
                    break;
                case "weekly":
                    calendar.add(Calendar.WEEK_OF_YEAR, 1 * repeatIntervalNumber);
                    break;
                case "monthly":
                    calendar.add(Calendar.MONTH, 1 * repeatIntervalNumber);
                    break;
                case "yearly":
                    calendar.add(Calendar.YEAR, 1 * repeatIntervalNumber);
                    break;
                default:
                    Log.w(Const.LOG_TAG_DOENIT_SIMPLE, "Unknown repeat interval: " + repeatInterval);
                    return null;
            }

            return dateFormat.format(calendar.getTime());
        } catch (ParseException e) {
            Log.e(Const.LOG_TAG_DOENIT_SIMPLE, "Error parsing due date: " + currentDueDate, e);
            return null;
        }
    }

    private static String calculateNextStartDate(JSONObject task) throws JSONException {
        String repeatInterval = task.optString("repeat_interval", "");
        String currentStartDate = task.optString("start_date", "");
        int repeatIntervalNumber = task.optInt("repeat_interval_number", 1);

        if (repeatInterval.isEmpty() || currentStartDate.isEmpty()) {
            return null;
        }

        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date currentDate = dateFormat.parse(currentStartDate);

            Calendar calendar = Calendar.getInstance();
            calendar.setTime(currentDate);

            switch (repeatInterval) {
                case "daily":
                    calendar.add(Calendar.DAY_OF_MONTH, 1 * repeatIntervalNumber);
                    break;
                case "workdaily":
                    int daysToAdd = 1;
                    int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
                    if (dayOfWeek == Calendar.FRIDAY) {
                        daysToAdd = 3; // Skip weekend
                    } else if (dayOfWeek == Calendar.SATURDAY) {
                        daysToAdd = 2; // Skip Sunday
                    }
                    calendar.add(Calendar.DAY_OF_MONTH, daysToAdd);
                    break;
                case "weekly":
                    calendar.add(Calendar.WEEK_OF_YEAR, 1 * repeatIntervalNumber);
                    break;
                case "monthly":
                    calendar.add(Calendar.MONTH, 1 * repeatIntervalNumber);
                    break;
                case "yearly":
                    calendar.add(Calendar.YEAR, 1 * repeatIntervalNumber);
                    break;
                default:
                    Log.w(Const.LOG_TAG_DOENIT_SIMPLE, "Unknown repeat interval: " + repeatInterval);
                    return null;
            }

            return dateFormat.format(calendar.getTime());
        } catch (ParseException e) {
            Log.e(Const.LOG_TAG_DOENIT_SIMPLE, "Error parsing start date: " + currentStartDate, e);
            return null;
        }
    }
}
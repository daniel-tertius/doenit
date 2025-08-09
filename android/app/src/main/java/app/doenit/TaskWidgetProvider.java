package doenit.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.content.ComponentName;
import android.content.SharedPreferences;
import android.util.Log;
import android.net.Uri;
import doenit.app.R;
import java.util.Set;

import org.json.JSONObject;
import org.json.JSONException;

public class TaskWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "DoenitWidgetPrefs";
    public static final String ACTION_ADD_TASK = "doenit.app.ADD_TASK";
    public static final String ACTION_COMPLETE_TASK = "doenit.app.COMPLETE_TASK";
    public static final String ACTION_OPEN_TASK = "doenit.app.OPEN_TASK";
    public static final String EXTRA_TASK_ID = "task_id";

    public static void updateTasksData(Context context, String tasksJson) {
        // Update all widgets
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName cn = new ComponentName(context, TaskWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(cn);
        for (int i = 0; i < appWidgetIds.length; i++) {
            updateAppWidget(context, appWidgetManager, appWidgetIds[i]);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int i = 0; i < appWidgetIds.length; i++) {
            updateAppWidget(context, appWidgetManager, appWidgetIds[i]);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        String action = intent.getAction();
        android.util.Log.d("TaskWidget", "onReceive called with action: " + action);
        android.util.Log.d("TaskWidget", "Intent extras: " + intent.getExtras());
        
        if (ACTION_ADD_TASK.equals(action)) {
            android.util.Log.d("TaskWidget", "Handling ADD_TASK action");
            // Open the app to create a new task
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.putExtra("route", "/create");
            appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            try {
                context.startActivity(appIntent);
                android.util.Log.d("TaskWidget", "Started MainActivity with /create route");
            } catch (Exception e) {
                android.util.Log.e("TaskWidget", "Failed to start MainActivity", e);
            }
        } else if (ACTION_COMPLETE_TASK.equals(action)) {
            String taskId = intent.getStringExtra(EXTRA_TASK_ID);
            android.util.Log.d("TaskWidget", "Handling COMPLETE_TASK action for taskId: " + taskId);
            
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
            } else {
                android.util.Log.e("TaskWidget", "COMPLETE_TASK action received but no task ID found");
            }
        } else if (ACTION_OPEN_TASK.equals(action)) {
            String taskId = intent.getStringExtra(EXTRA_TASK_ID);
            android.util.Log.d("TaskWidget", "Handling OPEN_TASK action for taskId: " + taskId);
            
            if (taskId != null) {
                // Open the app to view/edit the task
                Intent appIntent = new Intent(context, MainActivity.class);
                appIntent.putExtra("route", "/");
                appIntent.putExtra("task_id", taskId);
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                try {
                    context.startActivity(appIntent);
                    android.util.Log.d("TaskWidget", "Started MainActivity to view task: " + taskId);
                } catch (Exception e) {
                    android.util.Log.e("TaskWidget", "Failed to start MainActivity", e);
                }
            }
        } else {
            android.util.Log.d("TaskWidget", "Unhandled action: " + action);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.task_widget);

        // Set up the list view
        Intent serviceIntent = new Intent(context, TaskWidgetService.class);
        serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
        
        views.setRemoteAdapter(R.id.widget_list_view, serviceIntent);
        views.setEmptyView(R.id.widget_list_view, R.id.empty_view);

        // Set up the "Add Task" button
        Intent addTaskIntent = new Intent(context, TaskWidgetProvider.class);
        addTaskIntent.setAction(ACTION_ADD_TASK);
        PendingIntent addTaskPendingIntent = PendingIntent.getBroadcast(
            context, 0, addTaskIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.add_task_button, addTaskPendingIntent);

        // Set up click action for app name/logo to open main app
        Intent appIntent = new Intent(context, MainActivity.class);
        appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainAppPendingIntent = PendingIntent.getActivity(
            context, 1, appIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        
        views.setOnClickPendingIntent(R.id.app_name_text, mainAppPendingIntent);
        views.setOnClickPendingIntent(R.id.app_logo, mainAppPendingIntent);

        // Set up list item click template
        Intent itemClickIntent = new Intent(context, TaskWidgetProvider.class);
        PendingIntent itemClickPendingIntent = PendingIntent.getBroadcast(
            context, 0, itemClickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setPendingIntentTemplate(R.id.widget_list_view, itemClickPendingIntent);

        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list_view);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void completeTask(Context context, String taskId) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String itemsJson = prefs.getString("Item", "{}");
        
        try {
            JSONObject items = new JSONObject(itemsJson);
            if (!items.has(taskId)) return;

            JSONObject task = items.getJSONObject(taskId);
            
            // Check if it's a repeating task
            String repeatInterval = task.optString("repeat_interval", "");
            String dueDate = task.optString("due_date", "");
            boolean isRepeatTask = !repeatInterval.isEmpty() && !dueDate.isEmpty();
            
            if (isRepeatTask) {
                // For repeating tasks, increment completed count and update due date
                int completed = task.optInt("completed", 0) + 1;
                task.put("completed", completed);
                // Note: Due date calculation would need to be implemented here
                // to match the logic in your Data.svelte.js #getNextDueDate method
            } else {
                // For non-repeating tasks, mark as completed and archived
                task.put("completed", 1);
                task.put("archived", true);
                task.put("completed_at", new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", new java.util.Locale("af", "ZA")).format(new java.util.Date()));
            }
            
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("Item", items.toString());
            editor.apply();

            // Refresh the widget data
            updateTasksData(context, items.toString());
            android.util.Log.d("TaskWidget", "Task completed: " + taskId + ", isRepeatTask: " + isRepeatTask);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}

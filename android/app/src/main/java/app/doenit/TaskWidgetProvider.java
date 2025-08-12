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
import java.util.Locale;
import java.util.Date;

import java.text.SimpleDateFormat;

import org.json.JSONObject;
import org.json.JSONException;

public class TaskWidgetProvider extends AppWidgetProvider {
    private static final String PREFS_NAME = "DoenitWidgetPrefs";
    public static final String ACTION_ADD_TASK = "ADD_TASK";
    public static final String ACTION_COMPLETE_TASK = "COMPLETE_TASK";
    public static final String ACTION_OPEN_TASK = "OPEN_TASK";
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
        Log.d("Doenit", "onReceive called with action: " + action);
        Log.d("Doenit", "Intent extras: " + intent.getExtras());
        
        if (ACTION_ADD_TASK.equals(action)) {
            Log.d("Doenit", "Handling ADD_TASK action");
            // Open the app to create a new task
            Intent appIntent = new Intent(context, MainActivity.class);
            appIntent.putExtra("route", "/create");
            appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            try {
                context.startActivity(appIntent);
                Log.d("Doenit", "Started MainActivity with /create route");
            } catch (Exception e) {
                Log.e("TaskWidget", "Failed to start MainActivity", e);
            }
        } else if (ACTION_COMPLETE_TASK.equals(action)) {
            String taskId = intent.getStringExtra(EXTRA_TASK_ID);
            Log.d("Doenit", "Handling COMPLETE_TASK action for taskId: " + taskId);
            
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
                Log.e("TaskWidget", "COMPLETE_TASK action received but no task ID found");
            }
        } else if (ACTION_OPEN_TASK.equals(action)) {
            String taskId = intent.getStringExtra(EXTRA_TASK_ID);
            Log.d("Doenit", "Handling OPEN_TASK action for taskId: " + taskId);
            
            if (taskId != null) {
                // Open the app to view/edit the task
                Intent appIntent = new Intent(context, MainActivity.class);
                appIntent.putExtra("route", "/" + taskId);
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                try {
                    context.startActivity(appIntent);
                    Log.d("Doenit", "Started MainActivity to view task: " + taskId);
                } catch (Exception e) {
                    Log.e("TaskWidget", "Failed to start MainActivity", e);
                }
            }
        } else {
            Log.d("Doenit", "Unhandled action: " + action);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Log.d("Doenit", "[updateAppWidget] " + appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.task_widget);

        // Set up the list view
        Intent serviceIntent = new Intent(context, TaskWidgetService.class);
        views.setRemoteAdapter(R.id.widget_list_view, serviceIntent);

        // Set up PendingIntent template for COMPLETE_TASK actions
        Intent completeTemplateIntent = new Intent(context, TaskWidgetProvider.class);
        PendingIntent completeTemplatePendingIntent = PendingIntent.getBroadcast(
            context, 
            appWidgetId, 
            completeTemplateIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
        );
        views.setPendingIntentTemplate(R.id.widget_list_view, completeTemplatePendingIntent);

        // Set up empty view
        views.setEmptyView(R.id.widget_list_view, R.id.empty_view);

        // Set up add task button
        Intent addTaskIntent = new Intent(context, TaskWidgetProvider.class);
        addTaskIntent.setAction(ACTION_ADD_TASK);
        PendingIntent addTaskPendingIntent = PendingIntent.getBroadcast(
            context, 
            appWidgetId + 1000,
            addTaskIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.add_task_button, addTaskPendingIntent);

        // Set up click action for app name/logo to open main app
        Intent appIntent = new Intent(context, MainActivity.class);
        appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent mainAppPendingIntent = PendingIntent.getActivity(
            context, 
            appWidgetId + 2000, 
            appIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        views.setOnClickPendingIntent(R.id.app_name_text, mainAppPendingIntent);
        views.setOnClickPendingIntent(R.id.app_logo, mainAppPendingIntent);

        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
        
        // Notify that the data has changed so ListView refreshes
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list_view);
        
        Log.d("Doenit", "Updated widget " + appWidgetId + " with PendingIntent template");
    }

    public static void completeTask(Context context, String taskId) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String tasksJson = prefs.getString("Item", "{}");
        
        try {
            JSONObject tasks = new JSONObject(tasksJson);
            if (!tasks.has(taskId)) return;

            JSONObject task = tasks.getJSONObject(taskId);
            
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
                task.put("completed_at", new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", new Locale("af", "ZA")).format(new Date()));
            }
            
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("Item", tasks.toString());
            editor.apply();

            // Refresh the widget data
            updateTasksData(context, tasks.toString());
            Log.d("Doenit", "Task completed: " + taskId + ", isRepeatTask: " + isRepeatTask);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }
}

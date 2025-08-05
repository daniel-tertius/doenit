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

public class TaskWidgetProvider extends AppWidgetProvider {
    
    private static final String PREFS_NAME = "DoenitWidgetPrefs";
    private static final String ACTION_ADD_TASK = "ADD_TASK";
    private static final String ACTION_COMPLETE_TASK = "COMPLETE_TASK";
    private static final String EXTRA_TASK_ID = "task_id";

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
            // Handle task completion
            TaskWidgetService.completeTask(context, taskId);
            
            // Update all widgets
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName cn = new ComponentName(context, TaskWidgetProvider.class);
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(cn);
            onUpdate(context, appWidgetManager, appWidgetIds);
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
        itemClickIntent.setAction(ACTION_COMPLETE_TASK);
        PendingIntent itemClickPendingIntent = PendingIntent.getBroadcast(
            context, 0, itemClickIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setPendingIntentTemplate(R.id.widget_list_view, itemClickPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list_view);
    }
}

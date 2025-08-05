package doenit.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;
import doenit.app.R;

public class TaskWidgetService extends RemoteViewsService {

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new TaskRemoteViewsFactory(this.getApplicationContext(), intent);
    }

    public static void completeTask(Context context, String taskId) {
        // This would integrate with your Capacitor storage
        // For now, we'll just mark it as completed in SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String itemsJson = prefs.getString("Item", "{}");
        
        try {
            JSONObject items = new JSONObject(itemsJson);
            if (items.has(taskId)) {
                JSONObject task = items.getJSONObject(taskId);
                task.put("completed", task.optInt("completed", 0) + 1);
                task.put("archived", true);
                task.put("completed_at", new java.util.Date().toString());
                
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString("Item", items.toString());
                editor.apply();
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    class TaskRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
        private Context context;
        private List<TaskItem> tasks;

        TaskRemoteViewsFactory(Context context, Intent intent) {
            this.context = context;
            this.tasks = new ArrayList<>();
        }

        @Override
        public void onCreate() {
            loadTasks();
        }

        @Override
        public void onDataSetChanged() {
            loadTasks();
        }

        @Override
        public void onDestroy() {
            tasks.clear();
        }

        @Override
        public int getCount() {
            return Math.min(tasks.size(), 10); // Limit to 10 tasks for widget
        }

        @Override
        public RemoteViews getViewAt(int position) {
            if (position >= tasks.size()) {
                return null;
            }

            TaskItem task = tasks.get(position);
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.task_widget_item);
            
            views.setTextViewText(R.id.task_name, task.name);
            views.setTextViewText(R.id.task_due_date, task.dueDate);
            
            // Set priority indicators
            if (task.important) {
                views.setImageViewResource(R.id.important_icon, R.drawable.ic_important);
                views.setViewVisibility(R.id.important_icon, android.view.View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.important_icon, android.view.View.GONE);
            }
            
            if (task.urgent) {
                views.setImageViewResource(R.id.urgent_icon, R.drawable.ic_urgent);
                views.setViewVisibility(R.id.urgent_icon, android.view.View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.urgent_icon, android.view.View.GONE);
            }

            // Set up click action for task item (to open task details)
            Intent fillInIntent = new Intent();
            fillInIntent.putExtra("task_id", task.id);
            views.setOnClickFillInIntent(R.id.task_item_layout, fillInIntent);

            // Set up click action for complete button
            Intent completeIntent = new Intent();
            completeIntent.setAction("COMPLETE_TASK");
            completeIntent.putExtra("task_id", task.id);
            views.setOnClickFillInIntent(R.id.complete_button, completeIntent);

            return views;
        }

        @Override
        public RemoteViews getLoadingView() {
            return null;
        }

        @Override
        public int getViewTypeCount() {
            return 1;
        }

        @Override
        public long getItemId(int position) {
            return position;
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }

        private void loadTasks() {
            tasks.clear();
            
            // // Read from Capacitor storage (SharedPreferences)
            // SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            // String itemsJson = prefs.getString("Item", "{}");
            
            // try {
            //     JSONObject items = new JSONObject(itemsJson);
            //     JSONArray names = items.names();
                
            //     if (names != null) {
            //         for (int i = 0; i < names.length(); i++) {
            //             String key = names.getString(i);
            //             JSONObject taskJson = items.getJSONObject(key);
                        
            //             // Only include non-archived, non-completed tasks
            //             if (!taskJson.optBoolean("archived", false) && 
            //                 taskJson.optInt("completed", 0) == 0) {
                            
            //                 TaskItem task = new TaskItem();
            //                 task.id = key;
            //                 task.name = taskJson.optString("name", "");
            //                 task.dueDate = formatDueDate(taskJson.optString("due_date", ""));
            //                 task.important = taskJson.optBoolean("important", false);
            //                 task.urgent = taskJson.optBoolean("urgent", false);
                            
            //                 tasks.add(task);
            //             }
            //         }
            //     }
                
            //     // Sort tasks by due date and priority
            //     tasks.sort((a, b) -> {
            //         // Important and urgent tasks first
            //         if (a.important && a.urgent && !(b.important && b.urgent)) return -1;
            //         if (b.important && b.urgent && !(a.important && a.urgent)) return 1;
                    
            //         // Then important tasks
            //         if (a.important && !b.important) return -1;
            //         if (b.important && !a.important) return 1;
                    
            //         // Then urgent tasks
            //         if (a.urgent && !b.urgent) return -1;
            //         if (b.urgent && !a.urgent) return 1;
                    
            //         // Finally by due date
            //         return a.dueDate.compareTo(b.dueDate);
            //     });
                
            // } catch (JSONException e) {
            //     e.printStackTrace();
            // }
        }
        
        private String formatDueDate(String dueDateStr) {
            if (dueDateStr.isEmpty()) return "";
            
            try {
                // Simple date formatting - you may want to improve this
                String[] parts = dueDateStr.split(" ");
                if (parts.length > 0) {
                    return parts[0]; // Just return the date part
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            
            return dueDateStr;
        }
    }

    static class TaskItem {
        String id;
        String name;
        String dueDate;
        boolean important;
        boolean urgent;
    }
}

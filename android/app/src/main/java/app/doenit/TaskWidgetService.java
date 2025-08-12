package doenit.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import android.util.Log;

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
            if (position >= tasks.size()) return null;

            TaskItem task = tasks.get(position);
            Log.d("Doenit", "Creating view for task: " + task.name + " (ID: " + task.id + ")");
            
            RemoteViews views = new RemoteViews(this.context.getPackageName(), R.layout.task_widget_item);
            
            views.setTextViewText(R.id.task_name, task.name);
            views.setTextViewText(R.id.task_due_date, task.dueDate);
            if (task.dueDate != null && !task.dueDate.isEmpty()) {
                views.setViewVisibility(R.id.task_due_date, android.view.View.VISIBLE);
                // Check if due date is past and set color accordingly
                if (isDatePast(task.dueDate)) {
                    views.setTextColor(R.id.task_due_date, android.graphics.Color.parseColor("#a34747"));
                }
            } else {
                views.setViewVisibility(R.id.task_due_date, android.view.View.GONE);
            }

            views.setTextViewText(R.id.task_category, task.category);
            if (task.category != null && !task.category.isEmpty()) {
                views.setViewVisibility(R.id.task_category, android.view.View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.task_category, android.view.View.GONE);
            }
            
            // Set priority indicators
            if (task.important) {
                views.setImageViewResource(R.id.important_icon, R.drawable.ic_important);
                views.setViewVisibility(R.id.important_icon, android.view.View.VISIBLE);
            }
            
            if (task.urgent) {
                views.setImageViewResource(R.id.urgent_icon, R.drawable.ic_urgent);
                views.setViewVisibility(R.id.urgent_icon, android.view.View.VISIBLE);
            }

            // Set up fill-in intent for COMPLETE_TASK (complete_button)
            Intent completeIntent = new Intent();
            completeIntent.setAction(TaskWidgetProvider.ACTION_COMPLETE_TASK);
            completeIntent.putExtra(TaskWidgetProvider.EXTRA_TASK_ID, task.id);
            views.setOnClickFillInIntent(R.id.complete_button, completeIntent);

            // Set up fill-in intent for OPEN_TASK (task_item_layout)
            Intent openIntent = new Intent();
            openIntent.setAction(TaskWidgetProvider.ACTION_OPEN_TASK);
            openIntent.putExtra(TaskWidgetProvider.EXTRA_TASK_ID, task.id);
            views.setOnClickFillInIntent(R.id.task_item_layout, openIntent);

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
            Log.d("Doenit", "Loading tasks from SharedPreferences");
            
            // Read from Capacitor storage (SharedPreferences)
            SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            String tasksJson = prefs.getString("Item", "{}");
            String categoriesJson = prefs.getString("Category", "{}");
            
            Log.d("Doenit", "Tasks JSON length: " + tasksJson.length());
            Log.d("Doenit", "Tasks JSON preview: " + (tasksJson.length() > 100 ? tasksJson.substring(0, 100) + "..." : tasksJson));
            
            // Parse categories for name lookup
            try {
                JSONObject categories = new JSONObject(categoriesJson);
                JSONObject items = new JSONObject(tasksJson);
                JSONArray names = items.names();
                
                Log.d("Doenit", "Found " + (names != null ? names.length() : 0) + " total tasks");
                
                if (names == null) return;

                for (int i = 0; i < names.length(); i++) {
                    String key = names.getString(i);
                    JSONObject taskJson = items.getJSONObject(key);

                    // Only include non-archived, non-completed tasks
                    boolean isArchived = taskJson.optBoolean("archived", false);
                    boolean isCompleted = taskJson.optInt("completed", 0) > 0;
                    if (isArchived || isCompleted) continue;

                    TaskItem task = new TaskItem();
                    task.id = key;
                    task.name = taskJson.optString("name", "");
                    task.dueDate = formatDateToAfrikaans(taskJson.optString("due_date", ""));
                    
                    // Get category name from category ID
                    String categoryId = taskJson.optString("category_id", "");
                    task.category = getCategoryName(categoryId, categories);
                    task.important = taskJson.optBoolean("important", false);
                    task.urgent = taskJson.optBoolean("urgent", false);
                    
                    tasks.add(task);    
                }

                // Replace the three separate sort calls with this single comprehensive sort
                tasks.sort((a, b) -> {
                    // Primary: Due date (tasks with due dates come first, then by date)
                    int dateComparison = compareDueDates(a.dueDate, b.dueDate);
                    if (dateComparison != 0) {
                        return dateComparison;
                    }

                    // Secondary: Priority based on importance and urgency (Eisenhower Matrix)
                    int aPriority = getPriorityLevel(a.important, a.urgent);
                    int bPriority = getPriorityLevel(b.important, b.urgent);
                    
                    if (aPriority != bPriority) {
                        return Integer.compare(aPriority, bPriority); // Lower number = higher priority
                    }
                    
                    // Tertiary: Alphabetical by name
                    return a.name.compareToIgnoreCase(b.name);
                });
                
                Log.d("Doenit - TaskWidget", "Loaded " + tasks.size() + " active tasks for widget");
            } catch (JSONException e) {
                Log.e("Doenit - TaskWidget", "Error parsing JSON", e);
                e.printStackTrace();
            }
        }

        private String getCategoryName(String categoryId, JSONObject categories) {
            // Get category name from category ID
            if (!categoryId.isEmpty() && categories.has(categoryId)) {
                try {
                    JSONObject category = categories.getJSONObject(categoryId);
                    return category.optString("name", "");
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            return "";
        }

        private String formatDateToAfrikaans(String dateString) {
            if (dateString == null || dateString.isEmpty() || dateString.equals("null")) {
                return "";
            }
            
            try {
                java.text.SimpleDateFormat inputFormat = new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.ENGLISH);
                java.util.Date date = inputFormat.parse(dateString);
                
                java.text.SimpleDateFormat outputFormat = new java.text.SimpleDateFormat("d MMM yyyy", new java.util.Locale("af", "ZA"));
                return outputFormat.format(date);
            } catch (java.text.ParseException e) {
                return dateString; // Return original string if parsing fails
            }
        }

        private boolean isDatePast(String formattedDate) {
            if (formattedDate == null || formattedDate.isEmpty()) {
                return false;
            }
            
            try {
                // Parse the formatted Afrikaans date back to compare with today
                java.text.SimpleDateFormat outputFormat = new java.text.SimpleDateFormat("d MMM yyyy", new java.util.Locale("af", "ZA"));
                java.util.Date dueDate = outputFormat.parse(formattedDate);
                
                // Get today's date at midnight for comparison
                java.util.Calendar today = java.util.Calendar.getInstance();
                today.set(java.util.Calendar.HOUR_OF_DAY, 0);
                today.set(java.util.Calendar.MINUTE, 0);
                today.set(java.util.Calendar.SECOND, 0);
                today.set(java.util.Calendar.MILLISECOND, 0);
                
                return dueDate.before(today.getTime());
            } catch (java.text.ParseException e) {
                return false; // If we can't parse the date, assume it's not past
            }
        }

        private int getPriorityLevel(boolean important, boolean urgent) {
            // Eisenhower Matrix priority levels
            if (important && urgent) return 1;     // Do First (Crisis)
            if (important && !urgent) return 2;   // Schedule (Important, not urgent)
            if (!important && urgent) return 3;   // Delegate (Urgent, not important)
            return 4;                              // Don't Do (Neither important nor urgent)
        }

        private int compareDueDates(String dateA, String dateB) {
            boolean aHasDate = dateA != null && !dateA.isEmpty();
            boolean bHasDate = dateB != null && !dateB.isEmpty();
            
            // Tasks with due dates come before tasks without due dates
            if (aHasDate && !bHasDate) return -1;
            if (!aHasDate && bHasDate) return 1;
            if (!aHasDate && !bHasDate) return 0;
            
            // Both have due dates - compare them
            try {
                java.text.SimpleDateFormat outputFormat = new java.text.SimpleDateFormat("d MMM yyyy", new java.util.Locale("af", "ZA"));
                java.util.Date parsedDateA = outputFormat.parse(dateA);
                java.util.Date parsedDateB = outputFormat.parse(dateB);
                return parsedDateA.compareTo(parsedDateB);
            } catch (java.text.ParseException e) {
                return dateA.compareTo(dateB); // Fallback to string comparison
            }
        }
    }

    static class TaskItem {
        String id;
        String name;
        String dueDate;
        String category;
        boolean important;
        boolean urgent;
    }
}

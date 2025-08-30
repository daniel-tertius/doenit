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

import java.text.SimpleDateFormat;
import java.text.ParseException;

import java.util.Locale;
import java.util.Date;
import java.util.Calendar;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import doenit.app.R;

public class TaskWidgetService extends RemoteViewsService {

    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "TaskWidgetService.onGetViewFactory called");
        return new TaskRemoteViewsFactory(this.getApplicationContext(), intent);
    }

    class TaskRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
        private Context context;
        private List<Task> tasks;

        TaskRemoteViewsFactory(Context context, Intent intent) {
            this.context = context;
            this.tasks = new ArrayList<>();
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "TaskRemoteViewsFactory created");
        }

        @Override
        public void onCreate() {
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "TaskRemoteViewsFactory.onCreate called");
            DB.init(context);
            loadTasks();
        }

        @Override
        public void onDataSetChanged() {
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "onDataSetChanged called - refreshing widget data");
            loadTasks();
        }

        @Override
        public void onDestroy() {
            tasks.clear();
        }

        @Override
        public int getCount() {
            return Math.min(tasks.size(), 20); // Limit to 20 tasks for widget
        }

        @Override
        public RemoteViews getViewAt(int position) {
            if (position >= tasks.size()) {
                return null;
            }

            Task task = tasks.get(position);
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Creating view for task: " + task.name + " (ID: " + task.id + ")");

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
            Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Loading tasks from widget data");

            String tasksJson = DB.getString(Const.WIDGET_TASKS);
            String categoriesJson = DB.getString(Const.WIDGET_CATEGORIES);

            // Parse categories for name lookup
            try {
                JSONObject categories = new JSONObject(categoriesJson);
                JSONArray tasksArray = new JSONArray(tasksJson);

                for (int i = 0; i < tasksArray.length(); i++) {
                    JSONObject taskJson = tasksArray.getJSONObject(i);

                    // Only include non-archived tasks
                    boolean isArchived = taskJson.optBoolean("archived", false);

                    if (isArchived) {
                        Log.d(Const.LOG_TAG_DOENIT_SIMPLE, "Skipping task " + i + " (archived).");
                        continue;
                    }

                    Task task = new Task();
                    task.id = taskJson.optString("id", "");
                    task.name = taskJson.optString("name", "");
                    task.dueDate = formatDateToAfrikaans(taskJson.optString("due_date", ""));

                    // Get category name from category ID
                    String categoryId = taskJson.optString("category_id", "");
                    task.category = getCategoryName(categoryId, categories);
                    task.important = taskJson.optBoolean("important", false);

                    tasks.add(task);
                }

                // Replace the three separate sort calls with this single comprehensive sort
                Collections.sort(tasks, new Comparator<Task>() {
                    @Override
                    public int compare(Task a, Task b) {
                        // Primary: Due date (tasks with due dates come first, then by date)
                        int dateComparison = compareDueDates(a.dueDate, b.dueDate);
                        if (dateComparison != 0) {
                            return dateComparison;
                        }

                        // Secondary: Important tasks first
                        if (a.important && !b.important) {
                            return -1;
                        } else if (!a.important && b.important) {
                            return 1;
                        }

                        // Tertiary: Alphabetical by name
                        return a.name.compareToIgnoreCase(b.name);
                    }
                });
                Log.d(Const.LOG_TAG_DOENIT_WIDGET, "Found " + tasksArray.length() + " total tasks, loaded " + tasks.size() + " active tasks for widget");
            } catch (JSONException e) {
                Log.e(Const.LOG_TAG_DOENIT_WIDGET, "Error parsing JSON", e);
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
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
                Date date = inputFormat.parse(dateString);

                SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM yyyy", new Locale("af", "ZA"));
                return outputFormat.format(date);
            } catch (ParseException e) {
                return dateString; // Return original string if parsing fails
            }
        }

        private boolean isDatePast(String formattedDate) {
            if (formattedDate == null || formattedDate.isEmpty()) {
                return false;
            }

            try {
                // Parse the formatted Afrikaans date back to compare with today
                SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM yyyy", new Locale("af", "ZA"));
                Date dueDate = outputFormat.parse(formattedDate);

                // Get today's date at midnight for comparison
                Calendar today = Calendar.getInstance();
                today.set(Calendar.HOUR_OF_DAY, 0);
                today.set(Calendar.MINUTE, 0);
                today.set(Calendar.SECOND, 0);
                today.set(Calendar.MILLISECOND, 0);

                return dueDate.before(today.getTime());
            } catch (ParseException e) {
                return false; // If we can't parse the date, assume it's not past
            }
        }

        private int compareDueDates(String dateA, String dateB) {
            boolean aHasDate = dateA != null && !dateA.isEmpty();
            boolean bHasDate = dateB != null && !dateB.isEmpty();

            // Tasks with due dates come before tasks without due dates
            if (aHasDate && !bHasDate)
                return -1;
            if (!aHasDate && bHasDate)
                return 1;
            if (!aHasDate && !bHasDate)
                return 0;

            // Both have due dates - compare them
            try {
                SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM yyyy", new Locale("af", "ZA"));
                Date parsedDateA = outputFormat.parse(dateA);
                Date parsedDateB = outputFormat.parse(dateB);
                return parsedDateA.compareTo(parsedDateB);
            } catch (ParseException e) {
                return dateA.compareTo(dateB); // Fallback to string comparison
            }
        }
    }

    static class Task {
        String id;
        String name;
        String dueDate;
        String category;
        boolean important;
    }
}

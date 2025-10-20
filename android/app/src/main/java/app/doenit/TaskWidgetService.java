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

            // Determine task state
            boolean isPast = isDatePast(task.startDate);
            boolean isOngoing = isTaskOngoing(task.startDate, task.dueDate);

            // Set task name
            views.setTextViewText(R.id.task_name, task.name);

            // Set background based on task state
            int backgroundResource = R.drawable.task_item_background_default;
            if (isOngoing) {
                backgroundResource = R.drawable.task_item_background_ongoing;
            } else if (isPast) {
                backgroundResource = R.drawable.task_item_background_past;
            }
            views.setInt(R.id.task_container, "setBackgroundResource", backgroundResource);

            // Handle due date display with icon

            // Show date pill if either startDate or dueDate is present
            String displayDate = null;
            Log.d(Const.LOG_TAG_DOENIT_WIDGET,
                    "Task " + task.id + " - dueDate: " + task.dueDate + ", startDate: " + task.startDate);
            if (!Utils.isEmpty(task.dueDate)) {
                displayDate = task.dueDate;
            } else if (!Utils.isEmpty(task.startDate)) {
                displayDate = task.startDate;
            }

            Log.d(Const.LOG_TAG_DOENIT_WIDGET,
                    "Task " + task.id + " - displayDate: " + displayDate + " is Start Empty: "
                            + Utils.isEmpty(task.startDate) + " is Due Empty: " + Utils.isEmpty(task.dueDate));

            if (!Utils.isEmpty(displayDate)) {
                views.setViewVisibility(R.id.due_date_container, android.view.View.VISIBLE);
                views.setViewVisibility(R.id.pills_container, android.view.View.VISIBLE);
                views.setTextViewText(R.id.task_due_date, displayDate);

                // Set pill background based on state
                int pillBackground = R.drawable.pill_background_default;
                if (isOngoing) {
                    pillBackground = R.drawable.pill_background_ongoing;
                } else if (isPast) {
                    pillBackground = R.drawable.pill_background_past;
                }
                views.setInt(R.id.due_date_container, "setBackgroundResource", pillBackground);

                // Show repeat icon if task is repeating
                if (task.isRepeating) {
                    views.setViewVisibility(R.id.repeat_icon, android.view.View.VISIBLE);
                } else {
                    views.setViewVisibility(R.id.repeat_icon, android.view.View.GONE);
                }
            } else {
                views.setViewVisibility(R.id.due_date_container, android.view.View.GONE);
            }

            // Handle category display with icon
            if (task.category != null && !task.category.isEmpty()) {
                views.setViewVisibility(R.id.category_container, android.view.View.VISIBLE);
                views.setViewVisibility(R.id.pills_container, android.view.View.VISIBLE);
                views.setTextViewText(R.id.task_category, task.category);

                // Set pill background based on state
                int pillBackground = R.drawable.pill_background_default;
                if (isOngoing) {
                    pillBackground = R.drawable.pill_background_ongoing;
                } else if (isPast) {
                    pillBackground = R.drawable.pill_background_past;
                }
                views.setInt(R.id.category_container, "setBackgroundResource", pillBackground);
            } else {
                views.setViewVisibility(R.id.category_container, android.view.View.GONE);
            }

            // Hide pills container if both date and category are hidden
            if (Utils.isEmpty(displayDate) && Utils.isEmpty(task.category)) {
                views.setViewVisibility(R.id.pills_container, android.view.View.GONE);
            }

            // Set priority indicators
            if (task.important) {
                views.setViewVisibility(R.id.important_icon, android.view.View.VISIBLE);
            } else {
                views.setViewVisibility(R.id.important_icon, android.view.View.GONE);
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
                    task.dueDate = toDisplayDate(taskJson.optString("due_date", ""));
                    task.startDate = toDisplayDate(taskJson.optString("start_date", ""));

                    // Get category name from category ID
                    String categoryId = taskJson.optString("category_id", "");
                    task.category = getCategoryName(categoryId, categories);
                    task.important = taskJson.optBoolean("important", false);
                    task.isRepeating = !taskJson.optString("repeat_interval", "").isEmpty();

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
                Log.d(Const.LOG_TAG_DOENIT_WIDGET, "Found " + tasksArray.length() + " total tasks, loaded "
                        + tasks.size() + " active tasks for widget");
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

        private String toDisplayDate(String dateString) {
            if (dateString == null || dateString.isEmpty() || dateString.equals("null")) {
                return "";
            }

            // Default to Afrikaans
            Locale locale = new Locale("af", "ZA");

            // Try to get language preference from SharedPreferences (set by Capacitor
            // Preferences)
            try {
                SharedPreferences prefs = context.getSharedPreferences(Const.DB_NAME, Context.MODE_PRIVATE);
                String languagePref = prefs.getString("language", null);
                if ("en".equals(languagePref)) {
                    locale = Locale.ENGLISH;
                }
            } catch (Exception e) {
                // Fallback to Afrikaans if anything goes wrong
            }

            try {
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
                Date date = inputFormat.parse(dateString);

                SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM yyyy", locale);
                return outputFormat.format(date);
            } catch (ParseException e) {
                return dateString; // Return original string if parsing fails
            }
        }

        private boolean isDatePast(String startDateStr) {
            if (startDateStr == null || startDateStr.isEmpty()) {
                return false;
            }

            try {
                // Parse ISO date format (yyyy-MM-dd)
                SimpleDateFormat inputFormat = new SimpleDateFormat("d MMM yyyy", new Locale("af", "ZA"));
                Date startDate = inputFormat.parse(startDateStr);

                // Get today's date at midnight for comparison
                Calendar today = Calendar.getInstance();
                today.set(Calendar.HOUR_OF_DAY, 0);
                today.set(Calendar.MINUTE, 0);
                today.set(Calendar.SECOND, 0);
                today.set(Calendar.MILLISECOND, 0);

                return startDate != null && startDate.before(today.getTime());
            } catch (ParseException e) {
                return false; // If we can't parse the date, assume it's not past
            }
        }

        private boolean isTaskOngoing(String startDateStr, String dueDateFormatted) {
            if (startDateStr == null || startDateStr.isEmpty()) {
                return false;
            }

            try {
                SimpleDateFormat inputFormat = new SimpleDateFormat("d MMM yyyy", new Locale("af", "ZA"));
                Date startDate = inputFormat.parse(startDateStr);

                // Get today's date at midnight
                Calendar today = Calendar.getInstance();
                today.set(Calendar.HOUR_OF_DAY, 0);
                today.set(Calendar.MINUTE, 0);
                today.set(Calendar.SECOND, 0);
                today.set(Calendar.MILLISECOND, 0);
                Date todayDate = today.getTime();

                if (startDate == null) {
                    return false;
                }

                // If there's a due date, check if today is between start and due
                if (dueDateFormatted != null && !dueDateFormatted.isEmpty()) {
                    SimpleDateFormat outputFormat = new SimpleDateFormat("d MMM yyyy", new Locale("af", "ZA"));
                    Date dueDate = outputFormat.parse(dueDateFormatted);

                    if (dueDate != null) {
                        return !todayDate.before(startDate) && !todayDate.after(dueDate);
                    }
                }

                // If no due date, check if today equals start date
                Calendar startCal = Calendar.getInstance();
                startCal.setTime(startDate);
                startCal.set(Calendar.HOUR_OF_DAY, 0);
                startCal.set(Calendar.MINUTE, 0);
                startCal.set(Calendar.SECOND, 0);
                startCal.set(Calendar.MILLISECOND, 0);

                return todayDate.equals(startCal.getTime()) && !todayDate.after(startDate);
            } catch (ParseException e) {
                return false;
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
        String startDate;
        String category;
        boolean important;
        boolean isRepeating;
    }
}

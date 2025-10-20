package doenit.app;

import android.appwidget.AppWidgetManager;
import android.content.SharedPreferences;
import android.content.ComponentName;
import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;
import org.json.JSONArray;

@CapacitorPlugin(name = "TaskWidget")
public class TaskWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidget(PluginCall call) {
        try {
            Context context = getContext();

            // Tasks
            JSONArray tasks = call.getArray("tasks");
            if (tasks == null) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("message", "Tasks data is null or empty");
                call.resolve(ret);
                return;
            }

            // Categories
            JSONArray categoriesArray = call.getArray("categories");
            JSONObject categoriesObject = new JSONObject();
            int categoriesCount = categoriesArray != null ? categoriesArray.length() : 0;
            if (categoriesCount > 0) {
                for (int i = 0; i < categoriesArray.length(); i++) {
                    JSONObject category = categoriesArray.getJSONObject(i);
                    String categoryId = category.optString("id", "");
                    if (!categoryId.isEmpty()) {
                        categoriesObject.put(categoryId, category);
                    }
                }
            }
            
            Log.d(Const.LOG_TAG_DOENIT, "updateWidget called with " + tasks.length() + " tasks and " + categoriesCount + " categories");
            Log.d(Const.LOG_TAG_DOENIT, "Tasks JSON: " + tasks.toString());
            Log.d(Const.LOG_TAG_DOENIT, "Categories JSON: " + categoriesObject.toString());
            TaskWidgetProvider.updateTasksData(context, tasks.toString(), categoriesObject.toString());

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Widget updated successfully");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget: " + e.getMessage());
        }
    }

    @PluginMethod
    public void updateLanguage(PluginCall call) {
        try {
            String language = call.getString("language");
            if (Utils.isEmpty(language)) {
                call.reject("Missing 'language' parameter");
                return;
            }

            Context context = getContext();

            // Delegate to the widget provider which will persist and refresh widgets
            TaskWidgetProvider.updateLanguage(context, language);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("language", language);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget language: " + e.getMessage());
        }
    }
}

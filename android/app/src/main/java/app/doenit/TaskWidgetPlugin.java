package doenit.app;

import android.appwidget.AppWidgetManager;
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
            JSONArray tasks = call.getArray("tasks");

            if (tasks == null) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("message", "Tasks data is null or empty");
                call.resolve(ret);
                return;
            }

            Context context = getContext();
            TaskWidgetProvider.updateTasksData(context, tasks.toString());

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("message", "Widget updated successfully");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to update widget: " + e.getMessage());
        }
    }
}

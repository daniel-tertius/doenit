package doenit.app;

import android.content.SharedPreferences;
import android.util.Log;
import android.content.Context;

public class DB {
    private static SharedPreferences prefs;

    public static void init(Context context) {
        if (prefs != null) {
            return;
        }

        prefs = context.getSharedPreferences(Const.DB_NAME, Context.MODE_PRIVATE);
    }

    public static void saveData(String name, String data) {
        if (prefs == null) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "SharedPreferences not initialized");
            return;
        }

        try {
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString(name, data);
            editor.apply();
            Log.d(Const.LOG_TAG_DOENIT_DB, "Saved data for " + name + ": " + data);
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "Error saving data", e);
        }
    }

    public static String getString(String name) {
        if (prefs == null) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "SharedPreferences not initialized");
            return null;
        }

        try {
            String value = prefs.getString(name, null);
            Log.d(Const.LOG_TAG_DOENIT_DB, "Retrieved string for " + name + ": " + value);
            return value;
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "Error getting string", e);
            return null;
        }
    }

    public static int getInt(String name) {
        if (prefs == null) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "SharedPreferences not initialized");
            return 0;
        }

        try {
            String value = DB.getString(name);
            return value != null ? Integer.parseInt(value) : 0;
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "Error getting int", e);
            return 0;
        }
    }

    public static long getLong(String name) {
        if (prefs == null) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "SharedPreferences not initialized");
            return 0;
        }

        try {
            String value = DB.getString(name);
            return value != null ? Long.parseLong(value) : 0;
        } catch (Exception e) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "Error getting long", e);
            return 0;
        }
    }

    public static void clearData() {
        if (prefs == null) {
            Log.e(Const.LOG_TAG_DOENIT_DB, "SharedPreferences not initialized");
            return;
        }

        Log.d(Const.LOG_TAG_DOENIT_DB, "Clearing all data from SharedPreferences");
        prefs.edit().clear().apply();
    }
}

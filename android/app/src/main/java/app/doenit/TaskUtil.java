package doenit.app;

public class TaskUtil {
    public static String getDate(Task task) {
        if (task == null)
            return null;

        String startDate = task.startDate;
        String dueDate = task.dueDate;

        if (!Utils.isEmpty(dueDate)) {
            return dueDate;
        } else if (!Utils.isEmpty(startDate)) {
            return startDate;
        }

        return null;
    }

    public static String getListIsEmptyString() {
        String language = DB.getString("language", "af");

        if ("en".equals(language)) {
            return "Your list is empty!\nPress + to add one";
        } else {
            return "Jou lys is skoon!\nDruk + om een by te voeg";
        }
    }
}

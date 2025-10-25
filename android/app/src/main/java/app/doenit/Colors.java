package doenit.app;

import doenit.app.R;

public class Colors {
    public static int get(String name) {
        String theme = DB.getString("theme", "dark");
        Boolean is_light = theme.equals("light");

        switch (name) {
            case "page":
                return is_light ? R.color.page_light : R.color.page_dark;
            case "surface":
                return is_light ? R.color.surface_light : R.color.surface_dark;
            case "card":
                return is_light ? R.color.card_light : R.color.card_dark;
            case "primary":
                return is_light ? R.color.primary_light : R.color.primary_dark;
            case "text-normal":
                return is_light ? R.color.text_normal_light : R.color.text_normal_dark;
            case "text-strong":
                return is_light ? R.color.text_strong_light : R.color.text_strong_dark;
            case "text-alt":
                return is_light ? R.color.text_alt_light : R.color.text_alt_dark;
            case "pill-default":
                if (is_light) {
                    return R.drawable.pill_default_light;
                } else {
                    return R.drawable.pill_default_dark;
                }
            case "pill-ongoing":
                if (is_light) {
                    return R.drawable.pill_ongoing_light;
                } else {
                    return R.drawable.pill_ongoing_dark;
                }
            case "pill-past":
                if (is_light) {
                    return R.drawable.pill_past_light;
                } else {
                    return R.drawable.pill_past_dark;
                }
            default:
                throw new IllegalArgumentException("Unknown color name: " + name);
        }
    }
}
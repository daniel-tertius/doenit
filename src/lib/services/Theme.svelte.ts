import { browser } from "$app/environment";
import { cached_theme } from "$lib/cached";

export type ThemeValue = "dark" | "light" | "auto";
class Theme {
  #value: ThemeValue = "auto";

  constructor() {
    this.init();
  }

  async init() {
    let theme = await cached_theme.get();
    if (!theme) {
      cached_theme.set("auto");
      theme = "auto";
    }

    this.value = theme;
  }

  get value() {
    return this.#value;
  }

  set value(theme_value: string) {
    if (!browser) return;

    if (!this.isValidTheme(theme_value)) {
      console.warn(`Invalid theme value: ${theme_value}. Valid values are 'dark', 'light', or 'auto'.`);
      return;
    }

    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove("theme-dark", "theme-light");

    let actualTheme = theme_value;

    // Handle auto theme
    if (theme_value === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      actualTheme = prefersDark ? "dark" : "light";
    }

    // Apply theme class
    root.classList.add(`theme-${actualTheme}`);
    cached_theme.set(theme_value);
    this.#value = theme_value;
  }

  private isValidTheme(theme_value: string): theme_value is ThemeValue {
    return ["dark", "light", "auto"].includes(theme_value);
  }
}

export const theme = new Theme();

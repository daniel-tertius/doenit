import { Preferences } from "@capacitor/preferences";

class Cached<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  async get(): Promise<T | null> {
    const { value } = await Preferences.get({ key: this.key });

    if (value === "undefined" || value == null) {
      return null;
    }

    return JSON.parse(value);
  }

  async set(data: T): Promise<void> {
    await Preferences.set({
      key: this.key,
      value: JSON.stringify(data),
    });
  }

  async remove(): Promise<void> {
    await Preferences.remove({ key: this.key });
  }
}

export const selectedCategories = new Cached<string[]>("selected_categories");
export const cached_theme = new Cached<"light" | "dark" | null>("theme");
export const cached_notification_time = new Cached<string | null>("time");
export const cached_notification_past_tasks = new Cached<boolean>("past_tasks");
/** The email address that has been verified. */
export const cached_email_address = new Cached<string | null>("email_address");
export const cached_backup_token = new Cached<string | null>("backup_token");
export const cached_language = new Cached<"af" | "en" | null>("language");

import { Preferences } from "@capacitor/preferences";
import type { ThemeValue } from "./services/Theme.svelte";

class Cached<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  async get(): Promise<T | null> {
    const { value } = await Preferences.get({ key: this.key });
    return value ? JSON.parse(value) : null;
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
export const cached_theme = new Cached<ThemeValue>("theme");
export const cached_notification_time = new Cached<string | null>("time");
/**
 * The email address that has been verified.
 */
export const cached_email_address = new Cached<string | null>("email_address");
export const cached_is_backup_enabled = new Cached<boolean | null>("backup_enabled");
export const cached_backup_token = new Cached<string | null>("backup_token");

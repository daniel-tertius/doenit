import { Preferences } from "@capacitor/preferences";

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

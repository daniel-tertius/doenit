import { cached_text_settings } from "$lib/cached";

class Text {
  private settings = $state<{ size: 16 | 20 | 24 }>({ size: 16 });

  constructor() {
    this.init();
  }

  async init() {
    let text_settings = await cached_text_settings.get();
    if (!text_settings) {
      text_settings = this.settings;
      cached_text_settings.set(text_settings);
    }

    if (!this.isValidSize(text_settings.size)) {
      text_settings.size = 16;
    }

    this.settings = text_settings;
    this.updateCSSVariable();
  }

  set size(size: any) {
    if (!this.isValidSize(size)) {
      console.warn(`Invalid text size: ${size}. Valid sizes are 16, 20, or 24.`);
      return;
    }

    this.settings.size = size;
    console.log("Setting text size to", size);
    cached_text_settings.set(this.settings);

    this.updateCSSVariable();
  }

  get size() {
    return this.settings.size;
  }

  private updateCSSVariable() {
    if (typeof document === "undefined") {
      throw Error("Document is not defined. This code must run in a browser environment.");
    }

    document.documentElement.style.setProperty("--base-size", `${this.settings.size}px`);
  }

  private isValidSize(size: any): size is 16 | 20 | 24 {
    return [16, 20, 24].includes(size);
  }
}

export const text = new Text();

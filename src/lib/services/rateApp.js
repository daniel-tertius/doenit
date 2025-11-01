import { InAppReview } from "@capacitor-community/in-app-review";
import { Alert } from "$lib/core/alert.js";
import { t } from "$lib/services/language.svelte";
import { DateUtil } from "$lib/core/date_util";
import { Cached } from "$lib/core/cache.svelte";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { PUBLIC_GOOGLE_PLAY_STORE_URL } from "$env/static/public";

class RateAppService {
  constructor() {
    this.TASK_COMPLETION_THRESHOLD = 3;
    this.DAYS_OF_USE_THRESHOLD = 7;
    this.DISMISS_COOLDOWN_DAYS = 15;
  }

  async init() {
    // Initialize tracking data if not exists
    const settings = Cached.rateUs.value;

    if (!settings) {
      Cached.rateUs.value = {
        task_completions: 0,
        first_use_date: DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss"),
        last_dismissed_date: null,
      };
    }
  }

  async onTaskCompleted() {
    await this.init();

    if (!Cached.rateUs.value) return;

    Cached.rateUs.value.task_completions += 1;

    if (Cached.rateUs.value.task_completions >= this.TASK_COMPLETION_THRESHOLD) {
      await this.checkAndShowRating();
    }
  }

  async checkDailyUsage() {
    await this.init();
    if (!Cached.rateUs.value) return;

    const tracking = Cached.rateUs.value;

    const first_use_date = new Date(tracking.first_use_date);
    const days_since_last_use = Math.floor((Date.now() - first_use_date.getTime()) / (1000 * 60 * 60 * 24));

    if (days_since_last_use >= this.DAYS_OF_USE_THRESHOLD) {
      await this.checkAndShowRating();
    }
  }

  async checkAndShowRating() {
    try {
      if (!Cached.rateUs.value) return;

      const tracking = Cached.rateUs.value;

      // Check if we're still in cooldown period after dismissal
      if (tracking.last_dismissed_date) {
        const dismissedDate = new Date(tracking.last_dismissed_date);
        const daysSinceDismissal = Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceDismissal < this.DISMISS_COOLDOWN_DAYS) {
          return;
        }
      }

      await this.showRatingPrompt();
    } catch (error) {
      Alert.error("Error checking/showing rating prompt: " + error);
    }
  }

  async showRatingPrompt() {
    if (!Cached.rateUs.value) return;

    try {
      Cached.rateUs.value.last_dismissed_date = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
      await InAppReview.requestReview();
    } catch (error) {
      console.error("Failed to show in-app review:", error);
    }
  }

  async resetRating() {
    if (!Cached.rateUs.value) return;

    // For testing purposes
    Cached.rateUs.value = {
      task_completions: 0,
      first_use_date: DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss"),
      last_dismissed_date: null,
    };
  }

  async openStorePage() {
    try {
      if (Capacitor.isNativePlatform()) {
        Browser.open({ url: PUBLIC_GOOGLE_PLAY_STORE_URL });
      } else {
        window.open(PUBLIC_GOOGLE_PLAY_STORE_URL, "_blank");
      }
    } catch (e) {
      Alert.error(t("rate_app_error"));
    }
  }
}

export const RateApp = new RateAppService();

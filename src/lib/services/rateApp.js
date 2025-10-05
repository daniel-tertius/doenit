import { InAppReview } from "@capacitor-community/in-app-review";
import { Alert } from "$lib/core/alert.js";
import { t } from "$lib/services/language.svelte";
import { DateUtil } from "$lib/core/date_util";
import { Cached } from "$lib/core/cache.svelte";

class RateAppService {
  constructor() {
    this.TASK_COMPLETION_THRESHOLD = 3;
    this.DAYS_OF_USE_THRESHOLD = 7;
    this.DISMISS_COOLDOWN_DAYS = 30;
  }

  async init() {
    // Initialize tracking data if not exists
    const settings = Cached.rateUs.value;

    if (!settings) {
      Cached.rateUs.value = {
        task_completions: 0,
        first_use_date: DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss"),
        last_dismissed_date: null,
        has_rated: false,
      };
    }
  }

  async onTaskCompleted() {
    await this.init();

    if (!Cached.rateUs.value) return;

    if (Cached.rateUs.value.has_rated) return;

    Cached.rateUs.value.task_completions += 1;

    if (Cached.rateUs.value.task_completions >= this.TASK_COMPLETION_THRESHOLD) {
      await this.checkAndShowRating();
    }
  }

  async checkDailyUsage() {
    await this.init();
    if (!Cached.rateUs.value) return;

    const tracking = Cached.rateUs.value;
    if (tracking.has_rated) return;

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
      if (tracking.has_rated) return;

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

    const message = t("rate_app_message");

    const result = await Alert.confirm({
      title: t("rate_app_title"),
      message: message,
      confirmText: t("rate_now"),
      cancelText: t("maybe_later"),
    });

    if (result) {
      // User wants to rate
      try {
        await InAppReview.requestReview();
        Cached.rateUs.value.has_rated = true;
      } catch (error) {
        console.error("Failed to show in-app review:", error);
        Alert.error(t("rate_app_error"));
      }
    } else {
      // User dismissed - set cooldown
      Cached.rateUs.value.last_dismissed_date = new Date().toISOString();
    }
  }

  async resetRating() {
    if (!Cached.rateUs.value) return;

    // For testing purposes
    Cached.rateUs.value = {
      task_completions: 0,
      first_use_date: DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss"),
      last_dismissed_date: null,
      has_rated: false,
    };
  }

  async directRate() {
    try {
      await InAppReview.requestReview();
    } catch (e) {
      Alert.error(t("rate_app_error"));
    }
  }
}

export const RateApp = new RateAppService();

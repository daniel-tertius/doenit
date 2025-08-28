<script>
  import { ContainerDetails } from "$lib/components/element/container";
  import { ButtonLanguage } from "$lib/components/element/button";
  import { Moon, Sun } from "$lib/icon";
  import { t, language } from "$lib/services/language.svelte";
  import { theme } from "$lib/services/theme.svelte";

  /**
   * Handle language change
   * @param {'af' | 'en'} lang
   */
  function onlanguagechange(lang) {
    language.value = lang;
  }
</script>

<ContainerDetails label={t("appearance")}>
  <div>
    <label for="theme-select" class="block text-sm font-medium mb-2">{t("theme")}</label>
    <button
      class="relative flex h-12 w-full p-1 gap-2 rounded-lg dark:bg-dark-secondary bg-dark-300"
      onclick={() => theme.toggle()}
      aria-label={t("toggle_theme")}
    >
      <div class="absolute z-2 top-3 left-1/4 -translate-x-1/2 text-dark-300 bg-transparent flex gap-2 items-center">
        <Sun size={24} variant={theme.value === "light" ? "filled" : "outline"} />
        <span class="text-sm font-medium">{t("light_theme")}</span>
      </div>

      <div
        class="absolute z-2 top-3 right-1/4 translate-x-1/2 text-dark-secondary bg-transparent flex gap-2 items-center"
      >
        <span class="text-sm font-medium">{t("dark_theme")}</span>
        <Moon size={24} variant={theme.value === "dark" ? "filled" : "outline"} />
      </div>
      <div class="absolute inset-0 {theme.value === 'dark' ? 'translate-x-full' : 'translate-x-0'} w-1/2 h-full p-1">
        <div class="rounded-lg h-full z-1 w-full bg-dark-secondary dark:bg-dark-300"></div>
      </div>
    </button>
  </div>

  <div>
    <label for="language-select" class="block text-sm font-medium mb-2">{t("language")}</label>
    <div class="flex gap-2">
      <ButtonLanguage
        selected={language.value === "af"}
        flagSrc="flags/af.webp"
        languageName={t("afrikaans")}
        onclick={() => onlanguagechange("af")}
      />
      <ButtonLanguage
        selected={language.value === "en"}
        flagSrc="flags/en.webp"
        languageName={t("english")}
        onclick={() => onlanguagechange("en")}
      />
    </div>
  </div>
</ContainerDetails>

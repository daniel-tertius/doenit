<script>
  import { t } from "$lib/services/Language.svelte";
</script>

<section class="rounded-md p-4 bg-t-primary space-y-2 text-t-secondary">
  <h3 class="font-semibold mb-2">{t("about_doenit")}</h3>

  <!-- Keep in sync with: android/app/build.gradle – versionName -->
  <p>{t("version")}</p>
  <p class="text-sm text-t-secondary/80">
    {t("contact_support")} <a
      href="mailto:support.tricky800@passmail.com"
      class="text-blue-400/80 hover:text-blue-500/80 underline"
    >
      support.tricky800@passmail.com
    </a>
  </p>
</section>

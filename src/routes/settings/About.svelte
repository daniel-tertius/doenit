<script>
  import { t } from "$lib/services/language.svelte";

  const SUPPORT_EMAIL = "support.tricky800@passmail.com";
</script>

<section class="rounded-md p-4 bg-surface space-y-2 text-t-secondary">
  <h3 class="font-semibold text-lg mb-2">{t("about_doenit")}</h3>

  <!-- Keep in sync with:  -->
  <!-- android/app/build.gradle – versionName -->
  <!-- package.json – "version" -->

  <p class="">{t("version")} 1.2.3</p>
  <p class="">
    {t("contact_support")}
    <a href="mailto:{SUPPORT_EMAIL}" class="text-primary underline">{SUPPORT_EMAIL}</a>
  </p>
</section>

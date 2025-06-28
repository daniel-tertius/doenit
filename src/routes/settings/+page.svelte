<script>
  import Backup from "./Backup.svelte";
  import FutureIdeas from "./FutureIdeas.svelte";
  import Notifications from "./Notifications.svelte";
  import ThemeAndLanguage from "./ThemeAndLanguage.svelte";
</script>

<div class="space-y-4">
  <ThemeAndLanguage />
  <Notifications />
  {#if false}
    <Backup />
  {/if}
  <FutureIdeas />

  <section class="rounded-md p-4 bg-bg space-y-2 text-text select-none">
    <h3 class="font-semibold mb-2">Oor Doenit</h3>

    <!-- Keep in sync with: android/app/build.gradle – versionName -->
    <p>Weergawe 1.0.8</p>
    <p class="text-text-muted">
      Het jy hulp nodig of terugvoer? Kontak my by: <a
        href="mailto:support.tricky800@passmail.com"
        class="text-blue-500 hover:text-blue-700 underline"
      >
        support.tricky800@passmail.com
      </a>
    </p>
  </section>
</div>

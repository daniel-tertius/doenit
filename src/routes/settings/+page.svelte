<script>
  import Backup from "./Backup.svelte";
  import FutureIdeas from "./FutureIdeas.svelte";
  import Notifications from "./Notifications.svelte";
  import ThemeAndLanguage from "./ThemeAndLanguage.svelte";
</script>

<div class="space-y-4 text-tertiary">
  <ThemeAndLanguage />
  <Notifications />
  {#if false}
    <Backup />
  {/if}
  <FutureIdeas />

  <div class="bg-primary-20l rounded-lg">
    <div class="p-4">
      <h3 class="font-semibold mb-2">Oor Doenit</h3>
      <!-- Keep in sync with: android/app/build.gradle – versionName -->
      <p class="text-sm text-tertiary-20d mb-2">Weergawe 1.0.8</p>
      <p class="text-sm text-tertiary-20d mb-2">Het jy hulp nodig of terugvoer? Kontak my by:</p>
      <div class="text-center">
        <a href="mailto:support.tricky800@passmail.com" class="text-blue-500 hover:text-blue-700 underline text-sm">
          support.tricky800@passmail.com
        </a>
      </div>
    </div>
  </div>
</div>

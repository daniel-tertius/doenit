<script>
  import About from "./About.svelte";
  import Backup from "./Backup.svelte";
  import Notifications from "./Notifications.svelte";
  import Support from "./Support.svelte";
  import ThemeAndLanguage from "./ThemeAndLanguage.svelte";
</script>

<div class="space-y-4">
  <ThemeAndLanguage />
  <Notifications />
  <Backup />
  <Support />
  <About />
</div>

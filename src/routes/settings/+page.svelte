<script>
  import About from "./About.svelte";
  import Backup from "./Backup.svelte";
  import Notifications from "./Notifications.svelte";
  import Support from "./Support.svelte";
  import Appearance from "./Appearance.svelte";
  import UserDisplay from "./UserDisplay.svelte";
</script>

<div class="space-y-4">
  <UserDisplay />
  <Appearance />
  <Notifications />
  <Backup />
  <Support />
  <About />
</div>

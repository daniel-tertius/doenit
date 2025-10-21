<script>
  import About from "./About.svelte";
  import Backup from "./Backup.svelte";
  import Notifications from "./Notifications.svelte";
  import SupportMe from "./SupportMe.svelte";
  import Appearance from "./Appearance.svelte";
  import UserDisplay from "./UserDisplay.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { BACK_BUTTON_FUNCTION } from "$lib";
  import { backHandler } from "$lib/BackHandler.svelte";

  onMount(() => {
    const token = (BACK_BUTTON_FUNCTION.value = backHandler.register(async () => {
      await goto(`/`);
    }, -1));

    return () => backHandler.unregister(token);
  });
</script>

<div class="space-y-4">
  <UserDisplay />
  <Appearance />
  <Notifications />
  <Backup />
  <SupportMe />
  <About />
</div>

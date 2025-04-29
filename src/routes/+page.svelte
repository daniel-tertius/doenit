<script>
  import { Home, Create } from "$lib/components/pages/";
  import { App } from "@capacitor/app";

  /** @type {'home' | 'create'} */
  let state = $state("home");

</script>

{#if state === "home"}
  <Home onclose={() => App.exitApp()} oncreate={() => (state = "create")} />
{:else if state === "create"}
  <Create onclose={() => (state = "home")} />
{/if}

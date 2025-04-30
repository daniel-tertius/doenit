<script>
  import { Home, Create } from "$lib/components/pages/";
  import { App } from "@capacitor/app";

  /** @type {'home' | 'create' | 'update'} */
  let state = $state("home");
  let item = $state(null);
</script>

{#if state === "home"}
  <Home
    onclose={() => App.exitApp()}
    oncreate={() => (state = "create")}
    onupdate={(data) => {
      item = data;
      console.log(item);
      state = "update";
    }}
  />
{:else if state === "update"}
  <Create {item} onclose={() => (state = "home")} />
{:else if state === "create"}
  <Create onclose={() => (state = "home")} />
{/if}

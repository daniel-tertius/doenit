<script>
  import { Home, Create } from "$lib/components/pages/";
  import { App } from "@capacitor/app";
  import "../app.css";

  /** @type {'home' | 'create' | 'update'} */
  let state = $state("home");
  let item = $state(null);
</script>

<main class="min-h-screen flex bg-[#223a51]">
  <div class="bg-[#325372] grow relative max-w-[1000px] mx-auto pt-5 px-2">
    {#if state === "home"}
      <Home
        onclose={() => App.exitApp()}
        oncreate={() => (state = "create")}
        onupdate={(data) => {
          item = data;
          state = "update";
        }}
      />
    {:else if state === "update"}
      <Create {item} onclose={() => (state = "home")} />
    {:else if state === "create"}
      <Create onclose={() => (state = "home")} />
    {/if}
  </div>
</main>

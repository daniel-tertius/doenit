<script>
  import { Home } from "$lib/pages";
  import { App } from "@capacitor/app";
</script>

<Home onclose={() => App.exitApp()} />

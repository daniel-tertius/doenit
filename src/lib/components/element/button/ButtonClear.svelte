<script>
  import { Times } from "$lib/icon";

  const { ...rest } = $props();
</script>

<button {...rest} type="button" class={["aspect-square h-11 flex items-center justify-center", rest.class || ""]}>
  <Times />
</button>

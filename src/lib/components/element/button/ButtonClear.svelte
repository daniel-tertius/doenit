<script>
  import { Times } from "$lib/icon";

  const { ...rest } = $props();
</script>

<button
  {...rest}
  type="button"
  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-30d hover:text-primary-50l"
>
  <Times size={18} class="text-t-secondary" />
</button>

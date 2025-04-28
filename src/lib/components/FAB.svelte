<script>
  let { onclick, children, ...rest } = $props();
</script>

<button
  {onclick}
  type="button"
  aria-label="Create new item"
  class="fixed w-14 h-14 p-3 rounded-full flex items-center justify-center shadow-lg {rest.class}"
>
  {@render children()}
</button>

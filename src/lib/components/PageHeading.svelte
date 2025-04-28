<script>
  let { children } = $props();
</script>

<div class="w-full mb-6">
  <h1 class="text-3xl font-bold text-gray-200 w-fit mx-auto">{@render children()}</h1>
</div>

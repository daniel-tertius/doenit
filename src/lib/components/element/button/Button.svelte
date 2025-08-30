<script>
  const { children, ...rest } = $props();
</script>

<button
  {...rest}
  class={[
    "h-12 my-auto flex gap-1  border rounded-lg px-4 w-full items-center justify-center dark:bg-dark-400 dark:border-dark-700",
    rest.class || '',
  ]}
>
  {@render children()}
</button>

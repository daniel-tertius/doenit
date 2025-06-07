<script>
  let { name, completed, checkoff_animation } = $props();
</script>

<div class="relative select-none text-tertiary ml-9" class:opacity-50={!name}>
  {#if checkoff_animation || completed}
    <div
      class="{completed
        ? 'border-b opacity-50'
        : 'border-b-2'} border-tertiary absolute top-2.5 transition-all duration-300"
      class:w-full={checkoff_animation || completed}
    ></div>
  {/if}
  <span class="text-left my-auto overflow-hidden line-clamp-1" class:opacity-50={!!completed}>
    {name || "Geen beskrywing…"}
  </span>
</div>

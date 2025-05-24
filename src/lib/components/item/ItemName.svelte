<script>
  let { name, completed, checkoff_animation } = $props();
</script>

<div class="relative pl-9 text-gray-200 font-semibold line-clamp-1" class:opacity-50={!name}>
  {#if checkoff_animation || completed}
    <div
      class="w-0 {completed
        ? 'border-b opacity-50'
        : 'border-b-2'} border-white absolute top-2.5 transition-all duration-300 {checkoff_animation ? 'w-full' : ''}"
    ></div>
  {/if}
  <span class="h-full text-left my-auto overflow-hidden" class:opacity-50={!!completed}>
    {name || "Geen beskrywing…"}
  </span>
</div>

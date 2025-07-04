<script>
  let { name, completed = false, tick_animation } = $props();
</script>

<div class="relative select-none text-t-secondary ml-10 mr-6" class:opacity-50={!name}>
  {#if tick_animation || completed}
    <div
      class="border-b border-t-secondary absolute top-[11px] transition-all duration-300"
      class:opacity-60={completed}
      class:w-full={tick_animation || completed}
    ></div>
  {/if}

  <span class="text-left font-semibold my-auto overflow-hidden line-clamp-1" class:opacity-50={!!completed}>
    {name || "Geen beskrywing…"}
  </span>
</div>

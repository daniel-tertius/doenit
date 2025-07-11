<script>
  import { More } from "$lib/icon";

  let { name, completed = false, tick_animation, description = "" } = $props();
</script>

<div class="relative text-t-secondary ml-10 mr-6" class:opacity-50={!name}>
  {#if tick_animation || completed}
    <div
      class="border-b border-t-secondary absolute top-[11px] transition-all duration-300"
      class:opacity-60={completed}
      class:w-full={tick_animation || completed}
    ></div>
  {/if}

  <span class="flex items-center text-left font-semibold my-auto relative" class:opacity-50={!!completed}>
    {name || "Geen beskrywing…"}
    {#if description && description.trim()}
      <More size={14} class="ml-1 opacity-60" />
    {/if}
  </span>
</div>

<script>
  import { slide } from "svelte/transition";
  import { longpress } from "../long";

  const { children, tick_animation, onlongpress, ...rest } = $props();
</script>

<div
  class="relative text-t-secondary min-h-10 transition-all rounded-lg duration-600 delay-350 shadow-sm"
  class:translate-x-[80%]={tick_animation}
  in:slide={{ delay: 200 }}
>
  <button
    {...rest}
    {onlongpress}
    use:longpress
    class={["rounded-lg flex flex-col items-start py-4 px-2 w-full h-full", rest.class || ""]}
  >
    {@render children()}
  </button>
</div>

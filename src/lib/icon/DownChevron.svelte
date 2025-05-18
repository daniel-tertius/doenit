<script>
  let { size = 24, color: stroke = "currentColor", ...rest } = $props();
</script>

<svg
  {...rest}
  class="transition-all duration-300 {rest.class}"
  fill="none"
  height={size}
  width={size}
  {stroke}
  viewBox="0 0 24 24"
>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
</svg>

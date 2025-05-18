<script>
  let { size = 24, color = "currentColor", ...rest } = $props();
</script>

<svg
    {...rest}
  class={rest.class}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <polyline points="20 6 9 17 4 12"></polyline>
</svg>

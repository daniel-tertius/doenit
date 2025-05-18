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
  <rect x="3" y="3" width="7" height="7" />
  <rect x="14" y="3" width="7" height="7" />
  <rect x="3" y="14" width="7" height="7" />
  <rect x="14" y="14" width="7" height="7" />
</svg>

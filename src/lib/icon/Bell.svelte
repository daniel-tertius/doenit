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
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
  <path d="m13.73 21a2 2 0 0 1-3.46 0"></path>
</svg>

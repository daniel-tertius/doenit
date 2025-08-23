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
  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
  <polyline points="14,2 14,8 20,8"></polyline>
  <path d="M9 15h6"></path>
  <path d="m12 18 3-3-3-3"></path>
</svg>

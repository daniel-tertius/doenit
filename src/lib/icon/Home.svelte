<script>
  let { size = 24, color = "currentColor", ...rest } = $props();
</script>

<svg
  class={rest.class}
  viewBox="0 0 24 24"
  width={size}
  height={size}
  fill="none"
  stroke={color}
  stroke-width="2"
  stroke-linejoin="round"
>
  <!-- House outline -->
  <path d="M3 12l9-9 9 9" />
  <path d="M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7" />
  <path d="M10 21v-6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6" />
</svg>

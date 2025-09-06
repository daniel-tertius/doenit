<script>
  const { color: stroke = "currentColor", ...rest } = $props();
</script>

<svg
  {...rest}
  viewBox="0 0 24 24"
  fill="none"
  {stroke}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  style="width: 1em; height: 1em;"
>
  <path d="M21 7v6h-6" />
  <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
</svg>

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
  <rect x="3" y="3" width="7" height="7" />
  <rect x="14" y="3" width="7" height="7" />
  <rect x="3" y="14" width="7" height="7" />
  <rect x="14" y="14" width="7" height="7" />
</svg>

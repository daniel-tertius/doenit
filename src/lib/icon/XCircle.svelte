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
  <circle cx="12" cy="12" r="10"></circle>
  <line x1="15" y1="9" x2="9" y2="15"></line>
  <line x1="9" y1="9" x2="15" y2="15"></line>
</svg>

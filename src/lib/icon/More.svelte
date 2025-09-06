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
  <circle cx="12" cy="12" r="10" {stroke} fill="none"></circle>
  <circle cx="12" cy="12" r="1"></circle>
  <circle cx="17" cy="12" r="1"></circle>
  <circle cx="7" cy="12" r="1"></circle>
</svg>

<script>
  const { color: stroke = "currentColor", ...rest } = $props();
</script>

<svg {...rest} fill="none" viewBox="0 0 24 24" {stroke} style="width: 1em; height: 1em;">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
</svg>

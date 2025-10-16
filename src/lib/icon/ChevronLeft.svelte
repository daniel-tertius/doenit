<script>
  const { color: stroke = "currentColor", ...rest } = $props();
</script>

<svg {...rest} fill="none" {stroke} viewBox="0 0 20 20" style="width: 1em; height: 1em;">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.5 15L7.5 10L12.5 5" />
</svg>

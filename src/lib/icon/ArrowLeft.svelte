<script>
  let { size = 24, color: stroke = "currentColor", ...rest } = $props();
</script>

<svg {...rest} height={size} width={size} fill="none" {stroke} viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 8l4 4-4 4M3 12h18" />
</svg>

<script>
  const { color: fill = "currentColor", ...rest } = $props();
</script>

<svg {...rest} viewBox="0 0 24 24" {fill} style="width: 1em; height: 1em;">
  <circle cx="12" cy="12" r="10" fill="none" stroke={fill} stroke-width="2" />
  <path d="M12 16v-4m0-4h.01" stroke={fill} stroke-width="2" stroke-linecap="round" fill="none" />
</svg>

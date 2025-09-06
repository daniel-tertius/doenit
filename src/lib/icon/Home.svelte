<script>
  const { color: stroke = "currentColor", ...rest } = $props();
</script>

<svg
  {...rest}
  viewBox="0 0 24 24"
  fill="none"
  {stroke}
  stroke-width="2"
  stroke-linejoin="round"
  style="width: 1em; height: 1em;"
>
  <path d="M3 12l9-9 9 9" />
  <path d="M6 12v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7" />
  <path d="M10 21v-6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6" />
</svg>

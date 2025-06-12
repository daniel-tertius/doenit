<script>
  let { size = 24, color: stroke = "currentColor", ...rest } = $props();
</script>

<svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    {...rest}
>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
</svg>
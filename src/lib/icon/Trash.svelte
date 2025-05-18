<script>
  let { size = 24, color = "currentColor", ...rest } = $props();
</script>

<svg
    {...rest}
    class={rest.class}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
>
    <!-- Trash lid -->
    <path d="M3 6h18"></path>
    <!-- Lid handle -->
    <path d="M10 3h4"></path>
    <!-- Trash bin body with rounded bottom -->
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
    <!-- Trash lines/details -->
    <line x1="10" y1="10" x2="10" y2="18"></line>
    <line x1="14" y1="10" x2="14" y2="18"></line>
</svg>

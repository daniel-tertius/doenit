<script>
    let { size = 24, color = "currentColor", ...rest } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" {...rest}>
    <circle cx="12" cy="12" r="10" stroke={color} fill="none"></circle>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="17" cy="12" r="1"></circle>
    <circle cx="7" cy="12" r="1"></circle>
</svg>
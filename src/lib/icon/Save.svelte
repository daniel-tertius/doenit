<script>
  const { color: fill = "currentColor", ...rest } = $props();
</script>

<svg {...rest} {fill} viewBox="0 0 24 24" style="width: 1em; height: 1em;">
  <path
    d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3-10H5V5h10v4z"
  />
</svg>

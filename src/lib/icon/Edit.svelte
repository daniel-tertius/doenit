<script>
  const { color: stroke = "currentColor", ...rest } = $props();
</script>

<svg
  {...rest}
  fill="none"
  viewBox="0 0 24 24"
  {stroke}
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  style="width: 1em; height: 1em;"
>
  <path
    d="M16.862 3.487l3.65 3.65a1.5 1.5 0 010 2.121l-9.193 9.193a1 1 0 01-.502.27l-4 1a1 1 0 01-1.263-1.263l1-4a1 1 0 01.27-.502l9.193-9.193a1.5 1.5 0 012.121 0z"
  />
</svg>

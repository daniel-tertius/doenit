<script>
  let { size = 24, color = "#000", ...rest } = $props();
</script>

<div class={rest.class} style={rest.style}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="loading-spinner"
  >
    <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
    <path d="M12 2 A10 10 0 0 1 22 12" />
  </svg>
</div>

<style>
  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

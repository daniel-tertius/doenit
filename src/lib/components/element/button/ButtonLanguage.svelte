<script>
  let { selected = false, flagSrc, languageName, onclick } = $props();
</script>

<button
  class={{
    "flex items-center gap-2 h-12 px-2 py-2 rounded-lg border-2 transition-colors duration-200": true,
    "border-dark-500 dark:border-light-500 dark:bg-dark-700 bg-light-700": selected,
    "border-light-800 dark:border-dark-800 bg-light-100 dark:bg-dark-500": !selected,
  }}
  aria-pressed={selected}
  {onclick}
>
  <img src={flagSrc} alt="{languageName} flag" class="w-fit h-full object-cover rounded-sm" />
  <span
    class={{
      "text-t-secondary text-sm": true,
      "font-semibold": selected,
      "font-medium": !selected,
    }}
  >
    {languageName}
  </span>
</button>

<script>
  import "../app.css";
  import { SafeArea } from "capacitor-plugin-safe-area";
  import { onMount } from "svelte";

  let safeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };

  onMount(async () => {
    try {
      safeAreaInsets = (await SafeArea.getSafeAreaInsets()).insets;
      // Apply CSS variables to :root
      document.documentElement.style.setProperty('--safe-area-top', `${safeAreaInsets.top}px`);
      document.documentElement.style.setProperty('--safe-area-bottom', `${safeAreaInsets.bottom}px`);
      document.documentElement.style.setProperty('--safe-area-left', `${safeAreaInsets.left}px`);
      document.documentElement.style.setProperty('--safe-area-right', `${safeAreaInsets.right}px`);
    } catch (error) {
      console.error("Error getting safe area insets:", error);
    }
  });
</script>

<main
  class="min-h-screen flex"
  style="
  padding-top: var(--safe-area-top, 0px);
  padding-bottom: var(--safe-area-bottom, 0px);
  padding-left: var(--safe-area-left, 0px);
  padding-right: var(--safe-area-right, 0px);
"
>
  <div class="bg-[#325372] grow relative">
    <slot />
  </div>
</main>

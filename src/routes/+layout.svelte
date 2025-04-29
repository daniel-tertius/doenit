<script>
  import "../app.css";
  import { SafeArea } from "capacitor-plugin-safe-area";
  import { safeArea } from "$lib/SafeArea.svelte";
  import { onMount } from "svelte";

  onMount(async () => {
    try {
      const safeAreaInsets = (await SafeArea.getSafeAreaInsets()).insets;
      safeArea.top = safeAreaInsets.top;
      safeArea.bottom = safeAreaInsets.bottom;
      safeArea.left = safeAreaInsets.left;
      safeArea.right = safeAreaInsets.right;

      console.log("Safe area insets:", safeAreaInsets);
    } catch (error) {
      console.error("Error getting safe area insets:", error);
    }
  });
</script>

<main
  class="min-h-screen flex bg-[#223a51]"
  style="padding-top: {safeArea.top}px; padding-bottom: {safeArea.bottom}px; padding-left: {safeArea.left}px; padding-right: {safeArea.right}px;"
>
  <div class="bg-[#325372] grow relative max-w-[1000px] mx-auto pt-5 px-2">
    <slot />
  </div>
</main>

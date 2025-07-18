<script>
  import { Browser } from "@capacitor/browser";
  import { Haptics, ImpactStyle } from "@capacitor/haptics";
  import { App } from "@capacitor/app";
  import { fade } from "svelte/transition";
  import { onMount, onDestroy } from "svelte";

  // Payment URLs
  const kofiUrl = "https://ko-fi.com/tertius1";
  const buymeacoffeeUrl = "https://coff.ee/tertius";

  let show_thank_you = $state(false);
  let is_payment_initiated = $state(false);

  async function openPaymentLink(/** @type {string} */ url) {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await Browser.open({
        url: url,
        presentationStyle: "popover",
      });
    } catch (error) {
      // Fallback for web
      window.open(url, "_blank");
    }
  }

  async function handlePayment(/** @type {string} */ platform) {
    let url;
    switch (platform) {
      case "kofi":
        url = kofiUrl;
        break;
      case "buymeacoffee":
        url = buymeacoffeeUrl;
        break;
      default:
        return;
    }

    // Mark that payment was initiated
    is_payment_initiated = true;

    await openPaymentLink(url);
  }

  // Setup app state listeners
  onMount(() => {
    const handleAppStateChange = (state) => {
      // Show thank you message when user returns to app after payment
      if (state.isActive && is_payment_initiated) {
        show_thank_you = true;
        is_payment_initiated = false; // Reset the flag

        // Hide thank you message after 3 seconds
        setTimeout(() => {
          show_thank_you = false;
        }, 3000);
      }
    };

    // Add listener for app state changes
    App.addListener("appStateChange", handleAppStateChange);

    // Cleanup function
    return () => {
      App.removeAllListeners();
    };
  });

  onDestroy(() => {
    App.removeAllListeners();
  });
</script>

<div class="bg-t-primary rounded-lg p-4">
  <h2 class="font-semibold text-t-secondary mb-3">Ondersteuning</h2>

  <div class="space-y-3">
    <p class="text-sm text-t-secondary/80">Geniet jy Doenit? Ondersteun my deur om vir my 'n koffie te koop!</p>

    <div class="space-y-2">
      <button
        type="button"
        class="w-full p-3 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        onclick={() => handlePayment("buymeacoffee")}
      >
        <div class="w-5 h-5 bg-white rounded flex items-center justify-center">
          <span class="text-yellow-500 font-bold text-xs">☕</span>
        </div>
        Buy Me A Coffee
      </button>

      <button
        type="button"
        class="w-full p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm"
        onclick={() => handlePayment("kofi")}
      >
        <div class="w-5 h-5 bg-white rounded flex items-center justify-center">
          <span class="text-red-500 font-bold text-xs">K</span>
        </div>
        Ko-fi
      </button>
    </div>

    <div class="text-center text-sm text-t-secondary/60 space-y-2">
      <p>Ontwikkel met ❤️ vir die gemeenskap</p>
      <p>Elke druppel in die emmer help om nuwe funksies en verbeteringe aan te bring.</p>
    </div>
  </div>

  <!-- Thank you message -->
  {#if show_thank_you}
    <div transition:fade={{ duration: 300 }} class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-t-primary-400 p-6 rounded-lg border border-t-primary-600 max-w-sm mx-4 text-center">
        <div class="text-4xl mb-4">🎉</div>
        <h3 class="text-xl font-bold mb-2">Baie dankie!</h3>
        <p class="text-t-secondary/80">Jou ondersteuning beteken baie vir my!</p>
      </div>
    </div>
  {/if}
</div>

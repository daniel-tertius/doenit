<script>
  import { page } from "$app/state";
  import { Categories, Home, Check, Times } from "$lib/icon";
  import { fly } from "svelte/transition";

  let isReady = false;
  setTimeout(() => {
    isReady = true;
  }, 300);
  let { onclose } = $props();
</script>

<svelte:window
  onclick={(e) => {
    if (isReady) onclose();
  }}
/>

<aside transition:fly={{ x: -100 }} class="fixed top-0 left-0 w-64 h-full bg-[#476480] shadow-lg z-50">
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-2xl font-bold text-[#d6dde3]">Menu</h2>
    <ul class="mt-4 space-y-2 text-lg">
      <li>
        <a href="/" class="flex gap-1 text-[#d6dde3] hover:text-white">
          <Home />
          <p class:font-black={page.url.pathname === "/"}>Tuis</p>
        </a>
      </li>
      <li>
        <a href="/complete" class="flex gap-1 text-[#d6dde3] hover:text-white">
          <Check />
          <p class:font-black={page.url.pathname === "/complete"}>Voltooide Take</p>
        </a>
      </li>
      <li>
        <a href="/categories" class="flex gap-1 text-[#d6dde3] hover:text-white">
          <Categories />
          <p class:font-black={page.url.pathname === "/categories"}>Kategorieë</p>
        </a>
      </li>
    </ul>
  </div>
</aside>

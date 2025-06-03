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
    <h2 class="text-2xl font-bold text-[#d6dde3]">Kieslys</h2>
    <ul class="mt-4 space-y-2 text-lg">
      <li class:underline={page.url.pathname === "/"} class:font-black={page.url.pathname === "/"}>
        <a href="/" class="flex gap-1 text-[#d6dde3] hover:text-white">
          <Home />
          <p>Tuis</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/complete"} class:font-black={page.url.pathname === "/complete"}>
        <a href="/complete" class="flex gap-1 text-[#d6dde3] hover:text-white">
          <Check />
          <p>Voltooide Take</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/categories"} class:font-black={page.url.pathname === "/categories"}>
        <a href="/categories" class="flex gap-1 text-[#d6dde3] hover:text-white">
          <Categories />
          <p>Kategorieë</p>
        </a>
      </li>
    </ul>
  </div>
</aside>

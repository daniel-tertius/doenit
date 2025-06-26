<script>
  import { page } from "$app/state";
  import { Categories, Home, Check, Star, Settings } from "$lib/icon";
  import About from "$lib/icon/About.svelte";
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

<aside
  transition:fly={{ x: -100 }}
  class="fixed w-64 h-full bg-primary-10l shadow-lg z-50"
  style="top: env(safe-area-inset-top, 0px); left: env(safe-area-inset-left, 0px)"
>
  <div class="flex flex-col items-center justify-center h-full">
    <h2 class="text-2xl font-bold text-tertiary">Kieslys</h2>
    <ul class="mt-4 space-y-4 text-lg">
      <li class:underline={page.url.pathname === "/"} class:font-black={page.url.pathname === "/"}>
        <a href="/" class="flex gap-1 text-tertiary hover:text-tertiary">
          <Home class="text-tertiary" />
          <p>Tuis</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/complete"} class:font-black={page.url.pathname === "/complete"}>
        <a href="/complete" class="flex gap-1 text-tertiary hover:text-tertiary">
          <Check class="text-tertiary" />
          <p>Voltooide Take</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/categories"} class:font-black={page.url.pathname === "/categories"}>
        <a href="/categories" class="flex gap-1 text-tertiary hover:text-tertiary">
          <Categories class="text-tertiary" />
          <p>Kategorieë</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/new"} class:font-black={page.url.pathname === "/new"}>
        <a href="/new" class="flex gap-1 text-blue-400 hover:text-tertiary">
          <Star />
          <p>Nuut!</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/settings"} class:font-black={page.url.pathname === "/settings"}>
        <a href="/settings" class="flex gap-1 text-tertiary hover:text-tertiary">
          <Settings class="text-tertiary" />
          <p>Instellings</p>
        </a>
      </li>
      <li class:underline={page.url.pathname === "/about"} class:font-black={page.url.pathname === "/about"}>
        <a href="/about" class="flex gap-1 text-tertiary hover:text-tertiary">
          <About class="text-tertiary" />
          <p>Oor Doenit</p>
        </a>
      </li>
    </ul>
  </div>
</aside>

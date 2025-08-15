<script>
  import { ContainerDetails } from "$lib/components/element/container";
  import { DownChevron, Moon, Sun } from "$lib/icon";
  import { theme } from "$lib/services/Theme.svelte.js";

  let language = $state("af");

  const languages = [
    { value: "af", label: "Afrikaans" },
    { value: "en", label: "English" },
  ];
</script>

<ContainerDetails label="Voorkoms">
  <div>
    <label for="theme-select" class="block text-sm font-medium mb-2">Tema</label>
    <button
      class="relative flex h-12 w-full p-1 gap-2 rounded-lg dark:bg-dark-secondary bg-dark-300"
      onclick={() => theme.toggle()}
      aria-label="Toggle theme"
    >
      <div class="absolute z-2 top-3 left-1/4 -translate-x-1/2 text-dark-300 bg-transparent flex gap-2 items-center">
        <Sun size={24} variant={theme.value === "light" ? "filled" : "outline"} />
        <span class="text-sm font-medium">Ligte tema</span>
      </div>

      <div class="absolute z-2 top-3 right-1/4 translate-x-1/2 text-dark-secondary bg-transparent flex gap-2 items-center">
        <span class="text-sm font-medium">Donker tema</span>
        <Moon size={24} variant={theme.value === "dark" ? "filled" : "outline"} />
      </div>
      <div class="absolute inset-0 {theme.value === 'dark' ? 'translate-x-full' : 'translate-x-0'} w-1/2 h-full p-1">
        <div class="rounded-lg h-full z-1 w-full bg-dark-secondary dark:bg-dark-300"></div>
      </div>
    </button>
  </div>

  {#if false}
    <div>
      <label for="language-select" class="block text-sm font-medium mb-2">Taal</label>
      <div class="relative">
        <select
          id="language-select"
          disabled
          bind:value={language}
          class="bg-primary-20l p-2 w-full rounded-lg border border-dark-400 text-tertiary appearance-none"
        >
          {#each languages as lang}
            <option value={lang.value}>{lang.label}</option>
          {/each}
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <DownChevron class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-tertiary" size={18} />
        </div>
      </div>
    </div>
  {/if}
</ContainerDetails>

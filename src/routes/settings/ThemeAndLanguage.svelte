<script>
  import { ContainerDetails } from "$lib/components/element/container";
  import { DownChevron } from "$lib/icon";
  import { theme } from "$lib/services/Theme.svelte.js";

  let language = $state("af");

  const languages = [
    { value: "af", label: "Afrikaans" },
    { value: "en", label: "English" },
  ];

  const themes = [
    { value: "dark", label: "Donker" },
    { value: "light", label: "Lig" },
    { value: "auto", label: "Outomaties" },
  ];

  /**
   * @param {*} event
   */
  function handleThemeChange(event) {
    theme.value = event.target.value;
  }
</script>

<ContainerDetails label="Voorkoms">
  <div>
    <label for="theme-select" class="block text-sm font-medium mb-2">Tema</label>
    <div class="relative">
      <select
        id="theme-select"
        value={theme.value}
        onchange={handleThemeChange}
        class="focus:outline-none bg-t-primary-700 p-2 w-full rounded-lg border border-primary-600 text-tertiary appearance-none"
      >
        {#each themes as theme_option}
          <option value={theme_option.value}>{theme_option.label}</option>
        {/each}
      </select>

      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <DownChevron class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-tertiary" size={18} />
      </div>
    </div>
  </div>

  {#if false}
    <div>
      <label for="language-select" class="block text-sm font-medium mb-2">Taal</label>
      <div class="relative">
        <select
          id="language-select"
          disabled
          bind:value={language}
          class="bg-primary-20l p-2 w-full rounded-lg border border-primary-600 text-tertiary appearance-none"
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

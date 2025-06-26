<script>
  import { slide } from "svelte/transition";
  import { DownChevron } from "$lib/icon";

  // Settings state - you can connect these to actual storage later
  let theme = $state("dark");
  let language = $state("af");
  let notifications_enabled = $state(false);
  let daily_reminder_time = $state("09:00");
  let backup_enabled = $state(false);
  let show_completed_tasks = $state(true);
  let default_priority = $state("normal");

  // Expandable sections
  let show_appearance = $state(false);
  let show_notifications = $state(false);
  let show_backup = $state(false);
  let show_tasks = $state(false);

  /** @type {NodeJS.Timeout | number} */
  let time_timeout = 0;

  const themes = [
    { value: "dark", label: "Donker" },
    { value: "light", label: "Lig" },
    { value: "auto", label: "Outomaties" },
  ];

  const languages = [
    { value: "af", label: "Afrikaans" },
    { value: "en", label: "English" },
  ];

  const priorities = [
    { value: "normal", label: "Normaal" },
    { value: "important", label: "Belangrik" },
    { value: "urgent", label: "Dringend" },
  ];

  function handleReminderChange(event) {
    clearTimeout(time_timeout);
    time_timeout = setTimeout(() => {
      daily_reminder_time = event.target.value;
    }, 600);
  }
</script>

<div class="space-y-4 text-tertiary">
  <!-- Appearance Section -->
  <div class="bg-primary-20l rounded-lg">
    <button
      type="button"
      class="w-full p-4 flex items-center justify-between hover:bg-primary-10l rounded-lg transition-colors"
      onclick={() => (show_appearance = !show_appearance)}
    >
      <span class="font-semibold">Voorkoms</span>
      <DownChevron class="transition-transform duration-200 {show_appearance ? 'rotate-180' : ''}" size={20} />
    </button>

    {#if show_appearance}
      <div transition:slide class="px-4 pb-4 space-y-3">
        <div>
          <label class="block text-sm font-medium mb-2">Tema</label>
          <select bind:value={theme} class="bg-primary-20l p-2 w-full rounded-lg border border-primary text-tertiary">
            {#each themes as theme_option}
              <option value={theme_option.value}>{theme_option.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Taal</label>
          <select
            bind:value={language}
            class="bg-primary-20l p-2 w-full rounded-lg border border-primary text-tertiary"
          >
            {#each languages as lang}
              <option value={lang.value}>{lang.label}</option>
            {/each}
          </select>
        </div>
      </div>
    {/if}
  </div>

  <!-- Notifications Section -->
  <div class="bg-primary-20l rounded-lg">
    <button
      type="button"
      class="w-full p-4 flex items-center justify-between hover:bg-primary-10l rounded-lg transition-colors"
      onclick={() => (show_notifications = !show_notifications)}
    >
      <span class="font-semibold">Kennisgewings</span>
      <DownChevron class="transition-transform duration-200 {show_notifications ? 'rotate-180' : ''}" size={20} />
    </button>

    {#if show_notifications}
      <div transition:slide class="px-4 pb-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Herhinneringe</span>
          <button
            type="button"
            aria-label="Toggle Notifications"
            class="relative w-11 h-6 rounded-full transition-colors {notifications_enabled
              ? 'bg-blue-600'
              : 'bg-primary-30l'}"
            onclick={() => (notifications_enabled = !notifications_enabled)}
          >
            <div
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform {notifications_enabled
                ? 'translate-x-5'
                : 'translate-x-0.5'}"
            ></div>
          </button>
        </div>

        {#if notifications_enabled}
          <div transition:slide>
            <label for="daily_reminder_time" class="block text-sm font-medium mb-2">Herinnerings tyd</label>
            <input
              id="daily_reminder_time"
              type="time"
              bind:value={daily_reminder_time}
              class="bg-primary-20l p-2 w-full rounded-lg border border-primary text-tertiary"
              onchange={handleReminderChange}
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Backup Section -->
  <!-- <div class="bg-primary-20l rounded-lg">
    <button
      type="button"
      class="w-full p-4 flex items-center justify-between hover:bg-primary-10l rounded-lg transition-colors"
      onclick={() => (show_backup = !show_backup)}
    >
      <span class="font-semibold">Rugsteun</span>
      <DownChevron class="transition-transform duration-200 {show_backup ? 'rotate-180' : ''}" size={20} />
    </button>

    {#if show_backup}
      <div transition:slide class="px-4 pb-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Outomatiese rugsteun</span>
          <button
            type="button"
            aria-label="Toggle Backup"
            class="relative w-11 h-6 rounded-full transition-colors {backup_enabled ? 'bg-blue-600' : 'bg-primary-30l'}"
            onclick={() => (backup_enabled = !backup_enabled)}
          >
            <div
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform {backup_enabled
                ? 'translate-x-5'
                : 'translate-x-0.5'}"
            ></div>
          </button>
        </div>

        <button type="button" class="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Rugsteun nou
        </button>

        <button
          type="button"
          class="w-full p-3 bg-primary-30l text-tertiary rounded-lg hover:bg-primary-20l transition-colors"
        >
          Herstel vanaf rugsteun
        </button>
      </div>
    {/if}
  </div> -->

  <!-- Tasks Section -->
  <!-- <div class="bg-primary-20l rounded-lg">
    <button
      type="button"
      class="w-full p-4 flex items-center justify-between hover:bg-primary-10l rounded-lg transition-colors"
      onclick={() => (show_tasks = !show_tasks)}
    >
      <span class="font-semibold">Take</span>
      <DownChevron class="transition-transform duration-200 {show_tasks ? 'rotate-180' : ''}" size={20} />
    </button>

    {#if show_tasks}
      <div transition:slide class="px-4 pb-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Wys voltooide take</span>
          <button
            type="button"
            aria-label="Toggle Completed Tasks"
            class="relative w-11 h-6 rounded-full transition-colors {show_completed_tasks
              ? 'bg-blue-600'
              : 'bg-primary-30l'}"
            onclick={() => (show_completed_tasks = !show_completed_tasks)}
          >
            <div
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform {show_completed_tasks
                ? 'translate-x-5'
                : 'translate-x-0.5'}"
            ></div>
          </button>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Verstek prioriteit</label>
          <select
            bind:value={default_priority}
            class="bg-primary-20l p-2 w-full rounded-lg border border-primary text-tertiary"
          >
            {#each priorities as priority}
              <option value={priority.value}>{priority.label}</option>
            {/each}
          </select>
        </div>
      </div>
    {/if}
  </div> -->

  <!-- About Section -->
  <div class="bg-primary-20l rounded-lg">
    <div class="p-4">
      <h3 class="font-semibold mb-2">Oor Doenit</h3>
      <p class="text-sm text-tertiary-20d mb-2">Weergawe 1.0.0</p>
      <p class="text-sm text-tertiary-20d">
        'n Eenvoudige en doeltreffende taaklys toepassing wat jou help om georganiseerd te bly.
      </p>
    </div>
  </div>

  <!-- Support Section -->
  <div class="bg-primary-20l rounded-lg">
    <div class="p-4">
      <h3 class="font-semibold mb-2">Ondersteuning</h3>
      <a href="mailto:support.tricky800@passmail.com" class="text-blue-500 hover:text-blue-700 underline text-sm">
        support.tricky800@passmail.com
      </a>
    </div>
  </div>
</div>

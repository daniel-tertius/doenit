<script>
  import { slide } from "svelte/transition";
  import CalendarMonth from "./CalendarMonth.svelte";
  import ChevronLeft from "$lib/icon/ChevronLeft.svelte";
  import ChevronRight from "$lib/icon/ChevronRight.svelte";
  import DownChevron from "$lib/icon/DownChevron.svelte";

  /**
   * @typedef {Object} CalendarProps
   * @property {Date | null} startDate - Initial/controlled start date
   * @property {Date | null} endDate - Initial/controlled end date
   * @property {string} locale - Locale for formatting (default: 'en-US')
   * @property {number} weekStartsOn - 0 for Sunday, 1 for Monday (default: 1)
   * @property {Function} ondateselected - Callback when dates are selected: ({ start_date, end_date }) => void
   */

  let {
    startDate = $bindable(null),
    endDate = $bindable(null),
    locale = "af-ZA",
    weekStartsOn = 1,
    ondateselected = null,
  } = $props();

  // Current month being viewed
  let currentMonth = $state(new Date());
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  // Internal selection state
  let internalStartDate = $state(startDate);
  let internalEndDate = $state(endDate);

  // Sync with props
  $effect(() => {
    internalStartDate = startDate;
    internalEndDate = endDate;
  });

  // Month/year navigation state
  let isYearPickerOpen = $state(false);
  let is_month_picker_open = $state(false);

  const monthNames = $derived.by(() => {
    const names = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2025, i, 1);
      names.push(date.toLocaleDateString(locale, { month: "long" }));
    }
    return names;
  });

  const currentMonthName = $derived(currentMonth.toLocaleDateString(locale, { month: "long", year: "numeric" }));

  function previousMonth() {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    currentMonth = newMonth;
  }

  function nextMonth() {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    currentMonth = newMonth;
  }

  function goToToday() {
    currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
  }

  function selectMonth(monthIndex) {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(monthIndex);
    currentMonth = newMonth;
    is_month_picker_open = false;
  }

  function selectYear(year) {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    currentMonth = newMonth;
    isYearPickerOpen = false;
  }

  function handleDayClick(date) {
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    // Date range selection logic
    if (!internalStartDate || (internalStartDate && internalEndDate)) {
      // Start new selection
      internalStartDate = clickedDate;
      internalEndDate = null;
    } else if (internalStartDate && !internalEndDate) {
      // Complete the range
      if (clickedDate < internalStartDate) {
        // Clicked date is before start, swap them
        internalEndDate = internalStartDate;
        internalStartDate = clickedDate;
      } else if (clickedDate.getTime() === internalStartDate.getTime()) {
        // Clicked same date, keep only start date
        internalEndDate = null;
      } else {
        // Clicked date is after start
        internalEndDate = clickedDate;
      }
    }

    // Update bindable props
    startDate = internalStartDate;
    endDate = internalEndDate;

    // Emit event
    if (ondateselected) {
      ondateselected({
        start_date: internalStartDate,
        end_date: internalEndDate,
      });
    }
  }

  // Generate year range for year picker
  const yearRange = $derived.by(() => {
    const currentYear = currentMonth.getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  });
</script>

<div class="w-full bg-surface rounded-lg p-4">
  <div class="flex items-center justify-between mb-4 gap-2">
    <button
      class="cursor-pointer p-2 rounded flex items-center justify-center text-muted"
      onclick={previousMonth}
      type="button"
      aria-label="Previous month"
    >
      <ChevronLeft class="w-5 h-5" />
    </button>

    <div class="flex items-center gap-2 flex-1 justify-center">
      <button
        class="cursor-pointer px-3 py-2 rounded-lg text-base font-semibold flex items-center gap-2"
        onclick={() => (is_month_picker_open = !is_month_picker_open)}
        type="button"
      >
        {currentMonthName}
        <DownChevron class="w-4 h-4 {is_month_picker_open ? 'rotate-180' : ''}" />
      </button>

      <button
        class="bg-card border border-default cursor-pointer px-3 py-1.5 rounded-lg text-sm"
        onclick={goToToday}
        type="button"
      >
        Today
      </button>
    </div>

    <button
      class="border-none cursor-pointer p-2 rounded-lg flex items-center justify-center text-muted"
      onclick={nextMonth}
      type="button"
      aria-label="Next month"
    >
      <ChevronRight class="w-5 h-5" />
    </button>
  </div>

  {#if is_month_picker_open}
    <div class="mb-4 border border-default rounded-md p-3 bg-page" transition:slide={{ duration: 200 }}>
      <div class="grid grid-cols-3 gap-2 mb-2">
        {#each monthNames as month, index}
          <button
            class="bg-surface border border-default cursor-pointer p-2 rounded text-sm transition-all duration-150 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400"
            class:bg-blue-600={currentMonth.getMonth() === index}
            class:text-white={currentMonth.getMonth() === index}
            class:border-blue-600={currentMonth.getMonth() === index}
            onclick={() => selectMonth(index)}
            type="button"
          >
            {month}
          </button>
        {/each}
      </div>
      <div class="flex justify-center">
        <button
          class="bg-white border border-gray-200 cursor-pointer p-2 rounded text-sm transition-all duration-150 flex items-center justify-center gap-1 hover:bg-gray-100 hover:border-gray-400"
          onclick={() => {
            isYearPickerOpen = !isYearPickerOpen;
          }}
          type="button"
        >
          {currentMonth.getFullYear()}
          <DownChevron class="w-4 h-4 transition-transform duration-200 {isYearPickerOpen ? 'rotate-180' : ''}" />
        </button>
      </div>
      {#if isYearPickerOpen}
        <div class="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto mt-2">
          {#each yearRange as year}
            <button
              class="bg-white border border-gray-200 cursor-pointer p-2 rounded text-sm transition-all duration-150 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400"
              class:bg-blue-600={currentMonth.getFullYear() === year}
              class:text-white={currentMonth.getFullYear() === year}
              class:border-blue-600={currentMonth.getFullYear() === year}
              onclick={() => selectYear(year)}
              type="button"
            >
              {year}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <div>
    <CalendarMonth
      {currentMonth}
      startDate={internalStartDate}
      endDate={internalEndDate}
      {locale}
      {weekStartsOn}
      ondayclick={handleDayClick}
    />
  </div>
</div>

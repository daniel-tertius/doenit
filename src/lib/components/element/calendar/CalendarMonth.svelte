<script>
  import CalendarDay from "./CalendarDay.svelte";

  /**
   * @typedef {Object} CalendarMonthProps
   * @property {Date} currentMonth - The month to display
   * @property {Date | null} startDate - Selected start date
   * @property {Date | null} endDate - Selected end date
   * @property {string} locale - Locale for day/month names
   * @property {number} weekStartsOn - 0 for Sunday, 1 for Monday
   * @property {Function} ondayclick - Handler when a day is clicked
   */

  let {
    currentMonth,
    startDate = null,
    endDate = null,
    locale = "af-ZA",
    weekStartsOn = 1,
    ondayclick = () => {},
  } = $props();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate day headers based on locale and week start
  const dayHeaders = $derived.by(() => {
    const headers = [];
    const baseDate = new Date(2025, 0, weekStartsOn === 0 ? 4 : 5); // Jan 4/5, 2025 is a Sat/Sun

    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      headers.push(date.toLocaleDateString(locale, { weekday: "short" }));
    }
    return headers;
  });

  // Generate calendar days
  const calendarDays = $derived.by(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    let firstDayOfWeek = firstDay.getDay();

    // Adjust for week start day
    if (weekStartsOn === 1) {
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    }

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0);
    const daysFromPrevMonth = firstDayOfWeek;

    const days = [];

    // Add previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
      days.push({ date, isOtherMonth: true });
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isOtherMonth: false });
    }

    // Add next month days to complete the grid (6 weeks max)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isOtherMonth: true });
    }

    return days;
  });

  function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  function isDateInRange(date, start, end) {
    if (!start || !end) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    const e = new Date(end);
    e.setHours(0, 0, 0, 0);
    return d > s && d < e;
  }
</script>

<div class="w-full">
  <div class="grid grid-cols-7 gap-1 mb-2">
    {#each dayHeaders as dayName}
      <div class="text-center text-xs font-semibold p-2 uppercase">{dayName}</div>
    {/each}
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each calendarDays as { date, isOtherMonth }}
      <CalendarDay
        {date}
        is_today={isSameDay(date, today)}
        is_other_month={isOtherMonth}
        is_selected={isSameDay(date, startDate) || isSameDay(date, endDate)}
        is_in_range={isDateInRange(date, startDate, endDate)}
        is_range_start={isSameDay(date, startDate)}
        is_range_end={isSameDay(date, endDate)}
        onclick={ondayclick}
      />
    {/each}
  </div>
</div>

import { t, language } from "./services/language.svelte";

export const AFRIKAANS = Symbol("af");
export const ENGLISH = Symbol("en");

export const DEFAULT_HEX_COLOR = "#242729";

/**
 * Get the current locale for date formatting
 * @returns {string} The locale string (e.g., "af-ZA" or "en-US")
 */
function getCurrentLocale() {
  return language.value === "af" ? "af-ZA" : "en-US";
}

/**
 * @param {Object} a0
 * @param {string | Date | number | null} a0.due_date
 * @param {string | Date | number | null} [a0.start_date]
 */
export function displayDate({ due_date, start_date }) {
  if (!due_date) return "";

  if (!start_date) {
    return new Date(due_date).toLocaleDateString(getCurrentLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const startDate = new Date(new Date(start_date).setHours(0, 0, 0, 0));
  const dueDate = new Date(new Date(due_date).setHours(0, 0, 0, 0));

  const startYear = startDate.getFullYear();
  const dueYear = dueDate.getFullYear();
  const startMonth = startDate.getMonth();
  const dueMonth = dueDate.getMonth();

  // Same date
  if (+startDate === +dueDate) {
    return startDate.toLocaleDateString(getCurrentLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Same year and month
  if (startYear === dueYear && startMonth === dueMonth) {
    return `${startDate.getDate()}-${dueDate.getDate()} ${startDate.toLocaleDateString(getCurrentLocale(), {
      month: "short",
      year: "numeric",
    })}`;
  }

  // Same year, different month
  if (startYear === dueYear) {
    const startStr = startDate.toLocaleDateString(getCurrentLocale(), { month: "short", day: "numeric" });
    const dueStr = dueDate.toLocaleDateString(getCurrentLocale(), { month: "short", day: "numeric", year: "numeric" });
    return `${startStr} - ${dueStr}`;
  }

  // Different years
  const startStr = startDate.toLocaleDateString(getCurrentLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const dueStr = dueDate.toLocaleDateString(getCurrentLocale(), { year: "numeric", month: "short", day: "numeric" });
  return `${startStr} - ${dueStr}`;
}

/**
 *
 * @param {Date | number | string | undefined | null} date
 * @returns {boolean}
 */
export function isTimeAtMidnightUTC(date) {
  return date?.length !== 16;
}

/**
 * @param {{ start: string | Date | null, end: string | Date | null}} param0 - In format of YYYY-MM-DD or YYYY-MM-DD HH:mm
 * @returns
 */
export function displayDateRange({ start, end }) {
  if (!start) {
    return end ? displayDate({ due_date: end }) : "";
  }

  if (!end) {
    return `${displayDate({ due_date: start })} – ${t("forever")}`;
  }

  if (start instanceof Date) {
    start = start.toLocaleString(getCurrentLocale()).substring(0, 16);
  }

  if (end instanceof Date) {
    end = end.toLocaleString(getCurrentLocale()).substring(0, 16);
  }

  const [start_date] = start.split(" ");
  const [start_year, start_month, start_day] = start_date.split("-");
  const [end_date] = end.split(" ");
  const [end_year, end_month, end_day] = end_date.split("-");

  if (start_year === end_year && start_month === end_month && start_day === end_day) {
    const dateStr = new Date(start_date).toLocaleDateString(getCurrentLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    return dateStr;
  }

  if (start_year === end_year && start_month === end_month) {
    const monthYear = new Date(start_date).toLocaleDateString(getCurrentLocale(), {
      month: "short",
      year: "numeric",
    });
    return `${start_day} – ${end_day} ${monthYear}`;
  }

  if (start_year === end_year) {
    const startStr = new Date(start_date).toLocaleDateString(getCurrentLocale(), { month: "short", day: "numeric" });
    const endStr = new Date(end_date).toLocaleDateString(getCurrentLocale(), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  }
}

/**
 * @param {Object} a0
 * @param {string | Date | number | null} a0.due_date
 * @param {string | Date | number | null} [a0.start_date]
 */
export function displayDateTime({ due_date, start_date }) {
  if (!due_date) return "";

  if (!start_date) {
    const date = new Date(due_date);
    const dateStr = date.toLocaleDateString(getCurrentLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (isTimeAtMidnightUTC(due_date)) {
      return dateStr;
    }

    const timeStr = date.toLocaleTimeString(getCurrentLocale(), {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} ${timeStr}`;
  }

  const startDate = new Date(start_date);
  const dueDate = new Date(due_date);

  const startDateOnly = new Date(new Date(start_date).setHours(0, 0, 0, 0));
  const dueDateOnly = new Date(new Date(due_date).setHours(0, 0, 0, 0));

  const startYear = startDateOnly.getFullYear();
  const dueYear = dueDateOnly.getFullYear();
  const startMonth = startDateOnly.getMonth();
  const dueMonth = dueDateOnly.getMonth();

  const startTime = isTimeAtMidnightUTC(start_date)
    ? ""
    : startDate.toLocaleTimeString(getCurrentLocale(), { hour: "2-digit", minute: "2-digit" });
  const dueTime = isTimeAtMidnightUTC(due_date)
    ? ""
    : dueDate.toLocaleTimeString(getCurrentLocale(), { hour: "2-digit", minute: "2-digit" });

  // Same date
  if (+startDateOnly === +dueDateOnly) {
    const dateStr = startDateOnly.toLocaleDateString(getCurrentLocale(), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (!startTime && !dueTime) {
      return dateStr;
    } else if (!startTime || startTime === dueTime) {
      return `${dateStr} ${dueTime}`;
    } else {
      return `${dateStr} ${startTime} - ${dueTime || "00:00"}`;
    }
  }

  // Same year and month
  if (startYear === dueYear && startMonth === dueMonth) {
    const monthYear = startDateOnly.toLocaleDateString(getCurrentLocale(), {
      month: "short",
      year: "numeric",
    });
    return `${startDateOnly.getDate()}${startTime ? " " + startTime : ""} - ${dueDateOnly.getDate()}${
      dueTime ? " " + dueTime : ""
    } ${monthYear}`;
  }

  // Same year, different month
  if (startYear === dueYear) {
    const startStr = startDateOnly.toLocaleDateString(getCurrentLocale(), { month: "short", day: "numeric" });
    const dueStr = dueDateOnly.toLocaleDateString(getCurrentLocale(), {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr}${startTime ? " " + startTime : ""} - ${dueStr}${dueTime ? " " + dueTime : ""}`;
  }

  // Different years
  const startStr = startDateOnly.toLocaleDateString(getCurrentLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const dueStr = dueDateOnly.toLocaleDateString(getCurrentLocale(), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${startStr}${startTime ? " " + startTime : ""} - ${dueStr}${dueTime ? " " + dueTime : ""}`;
}

export function displayDateShort(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString(getCurrentLocale(), {
    month: "short",
    day: "numeric",
  });
}

/**
 * @param {number | Date | string} date
 */
export function formatDate(date) {
  if (!date) return 0;

  return new Date(date).toLocaleDateString("en-CA");
}

/**
 * @param {number | Date | string | null} date
 * @returns {string}
 */
export function displayPrettyDate(date) {
  if (!date) return t("no_date");

  // Check if the date is in the past
  const date_obj = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (date_obj < now) return t("past");

  date = formatDate(date);
  const today = formatDate(new Date());
  if (date === today) return t("today");

  const tomorrow = formatDate(Date.now() + 86400000);
  if (date === tomorrow) return t("tomorrow");

  const day_after_tomorrow = formatDate(Date.now() + 2 * 86400000);
  if (date === day_after_tomorrow) return t("day_after_tomorrow");

  const this_week_start = new Date();
  this_week_start.setDate(this_week_start.getDate() - this_week_start.getDay());
  const this_week_end = new Date(this_week_start);
  this_week_end.setDate(this_week_end.getDate() + 6);

  const inputDate = new Date(date);
  if (inputDate >= this_week_start && inputDate <= this_week_end) {
    return t("this_week");
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const inputMonth = inputDate.getMonth();
  const inputYear = inputDate.getFullYear();

  if (inputMonth === currentMonth && inputYear === currentYear) {
    return t("this_month");
  }

  const nextMonth = (currentMonth + 1) % 12;
  const nextMonthYear = nextMonth === 0 ? currentYear + 1 : currentYear;

  if (inputMonth === nextMonth && inputYear === nextMonthYear) {
    return t("next_month");
  }

  return t("later");
}

/**
 * Sorts an array of objects by a specified field name.
 *
 * @template T extends Object
 * @param {Array<T>} array - The array of objects to be sorted.
 * @param {keyof T} field_name - The name of the field to sort by.
 * @param {('asc'|'desc')} [order='asc'] - The order of sorting: 'asc' for ascending, 'desc' for descending.
 * @returns {T[]} - The sorted array.
 *
 * @example
 * const data = [
 *   { name: 'John', age: 25 },
 *   { name: 'Jane', age: 22 },
 *   { name: 'Bob', age: 30 }
 * ];
 *
 * const sortedByName = sortByField(data, 'name');
 * // sortedByName = [{ name: 'Bob', age: 30 }, { name: 'Jane', age: 22 }, { name: 'John', age: 25 }]
 *
 * const sortedByAgeDesc = sortByField(data, 'age', 'desc');
 * // sortedByAgeDesc = [{ name: 'Bob', age: 30 }, { name: 'John', age: 25 }, { name: 'Jane', age: 22 }]
 */
export function sortByField(array, field_name, order = "asc") {
  const is_asc = order === "asc";

  return array.sort((a, b) => {
    if (typeof a[field_name] === "number" && typeof b[field_name] === "number") {
      return is_asc ? a[field_name] - b[field_name] : b[field_name] - a[field_name];
    } else {
      const a_str = String(a[field_name] ?? "");
      const b_str = String(b[field_name] ?? "");

      return is_asc ? a_str.localeCompare(b_str) : b_str.localeCompare(a_str);
    }
  });
}

/**
 * Wait at minimum of a specified amount of time after the given promise is given.
 * @param {number} ms - The minimum time to wait in milliseconds.
 * @param {() => Promise<any>} promise - The promise to wait for.
 * @returns {Promise<void>} - A promise that resolves after the specified time.
 */
export function waitAtLeast(promise, ms) {
  return new Promise((resolve) => {
    const start = Date.now();
    promise().then(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, ms - elapsed);
      setTimeout(resolve, remaining);
    });
  });
}

/**
 * @param {Task[]} data
 */
export function sortTasksByDueDate(data) {
  if (!data?.length) return [];

  let past_tasks = [];
  let today_tasks = [];
  let tomorrow_tasks = [];
  let day_after_tomorrow_tasks = [];
  let this_week_tasks = [];
  let this_month_tasks = [];
  let next_month_tasks = [];
  let later_tasks = [];
  let no_date = [];

  const today = new Date().setHours(0, 0, 0, 0);
  const tomorrow = new Date(today).setDate(new Date(today).getDate() + 1);
  const day_after_tomorrow = new Date(today).setDate(new Date(today).getDate() + 2);
  const this_week_start = new Date();
  this_week_start.setDate(this_week_start.getDate() - this_week_start.getDay());
  const this_week_end = new Date(this_week_start);
  this_week_end.setDate(this_week_end.getDate() + 6);

  const current_month = new Date().getMonth();
  const current_year = new Date().getFullYear();

  const next_month = (current_month + 1) % 12;
  const next_month_year = next_month === 0 ? current_year + 1 : current_year;

  data = sortByField(data, "name", "asc");
  for (const task of data) {
    if (!task.due_date) {
      no_date.push(task);
      continue;
    }

    const due_date = new Date(new Date(task.due_date).setHours(0, 0, 0, 0));
    if (+due_date < today) {
      past_tasks.push(task);
    } else if (+due_date === today) {
      today_tasks.push(task);
    } else if (+due_date === tomorrow) {
      tomorrow_tasks.push(task);
    } else if (+due_date === day_after_tomorrow) {
      day_after_tomorrow_tasks.push(task);
    } else if (due_date >= this_week_start && due_date <= this_week_end) {
      this_week_tasks.push(task);
    } else if (due_date.getMonth() === current_month && due_date.getFullYear() === current_year) {
      this_month_tasks.push(task);
    } else if (due_date.getMonth() === next_month && due_date.getFullYear() === next_month_year) {
      next_month_tasks.push(task);
    } else {
      later_tasks.push(task);
    }
  }

  const with_date = [
    ...sortTasksByPriority(sortByField(past_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(today_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(tomorrow_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(day_after_tomorrow_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(this_week_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(this_month_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(next_month_tasks, "due_date", "asc")),
    ...sortTasksByPriority(sortByField(later_tasks, "due_date", "asc")),
  ];

  return [...with_date, ...sortTasksByPriority(no_date)];
}

/**
 *
 * @param {Task[]} data
 * @returns {Task[]}
 */
function sortTasksByPriority(data) {
  // Sort by Urgent and Important first, then Important, then Urgent
  const urgent_important = [];
  const important_only = [];
  const urgent_only = [];
  const neither = [];

  for (const task_no_date of data) {
    if (task_no_date.urgent && task_no_date.important) {
      urgent_important.push(task_no_date);
    } else if (task_no_date.important) {
      important_only.push(task_no_date);
    } else if (task_no_date.urgent) {
      urgent_only.push(task_no_date);
    } else {
      neither.push(task_no_date);
    }
  }

  return [...urgent_important, ...important_only, ...urgent_only, ...neither];
}

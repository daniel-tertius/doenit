import { page } from "$app/state";
import { sortByField } from "$lib";
import { selectedCategories } from "$lib/cached";
import { DB } from "$lib/DB/DB";
import { SvelteSet } from "svelte/reactivity";

const DEFAULT_NAME = "Standaard";

/** @typedef {import('$lib/DB/DB').Task} Task */
/** @typedef {import('$lib/DB/DB').Category} Category */

export class Data {
  /** @type {Record<string, (arg0: { date: Date, num?: number, specific_days?: number[]}) => number>} */
  #REPEAT_INTERVALS = {
    daily: ({ date, num = 1 }) => date.setDate(date.getDate() + 1 * num),
    workdaily: ({ date }) => {
      const new_date = new Date(date);

      const day_of_week = new_date.getDay();
      if (day_of_week === 5) return date.setDate(date.getDate() + 3);
      if (day_of_week === 6) return date.setDate(date.getDate() + 2);

      return date.setDate(date.getDate() + 1);
    },
    weekly: ({ date, num = 1 }) => date.setDate(date.getDate() + 7 * num),
    weekly_custom_days: ({ date, specific_days = [] }) => {
      if (!specific_days.length) return date.setDate(date.getDate() + 7);

      const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

      let daysToAdd = 7; // Default to next week if no day found this week

      for (let i = 1; i <= 7; i++) {
        const checkDay = (currentDay + i) % 7; // Stay between 0 and 6.

        if (specific_days.includes(checkDay)) {
          daysToAdd = i;
          break;
        }
      }

      return date.setDate(date.getDate() + daysToAdd);
    },
    monthly: ({ date, num = 1 }) => date.setMonth(date.getMonth() + 1 * num),
    yearly: ({ date, num = 1 }) => date.setFullYear(date.getFullYear() + 1 * num),
  };

  filter = $state({
    important: false,
    urgent: false,
    completed: false,
    categories: new SvelteSet(),
  });

  #DB = DB.getInstance();

  /** @type {Set<string>} */
  #selected_categories_hash = $state(new SvelteSet());
  /** @type {Task[]} */
  #tasks = $state([]);
  /** @type {Task[]} */
  #all_tasks = $state([]);

  /** @type {Category[]} */
  #categories = $state([]);

  /** @type {Set<string>} */
  selected_tasks_hash = $state(new SvelteSet());

  /** @type {Task | null} */
  #just_completed_task = $state(null);

  constructor() {
    this.init();
  }

  async init() {
    const is_home = page.url.pathname === "/";

    const selected_categories_hash = await selectedCategories.get();
    if (selected_categories_hash) {
      this.#selected_categories_hash = new SvelteSet(selected_categories_hash);
    }

    this.#all_tasks = await this.#DB.Task.data;
    this.#tasks = this.#all_tasks.filter(({ archived }) => !!archived === !is_home);

    const category_data = await this.#DB.Category.data;
    this.#categories = category_data.filter(({ archived }) => !archived);
  }

  get all_tasks() {
    return this.#all_tasks;
  }

  set all_tasks(value) {
    this.#all_tasks = value;
  }

  get tasks() {
    return this.#sortByDueDate(this.#tasks);
  }

  get completed_tasks() {
    let tasks = this.#all_tasks.filter(({ completed }) => completed);
    tasks = sortByField(tasks, "name", "asc");
    tasks = sortByField(tasks, "completed_at", "desc");
    return tasks;
  }

  /**
   * @param {Task[]} value
   */
  set tasks(value) {
    this.#tasks = value;
  }

  get selected_categories_hash() {
    return this.#selected_categories_hash;
  }

  /**
   * @param {Task[]} tasks
   * @returns {Task[]}
   */
  filterTasksByPriority(tasks) {
    if (this.filter.important && !this.filter.urgent) {
      return tasks.filter(({ important }) => important);
    } else if (!this.filter.important && this.filter.urgent) {
      return tasks.filter(({ urgent }) => urgent);
    } else if (this.filter.important && this.filter.urgent) {
      return tasks.filter(({ important, urgent }) => important && urgent);
    }
    return tasks;
  }

  /**
   * @param {Task[]} tasks
   * @returns {Task[]}
   */
  filterTasksByCategory(tasks) {
    if (!this.#selected_categories_hash.size) {
      return tasks.filter(({ archived }) => archived == (page.url.pathname !== "/"));
    }

    const default_cat_id = this.categories.find(({ name }) => name === DEFAULT_NAME)?.id ?? "";

    if (page.url.pathname === "/complete") {
      return tasks.filter(({ archived }) => !!archived);
    }

    return tasks.filter(({ category_id = "", archived }) => {
      if (!category_id && this.#selected_categories_hash.has(default_cat_id)) {
        return !archived;
      }

      return this.#selected_categories_hash.has(category_id) && !archived;
    });
  }

  get categories() {
    return this.#categories;
  }

  set categories(value) {
    value = this.#categories;
  }

  /**
   * @param {Task | null} value
   */
  set just_completed_task(value) {
    this.#just_completed_task = value;
    setTimeout(() => {
      if (!this.#just_completed_task || !value) return;
      if (value.id !== this.#just_completed_task.id) return;
      this.#just_completed_task = null;
    }, 3000);
  }

  async refreshTasks() {
    this.all_tasks = await this.#DB.Task.data;

    const { id } = this.categories.find(({ name }) => name === DEFAULT_NAME) ?? { id: "" };

    switch (page.url.pathname) {
      case "/complete":
        this.#tasks = this.#all_tasks.filter(({ completed }) => !!completed);
        break;
      case "/":
        this.#tasks = this.#all_tasks.filter(({ archived, category_id = "" }) => {
          if (!this.selected_categories_hash.size) return !archived;
          if (!category_id && this.selected_categories_hash.has(id)) {
            return !archived;
          }

          return !archived && this.selected_categories_hash.has(category_id);
        });
        break;
      default:
        this.#tasks = this.#all_tasks;
        break;
    }

    return this.tasks;
  }

  /**
   *
   * @returns {Promise<Category[]>}
   */
  async refreshCategories() {
    const all_categories = await this.#DB.Category.readAll();
    this.categories = Object.values(all_categories).filter(({ archived }) => !archived);

    let default_category = this.categories.find(({ name }) => name === DEFAULT_NAME);
    if (!default_category) {
      const category = await this.#DB.Category.create({ name: DEFAULT_NAME });

      this.categories = sortByField([category, ...this.categories], "name");
      return this.categories;
    }

    sortByField(this.categories, "name");
    return this.categories;
  }

  /**
   * @param {Task} task
   */
  async completeTask(task) {
    if (!task) return;

    // If a task is being completed, wait for the animation to finish
    await new Promise((resolve) => setTimeout(resolve, 600));
    this.#removeTask(task);

    const is_repeat_task = task.repeat_interval && task.due_date;
    if (is_repeat_task) {
      task.completed++;
      task.due_date = this.#getNextDueDate(task);
      task.start_date = this.#getNextStartDate(task);
      let new_task = await this.#DB.Task.update(task.id, task);
      this.#addTask(new_task);
      return;
    }

    task.completed = 1;
    task.archived = true;
    task.completed_at = new Date().toLocaleString("af-ZA");

    this.just_completed_task = task;
    return this.#DB.Task.update(task.id, task);
  }

  /**
   *
   * @param {Task} task
   */
  async unCompleteTask(task) {
    if (!task) return;

    await new Promise((resolve) => setTimeout(resolve, 600));

    this.#removeTask(task);

    task.completed = 0;
    task.archived = false;
    await this.#DB.Task.update(task.id, task);
  }

  async undoCompleteTask() {
    if (!this.#just_completed_task) return;

    const id = this.#just_completed_task.id;
    const item = await this.#DB.Task.read(this.#just_completed_task.id);
    if (!item) return;

    item.completed = 0;
    item.archived = false;
    await this.#DB.Task.update(id, item);
    this.#addTask(this.#just_completed_task);
    this.just_completed_task = null;
  }

  /**
   *
   * @param {string[]} task_ids
   */
  async deleteTasks(task_ids) {
    if (!task_ids?.length) return;

    this.#removeTasks(task_ids);

    await this.#DB.Task.delete(task_ids);
  }

  /**
   * @param {Omit<Task, "id" | "created_at">} task
   * @returns {Promise<{ success: true, task: Task} | { success: false, error_message: string}>}
   */
  async createTask(task) {
    if (!task) return { success: false, error_message: "Geen Taak gevind" };

    task.completed = 0;
    task.archived = false;

    const validation = this.#validateTask(task);
    if (!validation.success) {
      return { success: false, error_message: validation.error_message };
    }

    const new_task = await this.#DB.Task.create(task);
    this.#addTask(new_task);

    return { success: true, task: new_task };
  }

  /**
   * @param {Task} task
   * @returns {Promise<{ success: true, task: Task} | { success: false, error_message: string}>}
   */
  async updateTask(task) {
    if (!task) return { success: false, error_message: "Geen Taak gevind" };

    const validation = this.#validateTask(task);
    if (!validation.success) {
      return { success: false, error_message: validation.error_message };
    }

    task = await this.#DB.Task.update(task.id, task);
    this.#updateTask(task);

    return { success: true, task };
  }

  /**
   * @param {Omit<Category, "id" | "created_at" | "archived">} category
   */
  async createCategory(category) {
    if (!category) return;

    const new_category = await this.#DB.Category.create(category);
    this.#categories.push(new_category);

    this.#categories = sortByField(this.#categories, "name");

    return new_category;
  }

  // HELPER FUNCTIONS

  /**
   *
   * @param {Partial<Task>} task
   * @returns {{ success: true, task: Task} | { success: false, error_message: string}}
   */
  #validateTask(task) {
    if (!task) return { success: false, error_message: "Geen Taak gevind" };
    if (!task.name?.trim()) return { success: false, error_message: "Benoem jou taak" };

    if (!task.start_date || (!!task.due_date && task.start_date > task.due_date)) {
      task.start_date = task.due_date;
    }

    if (task.archived && !task.completed) {
      task.archived = false;
    }

    if (!!task.completed && !task.repeat_interval) {
      if (!task.completed_at) task.completed_at = new Date().toLocaleString("af-ZA");
      if (!task.archived) task.archived = true;
    }

    // @ts-ignore
    return { success: true, task };
  }

  /**
   * @param {Task} task
   */
  #removeTask(task) {
    if (!task) return;

    let index = this.#tasks.findIndex(({ id }) => id === task.id);
    this.#tasks.splice(index, 1);
    index = this.#all_tasks.findIndex(({ id }) => id === task.id);
    this.#all_tasks.splice(index, 1);
  }

  /**
   * @param {string[]} task_ids
   */
  #removeTasks(task_ids) {
    if (!task_ids?.length) return;

    this.#tasks = this.#tasks.filter((task) => {
      return !task_ids.some((id) => id === task.id);
    });
    this.#all_tasks = this.#all_tasks.filter((task) => {
      return !task_ids.some((id) => id === task.id);
    });
  }

  /**
   * @param {Task} task
   */
  #addTask(task) {
    if (!task) return;

    this.#tasks.push(task);
    this.#all_tasks.push(task);
  }

  /**
   * @param {Task} task
   */
  #updateTask(task) {
    let index = this.#tasks.findIndex(({ id }) => id === task.id);
    if (index === -1) return;
    this.#tasks[index] = task;

    index = this.#all_tasks.findIndex(({ id }) => id === task.id);
    if (index === -1) return;
    this.#all_tasks[index] = task;
  }

  /**
   * @param {Task[]} data
   */
  #sortByDueDate(data) {
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
      ...this.#sortByPriority(sortByField(past_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(today_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(tomorrow_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(day_after_tomorrow_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(this_week_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(this_month_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(next_month_tasks, "due_date", "asc")),
      ...this.#sortByPriority(sortByField(later_tasks, "due_date", "asc")),
    ];

    return [...with_date, ...this.#sortByPriority(no_date)];
  }

  /**
   *
   * @param {Task[]} data
   * @returns {Task[]}
   */
  #sortByPriority(data) {
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

  /**
   * @param {Task} task
   */
  #getNextDueDate(task) {
    if (!task.repeat_interval || !task.due_date) return null;

    const calcNextDay = this.#REPEAT_INTERVALS[task.repeat_interval];
    const new_day = new Date(
      calcNextDay({
        date: new Date(task.due_date),
        num: task.repeat_interval_number,
        specific_days: task.repeat_specific_days,
      })
    );

    return new_day.toLocaleDateString("en-CA");
  }

  /**
   * @param {Task} task
   */
  #getNextStartDate(task) {
    if (!task.repeat_interval || !task.start_date) return null;

    const calcNextDay = this.#REPEAT_INTERVALS[task.repeat_interval];
    const new_day = new Date(
      calcNextDay({
        date: new Date(task.start_date),
        num: task.repeat_interval_number,
        specific_days: task.repeat_specific_days,
      })
    );

    return new_day.toLocaleDateString("en-CA");
  }
}
export const data = new Data();

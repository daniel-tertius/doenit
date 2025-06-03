import { page } from "$app/state";
import { sortByField } from "$lib";
import { DB } from "$lib/DB/DB";
import { tick } from "svelte";
import { SvelteSet } from "svelte/reactivity";

/** @typedef {import('$lib/DB/DB').Task} Task */
/** @typedef {import('$lib/DB/DB').Category} Category */

export class Data {
  /**
   * @type {Record<string, (date: Date, num?: number) => number>}
   */
  #REPEAT_INTERVALS = {
    daily: (date, num = 1) => date.setDate(date.getDate() + 1 * num),
    workdaily: (date) => {
      const new_date = new Date(date);

      const day_of_week = new_date.getDay();
      if (day_of_week === 5) return date.setDate(date.getDate() + 3);
      if (day_of_week === 6) return date.setDate(date.getDate() + 2);

      return date.setDate(date.getDate() + 1);
    },
    weekly: (date, num = 1) => date.setDate(date.getDate() + 7 * num),
    monthly: (date, num = 1) => date.setMonth(date.getMonth() + 1 * num),
    yearly: (date, num = 1) => date.setFullYear(date.getFullYear() + 1 * num),
  };

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

  /**
   * @param {Task[]} value
   */
  set tasks(value) {
    this.#tasks = value;
  }

  get selected_categories_hash() {
    return this.#selected_categories_hash;
  }

  filterTasksByCategory() {
    if (!this.#selected_categories_hash.size) {
      this.#tasks = this.#all_tasks.filter(({ archived }) => archived == (page.url.pathname !== "/"));
      return;
    }

    this.#tasks = this.#all_tasks.filter(({ category_id = "", archived }) => {
      return this.#selected_categories_hash.has(category_id) && archived == (page.url.pathname !== "/");
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

    const is_home = page.url.pathname === "/";
    this.tasks = this.#all_tasks.filter(({ archived, category_id = "" }) => {
      if (!is_home) return archived;

      if (!this.selected_categories_hash.size) return !archived;

      return !archived && this.selected_categories_hash.has(category_id);
    });

    return this.tasks;
  }

  async refreshCategories() {
    this.categories = (await this.#DB.Category.data).filter(({ archived }) => !archived);
    this.categories = sortByField(this.categories, "name");

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
      task.due_date = this.#getNextDueDate(task);
      let new_task = await this.#DB.Task.update(task.id, task);
      this.#addTask(new_task);
      return;
    }

    task.completed = true;
    task.archived = true;

    this.just_completed_task = task;
    return this.#DB.Task.update(task.id, task);
  }

  /**
   * @param {Task} task
   */
  async updateTask(task) {
    if (!task) return;

    task = await this.#DB.Task.update(task.id, task);

    let index = this.#tasks.findIndex(({ id }) => id === task.id);
    if (index === -1) return;
    this.#tasks[index] = task;

    index = this.#all_tasks.findIndex(({ id }) => id === task.id);
    if (index === -1) return;
    this.#all_tasks[index] = task;

    return;
  }

  /**
   *
   * @param {Task} task
   */
  async unCompleteTask(task) {
    if (!task) return;

    await new Promise((resolve) => setTimeout(resolve, 600));

    this.#removeTask(task);

    task.completed = false;
    task.archived = false;
    await this.#DB.Task.update(task.id, task);
  }

  async undoCompleteTask() {
    if (!this.#just_completed_task) return;

    const id = this.#just_completed_task.id;
    const item = await this.#DB.Task.read(this.#just_completed_task.id);
    if (!item) return;

    item.completed = false;
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
   */
  async createTask(task) {
    if (!task) return;

    task.completed = false;
    task.archived = false;

    const new_task = await this.#DB.Task.create(task);
    this.#addTask(new_task);

    return task;
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
   * @param {Task[]} data
   */
  #sortByDueDate(data) {
    let future = [];
    let past = [];
    let no_date = [];
    let today = [];

    data = sortByField(data, "name", "asc");
    for (const task of data) {
      if (task.due_date) {
        past.push(task);
        // if (new Date(task.due_date).setUTCHours(0, 0, 0, 0) === new Date().setUTCHours(0, 0, 0, 0)) {
        //   today.push(task);
        // } else if (new Date(task.due_date).setUTCHours(0, 0, 0, 0) < new Date().setUTCHours(0, 0, 0, 0)) {
        //   past.push(task);
        // } else {
        //   future.push(task);
        // }
      } else {
        no_date.push(task);
      }
    }

    past = sortByField(past, "due_date", "asc");
    // future = sortByField(future, "due_date", "asc");

    return [...past, /* ...today, ...future,  */ ...no_date];
  }

  /**
   * @param {Task} task
   */
  #getNextDueDate(task) {
    if (!task.repeat_interval || !task.due_date) return null;

    const calcNextDay = this.#REPEAT_INTERVALS[task.repeat_interval];
    const new_day = new Date(calcNextDay(new Date(task.due_date), task.repeat_interval_number));

    return new_day.toLocaleDateString("en-CA");
  }
}
export const data = new Data();

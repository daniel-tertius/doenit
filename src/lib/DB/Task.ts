import type { RxCollection } from "$lib/chunk/rxdb";
import DateUtil from "$lib/DateUtil";
import { Table } from "./_Table";
import { DB } from "$lib/DB";
import { Photos } from "$lib/services/photos.svelte";
import { language, t } from "$lib/services/language.svelte";

export class TaskTable extends Table<Task> {
  constructor(collection: RxCollection<Task>) {
    super(collection);
  }

  create(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
    if (!task) throw Error(t("no_task_found"));
    if (!task.name?.trim()) throw Error(t("what_must_be_done"));

    if (!!task.start_date && !!task.due_date && task.start_date > task.due_date) {
      throw Error(t("start_date_before_end"));
    }

    task.completed = 0;
    task.archived = false;

    task.name = task.name.trim();
    task.description = task.description?.trim() ?? "";

    if (task.archived && !task.completed) {
      task.archived = false;
    }

    if (!!task.completed && !task.repeat_interval) {
      if (!task.completed_at)
        task.completed_at = new Date().toLocaleString(language.value === "af" ? "af-ZA" : "en-US");
      if (!task.archived) task.archived = true;
    }

    return super.create(task);
  }

  async update(id: string, task: Task): Promise<Task | null> {
    if (!task) throw Error(t("no_task_found"));
    if (!task.name?.trim()) throw Error(t("what_must_be_done"));

    if (!!task.start_date && !!task.due_date && task.start_date > task.due_date) {
      throw Error(t("start_date_before_end"));
    }

    task.name = task.name.trim();
    task.description = task.description?.trim() ?? "";

    if (task.archived && !task.completed) {
      task.archived = false;
    }

    if (!!task.completed && !task.repeat_interval) {
      if (!task.completed_at) task.completed_at = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
      if (!task.archived) task.archived = true;
    }

    return await super.update(id, task);
  }

  /**
   * Override delete to cleanup photos
   */
  async delete(ids: string | string[]): Promise<void> {
    if (!Array.isArray(ids)) ids = [ids];

    // Get all tasks to be deleted and their photos
    const tasks = await Promise.all(ids.map((id) => this.get(id)));

    // Collect all photo IDs to delete
    const photo_ids: string[] = [];
    for (const task of tasks) {
      if (task?.photo_ids?.length) {
        photo_ids.push(...task.photo_ids);
      }
    }

    // Delete the tasks
    await super.delete(ids);

    // Delete the photos
    if (photo_ids.length > 0) {
      await Photos.deletePhotos(photo_ids);
    }
  }

  async completeId(task_id: string) {
    const task = await this.get(task_id);
    if (!task) throw new Error("Task not found");

    return this.complete(task);
  }

  async complete(task: Task) {
    const is_repeat_task = task.repeat_interval && task.start_date;
    if (is_repeat_task) {
      task.completed++;
      task.start_date = getNextStartDate(task);
      task.due_date = getNextDueDate(task);
    } else {
      task.completed = 1;
      task.archived = true;
      task.completed_at = DateUtil.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    }

    return super.update(task.id, task);
  }

  uncomplete(task: Task) {
    task.completed = 0;
    task.archived = false;
    return this.update(task.id, task);
  }

  // Get tasks for a specific room
  async getByRoom(roomId: string): Promise<Task[]> {
    return this.getAll({
      selector: {
        room_id: roomId,
        archived: false,
      },
    });
  }

  async implementChange(change: Changelog) {
    switch (change.type) {
      case "create":
        if (!change.data) break;

        const task = JSON.parse(change.data); // TODO Encrypt/Decrypt
        const existing_task = await DB.Task.get(task.id).catch(() => null);
        if (existing_task) break;

        await this.create(task);
        break;
      case "unshare":
        if (true) {
          if (!change.task_id) break;

          const task = await DB.Task.get(change.task_id).catch(() => null);
          if (!task) break;

          task.room_id = null;
          await this.update(task.id, task);
          break;
        }
      case "update":
        if (true) {
          if (!change.data) break;
          const updated_task = JSON.parse(change.data); // TODO Encrypt/Decrypt
          const task = await DB.Task.get(updated_task.id).catch(() => null);
          if (!task) {
            await this.create(updated_task);
          } else {
            await this.update(updated_task.id, updated_task);
          }
        }
        break;
      case "delete":
        if (!change.task_id) break;
        await this.delete(change.task_id);
        break;
      case "complete":
        if (!change.task_id) break;
        await this.completeId(change.task_id).catch(() => null);
      default:
        break;
    }
  }
}

const REPEAT_INTERVALS: Record<string, (arg0: { date: Date; num?: number; specific_days?: number[] }) => number> = {
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

function getNextDueDate(task: Task) {
  if (!task.repeat_interval || !task.due_date) return null;

  const has_time = task.due_date.includes(" ");
  const calcNextDay = REPEAT_INTERVALS[task.repeat_interval];
  const new_day = new Date(
    calcNextDay({
      date: new Date(task.due_date),
      num: task.repeat_interval_number,
      specific_days: task.repeat_specific_days,
    })
  );

  return DateUtil.format(new_day, has_time ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD");
}

function getNextStartDate(task: Task) {
  if (!task.repeat_interval || !task.start_date) return null;

  const has_time = task.start_date.includes(" ");
  const calcNextDay = REPEAT_INTERVALS[task.repeat_interval];
  const new_day = new Date(
    calcNextDay({
      date: new Date(task.start_date),
      num: task.repeat_interval_number,
      specific_days: task.repeat_specific_days,
    })
  );

  return DateUtil.format(new_day, has_time ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD");
}

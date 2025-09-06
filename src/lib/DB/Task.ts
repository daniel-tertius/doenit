import type { RxCollection } from "rxdb";
import { Table } from "./_Table";
import { language } from "$lib/services/language.svelte";

export class TaskTable extends Table<Task> {
  constructor(collection: RxCollection<Task>) {
    super(collection);
  }

  async completeId(task_id: string) {
    const task = await this.get(task_id);
    if (!task) throw new Error("Task not found");

    return this.complete(task);
  }
  

  complete(task: Task) {
    const is_repeat_task = task.repeat_interval && task.due_date;
    if (is_repeat_task) {
      task.completed++;
      task.due_date = getNextDueDate(task);
      task.start_date = getNextStartDate(task);

      return this.update(task.id, task);
    } else {
      task.completed = 1;
      task.archived = true;
      task.completed_at = new Date().toLocaleString(language.value === "af" ? "af-ZA" : "en-US");

      return this.update(task.id, task);
    }
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

  const calcNextDay = REPEAT_INTERVALS[task.repeat_interval];
  const new_day = new Date(
    calcNextDay({
      date: new Date(task.due_date),
      num: task.repeat_interval_number,
      specific_days: task.repeat_specific_days,
    })
  );

  return new_day.toLocaleDateString("en-CA");
}

function getNextStartDate(task: Task) {
  if (!task.repeat_interval || !task.start_date) return null;

  const calcNextDay = REPEAT_INTERVALS[task.repeat_interval];
  const new_day = new Date(
    calcNextDay({
      date: new Date(task.start_date),
      num: task.repeat_interval_number,
      specific_days: task.repeat_specific_days,
    })
  );

  return new_day.toLocaleDateString("en-CA");
}

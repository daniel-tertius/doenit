import { Table } from "./Table.js";

export class DB {
  private static instance: DB | null = null;
  Task: Table<Task>;
  Category: Table<Category>;

  static getInstance(): DB {
    if (!DB.instance) {
      DB.instance = new DB();
    }

    return DB.instance;
  }

  constructor() {
    if (DB.instance) {
      throw new Error("Use DB.getInstance() instead of new DB()");
    }
    this.Task = new Table("Item");
    this.Category = new Table("Category");
  }
}

export interface Task {
  id: string;
  archived: boolean;
  created_at: string;
  name: string;
  description: string;
  completed: number; // The number of times completed (repeatable tasks)
  completed_at: string | null; // eg. "2023-10-01 12:00:00"
  
  due_date: string | null; // eg. "2023-10-01 12:00" or "2023-10-01"
  start_date: string | null; // eg. "2023-10-01 12:00" or "2023-10-01"
  repeat_interval: string;
  repeat_specific_days: (0 | 1 | 2 | 3 | 4 | 5 | 6)[]; // Array of days of the week (0-6, where 0 is Sunday)
  repeat_interval_number: number;
  important: boolean;
  category_id?: string;
}

export interface Category {
  id: string;
  is_default?: boolean;
  archived: boolean;
  created_at: string;
  name: string;
}

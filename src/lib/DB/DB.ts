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
  completed: boolean;
  due_date: string | null; // ms since 1970-01-01
  completed_at: string | null; // ms since 1970-01-01
  start_date: string | null; // ms since 1970-01-01
  repeat_interval: string;
  repeat_interval_number: number;
  important: boolean;
  urgent: boolean;
  category_id?: string;
}

export interface Category {
  id: string;
  archived: boolean;
  created_at: string;
  name: string;
}

import { Table } from "./Table.js";

export class DB {
  private static instance: DB | null = null;
  Item: Table<Item>;
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
    this.Item = new Table("Item");
    this.Category = new Table("Category");
  }
}

export interface Item {
  id: string;
  name: string;
  completed: boolean;
  due_date: string;
  category_id: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

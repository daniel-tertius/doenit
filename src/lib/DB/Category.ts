import type { RxCollection } from "rxdb";
import { Table } from "./_Table";

export class CategoryTable extends Table<Category> {
  constructor(collection: RxCollection<Category>) {
    super(collection);
  }

  async getDefault() {
    try {
      return await this.getOne({
        selector: { archived: { $ne: true }, is_default: { $eq: true } },
      });
    } catch (e) {
      console.log("[💬 Doenit]: Creating a default category.");
      return this.create({ name: "", is_default: true });
    }
  }
}

import type { RxCollection } from "rxdb";
import { Table } from "./_Table";

export class CategoryTable extends Table<Category> {
  constructor(collection: RxCollection<Category>) {
    super(collection);
  }

  async getDefault() {
    let default_category = await this.getOne({
      selector: { archived: { $ne: true }, is_default: { $eq: true } },
    });
    if (!default_category) {
      default_category = await this.create({ name: "", is_default: true });
    }

    return default_category;
  }
}

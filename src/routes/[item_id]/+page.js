import { DB } from "$lib/DB/DB.js";

export async function load({ params }) {
  const Db = DB.getInstance();

  const item = await Db.Task.read(params.item_id);
  if (!item) {
    return { status: 404, error: new Error("Item not found") };
  }

  return { item };
}

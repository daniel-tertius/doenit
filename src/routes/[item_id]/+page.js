import { DB } from "$lib/DB/DB.js";

export async function load({ params }) {
  const Db = DB.getInstance();

  const origin_task = await Db.Task.read(params.item_id);
  if (!origin_task) {
    return { status: 404, error: new Error("Item not found") };
  }

  return { origin_task };
}

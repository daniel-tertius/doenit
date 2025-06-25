import { DB } from "$lib/DB/DB.js";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
  const Db = DB.getInstance();

  const origin_task = await Db.Task.read(params.item_id);
  if (!origin_task) {
    error(404, "Task not found");
  }

  return {
    /** @type {import("$lib/DB/DB.js").Task} */
    task: {
      id: origin_task.id,
      completed_at: null,
      created_at: origin_task.created_at,
      name: origin_task.name,
      description: origin_task.description || "",
      due_date: origin_task.due_date,
      start_date: origin_task.start_date,
      important: !!origin_task.important,
      urgent: !!origin_task.urgent,
      completed: origin_task.completed ?? 0,
      repeat_interval: origin_task.repeat_interval_number > 1 ? "other" : origin_task.repeat_interval || "",
      repeat_interval_number: origin_task.repeat_interval_number || 1,
      repeat_specific_days: origin_task.repeat_specific_days || [],
      archived: origin_task.archived || false,
      category_id: origin_task.category_id || undefined,
    },
  };
}

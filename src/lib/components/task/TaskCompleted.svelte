<script>
  import { displayDateTime } from "$lib";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { longpress } from "../long";
  import { data } from "../../../routes/Data.svelte";
  import ItemName from "./ItemName.svelte";
  import ItemCheckbox from "./ItemCheckbox.svelte";
  import TaskDueDate from "./TaskDueDate.svelte";
  import { Categories } from "$lib/icon";

  /**
   * @typedef {import('$lib/DB/DB').Task} Task
   * @typedef {import('$lib/DB/DB').Category} Category
   */

  /**
   * @typedef {Object} Props
   * @property {Task} task
   * @property {(_: Task) => *} [onselect]
   * @property {() => *} [onclick]
   * @property {() => *} [onlongpress]
   */

  /** @type {Props & Record<string, any>} */
  const { task: original_task, onselect = () => {}, onclick = () => {}, onlongpress = () => {}, ...rest } = $props();

  const task = $state({ ...original_task });

  const today = new Date();
  const due_date = task.due_date ? new Date(task.due_date) : 0;
  const start_date = task.start_date ? new Date(task.start_date) : 0;

  /** @type {Category?} */
  let category = $state(null);
  let tick_animation = $state(false);

  const is_past = $derived(!!due_date && due_date < today);
  const is_selected = $derived(data.selected_tasks_hash.has(task.id));
  const is_ongoing = $derived(!!due_date && !!start_date && today >= start_date && today <= due_date);
  const is_complete = $derived(!!task.completed);

  onMount(async () => {
    if (!task.category_id) return;
    const Db = DB.getInstance();

    category = await Db.Category.read(task.category_id);
  });
</script>

<div
  class="relative text-t-secondary min-h-10 transition-all rounded-lg duration-600 delay-350 shadow-sm"
  class:translate-x-[80%]={tick_animation}
  class:**:opacity-50={tick_animation}
  in:slide={{ delay: 200 }}
>
  <button
    {...rest}
    class={{
      "rounded-lg flex flex-col items-start p-2 w-full h-full": true,
      "bg-t-primary-600": !is_selected && !!task.completed,
    }}
    {onclick}
    use:longpress
    {onlongpress}
  >
    <ItemName name={task.name} completed={!!task.completed} {tick_animation} />

    <div class="flex flex-wrap gap-2 pl-10 text-t-secondary font-normal">
      {#if category}
        <div class="text-left opacity-50 bg-t-primary-300 px-1 rounded w-fit flex items-center h-fit gap-1">
          <div class="w-4 h-4">
            <Categories size={16} />
          </div>
          <span>{category.name}</span>
        </div>
      {/if}

      {#if task.due_date}
        <TaskDueDate {is_complete} {is_ongoing} {is_past} {is_selected} is_repeating={!!task.repeat_interval}>
          {displayDateTime({ due_date, start_date })}
        </TaskDueDate>
      {/if}
    </div>
  </button>

  <div class="absolute top-1 right-2 flex gap-1 opacity-50 font-semibold">
    × {task.completed}
  </div>

  <ItemCheckbox bind:tick_animation {is_selected} onselect={async () => onselect(task)} {onlongpress} />
</div>

<script>
  import { displayDateTime } from "$lib";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { longpress } from "../long";
  import { data } from "$lib/Data.svelte";
  import ItemName from "./ItemName.svelte";
  import ItemCheckbox from "./ItemCheckbox.svelte";
  import { Categories, Important, Urgent } from "$lib/icon";
  import TaskDueDate from "./TaskDueDate.svelte";

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
  const due_date = getDate(task.due_date, "end");
  const start_date = getDate(task.start_date || task.due_date, "start");

  /** @type {Category?} */
  let category = $state(null);
  let tick_animation = $state(false);

  const is_past = $derived(!!due_date && due_date < today);
  const is_selected = $derived(data.selected_tasks_hash.has(task.id));
  const is_ongoing = $derived(!!due_date && !!start_date && today >= start_date && today <= due_date);

  onMount(async () => {
    if (!task.category_id) return;
    const Db = DB.getInstance();

    category = await Db.Category.read(task.category_id);
  });

  /**
   * Returns a Date object representing the start or end of the day based on the provided date string.
   * @param {string} date Date in the format "YYYY-MM-DD HH:mm"
   * @param {'end' | 'start'} type
   * @return {Date | null} Returns a Date object representing the start or end of the day.
   */
  function getDate(date, type) {
    if (!date) return null;

    const [day, time] = date.split(" ");

    return new Date(`${day} ${time || type === "start" ? "00:00" : "23:59"}`);
  }
</script>

<div
  class="relative text-t-secondary min-h-10 transition-all rounded-lg duration-600 delay-350 shadow-sm"
  class:translate-x-[80%]={tick_animation}
  in:slide={{ delay: 200 }}
>
  <button
    {...rest}
    class={{
      "rounded-lg flex flex-col items-start p-2 w-full h-full": true,
      "bg-error/60": is_past && !is_selected,
      "bg-active/60": is_ongoing && !is_selected,
      "bg-primary": is_selected,
      "bg-t-primary-600": !is_selected && !is_past && !is_ongoing,
    }}
    {onclick}
    use:longpress
    {onlongpress}
  >
    <ItemName name={task.name} {tick_animation} description={task.description} />

    <div class="flex flex-wrap gap-2 pl-10 text-t-secondary font-normal">
      {#if task.due_date}
        <TaskDueDate is_complete={false} {is_ongoing} {is_past} {is_selected} is_repeating={!!task.repeat_interval}>
          {displayDateTime({ due_date, start_date })}
        </TaskDueDate>
      {/if}

      {#if category}
        <div
          class={{
            "text-left px-1 w-fit flex items-center h-fit gap-1 rounded opacity-80": true,
            "bg-t-primary-400": !is_past && !is_ongoing,
            "bg-error/80": is_past && !is_selected,
            "bg-active/80": is_ongoing && !is_selected,
            "bg-t-primary-700": is_selected,
          }}
        >
          <div class="w-4 h-4">
            <Categories size={16} />
          </div>
          <span>{category.name}</span>
        </div>
      {/if}
    </div>
  </button>

  {#if !task.archived}
    <div class="absolute top-1 right-1 flex gap-1">
      <Important size={16} class={!task.important && "hidden"} />
      <Urgent size={16} class={!task.urgent && "hidden"} />
    </div>
  {/if}

  <ItemCheckbox bind:tick_animation {is_selected} onselect={async () => onselect(task)} {onlongpress} />
</div>

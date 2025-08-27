<script>
  import { displayDateTime } from "$lib";
  import { onMount } from "svelte";
  import { Selected } from "$lib/Data.svelte";
  import ItemName from "./ItemName.svelte";
  import { InputCheckbox } from "../element/input";
  import TaskDueDate from "./TaskDueDate.svelte";
  import { Categories, Sync } from "$lib/icon";
  import TaskContainer from "./TaskContainer.svelte";
  import { DB } from "$lib/DB";

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
  const is_selected = $derived(Selected.tasks.has(task.id));
  const is_ongoing = $derived(!!due_date && !!start_date && today >= start_date && today <= due_date);
  const is_complete = $derived(!!task.completed);

  onMount(async () => {
    if (!task.category_id) return;

    try {
      category = await DB.Category.get(task.category_id);
    } catch (e) {}
  });
</script>

<TaskContainer
  {tick_animation}
  class={{
    "rounded-lg flex flex-col items-start py-4 px-2 w-full h-full": true,
    // "bg-t-primary-900 border": is_selected,
    "bg-black/20 dark:bg-white/20 border": is_selected,
    "bg-white dark:bg-dark-400": !is_selected,
  }}
  {onclick}
  {onlongpress}
>
  <ItemName name={task.name} completed={!!task.completed} {tick_animation} />

  <div class="flex flex-wrap gap-2 pl-10 text-t-secondary font-normal">
    {#if task.due_date}
      <TaskDueDate {is_complete} {is_ongoing} {is_past} {is_selected} is_repeating={!!task.repeat_interval}>
        {displayDateTime({ due_date, start_date })}
      </TaskDueDate>
    {/if}

    {#if category}
      <div
        class={{
          "text-left opacity-50 bg-t-primary-300 px-1 rounded w-fit flex items-center h-fit gap-1": true,
          "bg-t-primary-700": is_selected,
          "bg-t-primary-300": !is_selected,
        }}
      >
        <div class="w-4 h-4">
          <Categories size={16} />
        </div>
        <span>{category.name}</span>
      </div>
    {/if}
  </div>

  {#if task.completed > 1}
    <div class="absolute top-1 right-2 flex gap-1 opacity-50 font-semibold">
      <Sync size={12} class="my-auto" />
      × {task.completed}
    </div>
  {/if}

  <InputCheckbox
    bind:tick_animation
    is_selected={true}
    onselect={(e) => {
      e.stopPropagation();
      onselect(task);
    }}
    {onlongpress}
  />
</TaskContainer>

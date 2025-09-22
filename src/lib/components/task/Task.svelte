<script>
  import { displayDateTime } from "$lib";
  import { onMount } from "svelte";
  import { Selected } from "$lib/selected";
  import ItemName from "./ItemName.svelte";
  import { InputCheckbox } from "../element/input";
  import { Categories, Important, Shared } from "$lib/icon";
  import TaskDueDate from "./TaskDueDate.svelte";
  import TaskContainer from "./TaskContainer.svelte";
  import DateUtil from "$lib/DateUtil";
  import { DB } from "$lib/DB";

  /**
   * @typedef {Object} Props
   * @property {Task} task
   * @property {(_: Task) => *} [onselect]
   * @property {() => *} [onclick]
   * @property {() => *} [onlongpress]
   */

  /** @type {Props & Record<string, any>} */
  const { task, onselect = () => {}, onclick = () => {}, onlongpress = () => {}, ...rest } = $props();

  const today = new Date();
  const due_date = DateUtil.parseWithTimeBoundary(task.due_date, "end");
  const start_date = DateUtil.parseWithTimeBoundary(task.start_date || task.due_date, "start");

  /** @type {Category?} */
  let category = $state(null);
  let tick_animation = $state(false);

  const is_past = $derived(!!due_date && due_date < today);
  const is_selected = $derived(Selected.tasks.has(task.id));
  const is_ongoing = $derived(!!due_date && !!start_date && today >= start_date && today <= due_date);

  onMount(async () => {
    if (!task.category_id) return;

    category = await DB.Category.get(task.category_id);
  });

  /**
   * Handles the selection of a completed task.
   * @param {Event} event
   */
  function handleSelect(event) {
    event.stopPropagation();
    setTimeout(() => onselect(task), 500);
  }
</script>

<TaskContainer
  {tick_animation}
  class={{
    border: true,
    "bg-error/20 border-error text-alt": is_past && !is_selected,
    "bg-success/20 border-success text-alt": is_ongoing && !is_selected,
    "bg-primary/20 border-primary text-alt": is_selected,
    "bg-card border-default": !is_selected && !is_past && !is_ongoing,
  }}
  {onclick}
  {onlongpress}
>
  <ItemName name={task.name} {tick_animation} description={task.description} />

  <div class="flex flex-wrap gap-2 pl-10 font-normal">
    {#if task.due_date}
      <TaskDueDate is_complete={false} {is_ongoing} {is_past} {is_selected} is_repeating={!!task.repeat_interval}>
        {displayDateTime({ due_date, start_date })}
      </TaskDueDate>
    {/if}

    {#if category}
      <div
        class={{
          "text-left px-1 w-fit flex items-center h-fit gap-1 rounded opacity-80": true,
          "bg-surface": !is_past && !is_ongoing,
          "bg-error/80": is_past && !is_selected,
          "bg-success/80": is_ongoing && !is_selected,
          "bg-primary": is_selected,
        }}
      >
        <Categories class="w-sm h-sm" />

        <span>{category.name}</span>
      </div>
    {/if}
  </div>

  <div class="absolute top-1.5 right-1.5 flex gap-1">
    {#if !task.archived}
      <Important class={!task.important && "hidden"} />
    {/if}
    <Shared class={!task.room_id && "hidden"} />
  </div>

  <InputCheckbox bind:tick_animation {is_selected} {onlongpress} onselect={handleSelect} />
</TaskContainer>

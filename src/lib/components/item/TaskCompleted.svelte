<script>
  import { displayDate, displayDateTime } from "$lib";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { longpress } from "../long";
  import { data } from "../../../routes/Data.svelte";
  import ItemName from "./ItemName.svelte";
  import ItemCheckbox from "./ItemCheckbox.svelte";
  import Sync from "$lib/icon/Sync.svelte";
  import Important from "$lib/icon/Important.svelte";
  import Urgent from "$lib/icon/Urgent.svelte";

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
  let checkoff_animation = $state(false);

  const is_past = $derived(!!due_date && due_date < today);
  const is_selected = $derived(data.selected_tasks_hash.has(task.id));
  const is_ongoing = $derived(!!due_date && !!start_date && today >= start_date && today <= due_date);

  onMount(async () => {
    if (!task.category_id) return;
    const Db = DB.getInstance();

    category = await Db.Category.read(task.category_id);
  });
</script>

<div
  class="relative min-h-10 transition-all rounded-lg duration-600 delay-350 shadow-sm {checkoff_animation
    ? 'translate-x-[80%] **:opacity-50'
    : ''}"
  in:slide={{ delay: 200 }}
>
  <button
    {...rest}
    class="rounded-lg flex flex-col items-start p-3 w-full h-full"
    class:bg-error={is_past && !task.completed && !is_selected}
    class:bg-active={is_ongoing && !task.completed && !is_selected}
    class:bg-primary={!!task.completed || (is_selected && !task.completed)}
    class:bg-primary-20l={(!task.completed && !is_past && !is_ongoing && !is_selected) ||
      (!is_selected && !!task.completed)}
    {onclick}
    use:longpress
    {onlongpress}
  >
    <ItemName name={task.name} completed={!!task.completed} {checkoff_animation} />

    <div class="pl-9 flex flex-wrap gap-1.5">
      {#if task.due_date}
        <div
          class="text-left rounded-full px-1.5 py-0.5 w-fit flex items-center h-fit gap-1"
          class:bg-primary={!task.completed && !is_past && !is_ongoing}
          class:opacity-50={!!task.completed}
          class:bg-primary-10l={!!task.completed}
          class:bg-red-800={is_past && !task.completed && !is_selected}
          class:bg-active-30d={is_ongoing && !task.completed}
          class:bg-primary-20l={is_selected && !task.completed}
        >
          <span class="text-tertiary">
            {displayDateTime({ due_date, start_date })}
          </span>

          {#if !!task.repeat_interval}
            <Sync class="text-tertiary" size={12} />
          {/if}
        </div>
      {/if}

      {#if category}
        <div
          class="text-left rounded-full px-3 py-0.5 w-fit flex items-center h-fit overflow-hidden"
          class:opacity-50={!!task.completed}
          class:bg-[#2c5890]={!task.completed && !is_past && !is_ongoing}
          class:bg-[#965cd1]={!task.completed && is_past && !is_ongoing}
          class:bg-[#642c90]={is_ongoing && !task.completed}
        >
          <span class="text-tertiary">{category.name}</span>
        </div>
      {/if}
    </div>
  </button>

  {#if !task.completed}
    <div class="absolute top-1 right-1 flex gap-1">
      <Important size={16} class="text-tertiary {!task.important && 'hidden'}" />
      <Urgent size={16} class="text-tertiary {!task.urgent && 'hidden'}" />
    </div>
  {:else if task.completed > 1}
    <div class="absolute top-1 right-2 flex gap-1 text-tertiary opacity-50 font-semibold">
      × {task.completed}
    </div>
  {/if}

  <ItemCheckbox bind:checkoff_animation {is_selected} onselect={async () => onselect(task)} {onlongpress} />
</div>

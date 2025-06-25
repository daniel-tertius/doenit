<script>
  import { displayDate, displayDateRange, displayDateTime } from "$lib";
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
  const due_date = getDate(task.due_date, "end");
  const start_date = getDate(task.start_date, "start");

  $inspect({ today, due_date, start_date });

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

  function getDate(date, type) {
    if (!date) return "";

    const [day, time] = date.split(" ");

    return new Date(`${day} ${time || type === "start" ? "00:00" : "23:59"}`);
  }
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
    class:bg-error={is_past && !is_selected}
    class:bg-active={is_ongoing && !is_selected}
    class:bg-primary={is_selected}
    class:bg-primary-20l={!is_selected && !is_past && !is_ongoing}
    {onclick}
    use:longpress
    {onlongpress}
  >
    <ItemName name={task.name} {checkoff_animation} />

    <div class="pl-9 flex flex-wrap gap-1.5">
      {#if task.due_date}
        <div
          class="text-left rounded-full px-1.5 py-0.5 w-fit flex items-center h-fit gap-1"
          class:bg-primary={!is_past && !is_ongoing}
          class:bg-red-800={is_past && !is_selected}
          class:bg-active-30d={is_ongoing}
          class:bg-primary-20l={is_selected}
        >
          <span class="text-tertiary">
            {displayDateRange({ start: start_date, end: due_date })}
          </span>

          {#if !!task.repeat_interval}
            <Sync class="text-tertiary" size={12} />
          {/if}
        </div>
      {/if}

      {#if category}
        <div
          class="text-left rounded-full px-3 py-0.5 w-fit flex items-center h-fit overflow-hidden"
          class:bg-[#2c5890]={!is_past && !is_ongoing}
          class:bg-[#965cd1]={is_past && !is_ongoing}
          class:bg-[#642c90]={is_ongoing}
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
  {/if}

  <ItemCheckbox bind:checkoff_animation {is_selected} onselect={async () => onselect(task)} {onlongpress} />
</div>

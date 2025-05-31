<script>
  import { displayDate } from "$lib";
  import { DB } from "$lib/DB/DB";
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { longpress } from "../long";
  import { data } from "../../../routes/Data.svelte";
  import ItemName from "./ItemName.svelte";
  import ItemCheckbox from "./ItemCheckbox.svelte";
  import Resync from "$lib/icon/Sync.svelte";
  import Sync from "$lib/icon/Sync.svelte";

  /**
   * @typedef {import('$lib/DB/DB').Task} Task
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
  const is_past = $derived(
    !!task.due_date && new Date(task.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  );
  const is_selected = $derived(data.selected_tasks_hash.has(task.id));

  let checkoff_animation = $state(false);
  let category = $state();

  onMount(async () => {
    if (!task.category_id) return;
    const Db = DB.getInstance();

    category = await Db.Category.read(task.category_id);
  });
</script>

<!-- {task.repeat_interval_number}
{task.repeat_interval} -->
<div
  class="relative min-h-10 transition-all rounded-lg duration-600 delay-350 shadow-sm bg-[#476480] {checkoff_animation
    ? 'translate-x-[80%] **:opacity-50'
    : ''}"
  in:slide={{ delay: 200 }}
>
  <button
    {...rest}
    class="rounded-lg flex flex-col items-start p-3 w-full h-full {is_past && !task.completed
      ? 'border-red-600/40! bg-red-500/20!'
      : ''}"
    class:bg-[#476480]!={is_selected}
    class:bg-[#233a50]={task.completed}
    {onclick}
    use:longpress
    {onlongpress}
  >
    <ItemName name={task.name} completed={task.completed} {checkoff_animation} />

    <div class="pl-8 flex flex-wrap gap-1.5">
      {#if task.due_date}
        <div
          class="text-left rounded-full bg-[#223a51] px-1.5 w-fit flex items-center h-fit gap-1"
          class:opacity-50={task.completed}
          class:bg-red-800={is_past && !task.completed}
        >
          <span class="text-gray-300">
            {displayDate(task.due_date)}
          </span>

          {#if !!task.repeat_interval}
            <Sync class="text-gray-300" size={12} />
          {/if}
        </div>
      {/if}

      {#if category}
        <div
          class="text-left rounded-full bg-[#725132] border border-[#67492d] px-3 w-fit flex items-center h-fit overflow-hidden"
          class:opacity-50={task.completed}
        >
          <span class="text-gray-200">{category.name}</span>
        </div>
      {/if}
    </div>
  </button>

  <ItemCheckbox bind:checkoff_animation {is_selected} onselect={async () => onselect(task)} {onlongpress} />
</div>

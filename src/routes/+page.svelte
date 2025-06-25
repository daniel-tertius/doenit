<script>
  import { displayPrettyDate } from "$lib";
  import { Plus } from "$lib/icon";
  import { goto, pushState } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { data } from "./Data.svelte";
  import { navigating, page } from "$app/state";
  import { onMount, tick } from "svelte";
  import { Haptics } from "@capacitor/haptics";
  import Task from "$lib/components/item/Task.svelte";

  data.selected_tasks_hash.clear();
  data.refreshTasks();

  onMount(() => {
    const task_id = navigating.from?.params?.item_id || page.url.searchParams.get("new_id");
    if (!!task_id) {
      // Update the URL without reloading the page
      page.url.searchParams.delete("new_id");
      const url_search = !!page.url.searchParams.size ? `?${page.url.search}` : "";
      const new_url = `${page.url.origin}${page.url.pathname}${url_search}`;
      pushState(new_url, {});

      const element = document.getElementById(task_id);
      if (!element) return;

      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
    }
  });
</script>

<div class="space-y-1.5">
  {#if data.tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      <div class="text-lg text-tertiary">Jou lys is skoon!</div>
      <button
        type="button"
        class="rounded-md bg-primary-20l px-12 py-6 flex justify-center items-center gap-2 text-sm font-medium text-tertiary transition-colors hover:bg-primary-10l focus:outline-none focus:ring-2 focus:ring-primary-20l focus:ring-offset-2"
        onclick={() => goto("/create")}
      >
        <Plus size={40} />
        <span class="text-[20px]">Skep 'n nuwe taak</span>
      </button>
    </div>
  {/if}

  {#each data.tasks as task, i (task.id)}
    {@const display_date = displayPrettyDate(task.due_date)}
    {@const last_display_date = displayPrettyDate(data.tasks[i - 1]?.due_date)}
    {@const is_same_display_date = display_date === last_display_date}
    {@const onselect = async () => {
      await data.completeTask(task);
      await tick();
      const element = document.getElementById(task.id);
      if (!element) return;

      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
    }}

    {#if !is_same_display_date}
      {#key display_date}
        <div in:fade={{ delay: 700 }} class="text-sm font-semibold pt-1 text-tertiary">
          {display_date}
        </div>
      {/key}
    {/if}

    <div id={task.id}>
      <Task
        {task}
        {onselect}
        onclick={() => {
          if (!data.selected_tasks_hash.size) return goto(`/${task.id}`);

          if (data.selected_tasks_hash.has(task.id)) {
            data.selected_tasks_hash.delete(task.id);
          } else {
            data.selected_tasks_hash.add(task.id);
            Haptics.vibrate({ duration: 50 });
          }
        }}
        onlongpress={() => {
          Haptics.vibrate({ duration: 100 });
          if (data.selected_tasks_hash.has(task.id)) {
            data.selected_tasks_hash.delete(task.id);
          } else {
            data.selected_tasks_hash.add(task.id);
          }
        }}
      />
    </div>
  {/each}
</div>

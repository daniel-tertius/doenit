<script>
  import { displayPrettyDate, sortTasksByDueDate } from "$lib";
  import TaskComponent from "$lib/components/task/Task.svelte";
  import { Plus } from "$lib/icon";
  import { goto, pushState } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { Selected } from "$lib/selected";
  import { navigating, page } from "$app/state";
  import { onMount, tick } from "svelte";
  import { Haptics } from "@capacitor/haptics";
  import { t } from "$lib/services/language.svelte";
  import { DB } from "$lib/DB";

  Selected.tasks.clear();

  /** @type {Task[]} */
  let tasks = $state([]);
  /** @type {Category[]} */
  let categories = $state([]);
  const filtered_tasks = $derived(filterTasksByCategory(tasks));
  const default_category = $derived(categories.find(({ is_default }) => is_default));

  onMount(() => {
    const sub = DB.Task.subscribe((result) => (tasks = sortTasksByDueDate(result)), {
      selector: { archived: { $ne: true } },
    });

    return () => sub.unsubscribe();
  });

  onMount(() => {
    const sub = DB.Category.subscribe((result) => (categories = result), {
      selector: { archived: { $ne: true } },
      sort: [{ name: "asc" }],
    });

    return () => sub.unsubscribe();
  });

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

  /**
   * @param {Task[]} tasks
   * @returns {Task[]}
   */
  function filterTasksByCategory(tasks) {
    if (!Selected.categories.size) {
      return tasks;
    }

    return tasks.filter(({ category_id = "" }) => {
      if (!category_id && default_category) {
        return Selected.categories.has(default_category.id);
      }

      return Selected.categories.has(category_id);
    });
  }
</script>

<div class="space-y-1.5">
  {#if filtered_tasks.length === 0}
    <div class="flex flex-col items-center gap-4 py-12">
      {#if Selected.categories.size === 0}
        <div class="text-lg">{t("empty_list")}</div>
      {:else}
        <div class="text-lg">{t("no_tasks_found")}</div>
      {/if}
      <button
        type="button"
        class="rounded-md bg-card px-12 py-6 flex justify-center items-center gap-2 text-sm font-medium text-t-secondary transition-colors hover:bg-primary-10l focus:outline-none focus:ring-2 focus:ring-primary-20l focus:ring-offset-2"
        onclick={() => goto("/create")}
      >
        <Plus size={40} />
        <span class="text-lg">{t("create_new_task")}</span>
      </button>
    </div>
  {/if}

  {#each filtered_tasks as task, i (task.id)}
    {@const display_date = displayPrettyDate(task.due_date)}
    {@const last_display_date = displayPrettyDate(filtered_tasks[i - 1]?.due_date)}
    {@const is_same_display_date = display_date === last_display_date}
    {@const onselect = async () => {
      await DB.Task.complete(task);
      await tick();
      const element = document.getElementById(task.id);
      if (!element) return;

      element.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
    }}

    {#if !is_same_display_date}
      {#key display_date}
        <div in:fade={{ delay: 700 }} class="text-sm font-semibold pt-1 text-t-secondary">
          {display_date}
        </div>
      {/key}
    {/if}

    <div id={task.id}>
      {#key task.id + task.due_date}
        <TaskComponent
          {task}
          {onselect}
          onclick={() => {
            if (!Selected.tasks.size) return goto(`/${task.id}`);

            if (Selected.tasks.has(task.id)) {
              Selected.tasks.delete(task.id);
            } else {
              Selected.tasks.add(task.id);
              Haptics.vibrate({ duration: 50 });
            }
          }}
          onlongpress={() => {
            Haptics.vibrate({ duration: 100 });
            if (Selected.tasks.has(task.id)) {
              Selected.tasks.delete(task.id);
            } else {
              Selected.tasks.add(task.id);
            }
          }}
        />
      {/key}
    </div>
  {/each}
</div>

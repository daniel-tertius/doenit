<script>
  import { displayPrettyDate, normalize, sortTasksByDueDate } from "$lib";
  import TaskComponent from "$lib/components/task/Task.svelte";
  import { t } from "$lib/services/language.svelte";
  import { goto, pushState } from "$app/navigation";
  import { navigating, page } from "$app/state";
  import { Haptics } from "@capacitor/haptics";
  import { fade } from "svelte/transition";
  import { Selected } from "$lib/selected";
  import { onMount, tick } from "svelte";
  import { Plus } from "$lib/icon";
  import { DB } from "$lib/DB";
  import { auth } from "$lib/services/auth.svelte";
  import { OnlineDB } from "$lib/OnlineDB";

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
    const { searchParams, search, origin, pathname } = page.url;
    const task_id = navigating.from?.params?.item_id || searchParams.get("new_id");
    if (!task_id) return;

    // Update the URL without reloading the page
    searchParams.delete("new_id");
    const url_search = !!searchParams.size ? `?${search}` : "";
    const new_url = `${origin}${pathname}${url_search}`;
    pushState(new_url, {});
    scrollToTask(task_id);
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

  /**
   * Handles click on a task.
   * @param {Task} task
   */
  function handleClick(task) {
    if (!Selected.tasks.size) return goto(`/${task.id}`);

    if (Selected.tasks.has(task.id)) {
      Selected.tasks.delete(task.id);
    } else {
      Selected.tasks.add(task.id);
      Haptics.vibrate({ duration: 50 });
    }
  }

  /**
   * @param {Task} task
   */
  function handleLongPress(task) {
    Haptics.vibrate({ duration: 100 });
    if (Selected.tasks.has(task.id)) {
      Selected.tasks.delete(task.id);
    } else {
      Selected.tasks.add(task.id);
    }
  }

  /**
   * Handles the selection of a completed task.
   * @param {Task} task
   */
  async function handleSelect(task) {
    await DB.Task.complete(task);
    if (task.room_id) {
      const room = await DB.Room.get(task.room_id);
      if (!room) throw new Error("Room not found");

      const user = auth.getUser();
      if (!user || !user.email) return;

      const user_email = normalize(user.email || "");
      OnlineDB.Changelog.create({
        type: "complete",
        task_id: task.id,
        room_id: task.room_id || "",
        total_reads_needed: room.users.length,
        user_reads_list: [user_email],
      });
    }
    await tick();

    scrollToTask(task.id);
  }

  /**
   * @param {string} task_id
   */
  function scrollToTask(task_id) {
    const element = document.getElementById(task_id);
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }
</script>

<div class="space-y-1.5">
  {#each filtered_tasks as task, i (task.id)}
    {@const display_date = displayPrettyDate(task.due_date)}
    {@const last_display_date = displayPrettyDate(filtered_tasks[i - 1]?.due_date)}
    {@const is_same_display_date = display_date === last_display_date}

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
          onclick={() => handleClick(task)}
          onselect={() => handleSelect(task)}
          onlongpress={() => handleLongPress(task)}
        />
      {/key}
    </div>
  {:else}
    <div class="flex flex-col items-center gap-4 py-12">
      {#if !Selected.categories.size}
        <div class="text-lg">{t("empty_list")}</div>
      {:else}
        <div class="text-lg">{t("no_tasks_found")}</div>
      {/if}

      <button
        type="button"
        class="rounded-lg bg-card px-12 py-6 flex justify-center items-center gap-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onclick={() => goto("/create")}
      >
        <Plus />
        <span class="text-lg">{t("create_new_task")}</span>
      </button>
    </div>
  {/each}
</div>

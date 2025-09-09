<script>
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { ButtonBack } from "$lib/components/element/button";
  import DeleteAll from "../lib/components/DeleteAll.svelte";
  import { t } from "$lib/services/language.svelte";

  /** @type {Record<string, string>} */
  const TITLES = $derived({
    "/": t("task_list"),
    "/create": t("new_task"),
    "/[item_id]": t("edit_task"),
    "/friends": t("friends"),
    "/complete": t("completed_tasks"),
    "/categories": t("categories"),
    "/settings": t("settings"),
  });

  const title = $derived(TITLES[page.route.id ?? "/"] || t("task_list"));
</script>

<div class="flex p-1 bg-surface border-default border-b">
  <ButtonBack />

  <div class="w-fit mx-auto flex items-center justify-center gap-1 py-2">
    <img alt="logo" src="logo.png" class="w-3xl" />
    <div class="relative">
      <span class="text-transparent text-3xl font-bold px-2 line-clamp-1">{title}</span>
      {#key title}
        <h1 transition:fade={{ duration: 100 }} class="absolute inset-0 text-3xl font-bold line-clamp-1">
          {title}
        </h1>
      {/key}
    </div>
  </div>

  <DeleteAll />
</div>

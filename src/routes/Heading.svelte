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

<div class="relative bg-t-primary shadow-md">
  <div class="w-full h-12 relative mx-auto p-2">
    {#key title}
      <div
        transition:fade={{ duration: 100 }}
        class="absolute inset-0 w-fit mx-auto flex items-center justify-center gap-1"
      >
        <img alt="logo" src="logo.png" height="35px" width="35px" />
        <h1 class="text-3xl font-bold text-tertiary text-center h-10 mx-auto">
          {title}
        </h1>
      </div>
    {/key}
  </div>

  <ButtonBack />
  <DeleteAll />
</div>

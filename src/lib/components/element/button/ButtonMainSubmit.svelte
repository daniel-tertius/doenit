<script>
  import { Plus, Loading, Check, Home } from "$lib/icon";
  import { navigating, page } from "$app/state";
  import { goto } from "$app/navigation";

  /** @type {Record<string, import("svelte").Component<*, {}, "">>}*/
  const ICON_CHART = {
    "/": Plus,
    "/create": Check,
    "/complete": Home,
    "/categories": Home,
    "/settings": Home,
    "/friends": Home,
    "/[item_id]": Check,
  };

  const page_id = $derived(page.route.id ?? "");
  const is_form_page = $derived(["/create", "/[item_id]"].includes(page_id));
  const Icon = $derived(ICON_CHART[page_id]);
  const type = $derived(is_form_page ? "submit" : "button");
  const form = $derived(is_form_page ? "form" : null);
  const onclick = $derived(is_form_page ? null : () => goto(page_id === "/" ? "/create" : "/"));
</script>

{#if Icon}
  <button
    {type}
    {form}
    class="flex justify-center bg-card items-center aspect-square rounded-full h-15 w-15 p-3"
    {onclick}
    aria-label={is_form_page ? "Submit form" : page_id === "/" ? "Create new item" : "Go to home"}
  >
    {#if navigating.to}
      <Loading class="text-2xl" />
    {:else}
      <Icon class="text-2xl" />
    {/if}
  </button>
{/if}

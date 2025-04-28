<script>
  import { DB } from "$lib/DB/DB";
  import Item from "$lib/components/Item.svelte";

  import PageHeading from "../PageHeading.svelte";
  import { onMount } from "svelte";
  import { App } from "@capacitor/app";
  import { Capacitor } from "@capacitor/core";
  import Fab from "../FAB.svelte";

  let { onclose, oncreate } = $props();

  /** @type {import('$lib/DB/DB').Item[]}*/
  let items = $state([]);

  $effect(() => {
    const Db = DB.getInstance();
    Db.Item.data.then((data) => (items = data));
  });

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        onclose(event);
      });
    }
  });
</script>

<div class="space-y-2 text-white">
  <PageHeading>Task List</PageHeading>

  {#if !!items.length}
    <Fab onclick={oncreate} class="bottom-6 right-6 bg-[#5b758e] hover:bg-[#476480]">
      {@render createIcon()}
    </Fab>
  {/if}

  <div class="mt-6 space-y-4">
    {#if items.length === 0}
      <div class="flex flex-col items-center gap-4 py-8">
        <div class="text-lg text-gray-400">No tasks found</div>
        <button
          type="button"
          class="rounded-md bg-[#5b758e] px-6 py-2 flex items-center gap-2 text-sm font-medium text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
          onclick={oncreate}
        >
          <span class="h-6 w-6">{@render createIcon()}</span>
          <span>Create new task</span>
        </button>
      </div>
    {/if}

    {#each items as item (item.id)}
      {#key item.id}
        <Item
          {item}
          oncomplete={() => {
            const Db = DB.getInstance();
            Db.Item.delete(item.id);
            items = items.filter(({ id }) => id !== item.id);
          }}
        />
      {/key}
    {/each}
  </div>
</div>

{#snippet createIcon()}
  <svg class="text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
  </svg>
{/snippet}

<script>
  import { DB } from "$lib/DB/DB";
  import Item from "$lib/components/Item.svelte";

  import PageHeading from "../PageHeading.svelte";
  import { onMount } from "svelte";
  import { App } from "@capacitor/app";
  import { Capacitor } from "@capacitor/core";
  import Fab from "../FAB.svelte";
  import { safeArea } from "$lib/SafeArea.svelte";
  import { displayPrettyDate, sortByField } from "$lib";

  let { onclose, oncreate, onupdate } = $props();

  /** @type {import('$lib/DB/DB').Item[]}*/
  let items = $state([]);

  $effect(() => {
    const Db = DB.getInstance();
    Db.Item.data.then((data) => {
      let future = [];
      let past = [];
      let no_date = [];

      data = sortByField(data, "name", "asc");
      for (const item of data) {
        if (item.due_date) {
          if (new Date(item.due_date).setUTCHours(0, 0, 0, 0) < new Date().setUTCHours(0, 0, 0, 0)) {
            past.push(item);
          } else {
            future.push(item);
          }
        } else {
          no_date.push(item);
        }
      }

      past = sortByField(past, "due_date", "desc");
      future = sortByField(future, "due_date", "asc");

      items = [...past, ...future, ...no_date];
    });
  });

  onMount(() => {
    if (Capacitor.isNativePlatform()) {
      App.addListener("backButton", (event) => {
        onclose(event);
      });
    }

    return () => {
      App.removeAllListeners();
    };
  });
</script>

<div class="space-y-2 text-white">
  <PageHeading>Taak lys</PageHeading>

  <div class="mt-6 space-y-1.5">
    {#if items.length === 0}
      <div class="flex flex-col items-center gap-4 py-12">
        <div class="text-lg text-gray-400">Jou lys is skoon!</div>
        <button
          type="button"
          class="rounded-md bg-[#5b758e] px-12 py-6 flex justify-center items-center gap-2 text-sm font-medium text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
          onclick={oncreate}
        >
          <span class="h-5 w-5">{@render createIcon()}</span>
          <span class="text-[20px]">Skep 'n nuwe taak</span>
        </button>
      </div>
    {/if}

    {#each items as item, i (item.id)}
      {@const is_same_date = item.due_date === items[i - 1]?.due_date}
      {@const is_past_due = new Date(item.due_date).setUTCHours(0, 0, 0, 0) < new Date().setUTCHours(0, 0, 0, 0)}
      {@const is_still_past =
        i > 0 &&
        new Date(items[i - 1]?.due_date).setUTCHours(0, 0, 0, 0) < new Date().setUTCHours(0, 0, 0, 0) &&
        is_past_due}

      {#if is_past_due && !is_still_past}
        <div class="text-sm font-semibold pt-1 text-red-600">Verby</div>
      {/if}

      {#if !is_same_date && !is_past_due}
        <div class="text-gray-200 text-sm font-semibold pt-1">
          {displayPrettyDate(item.due_date) || "Geen datum"}
        </div>
      {/if}

      <div>
        {#key item.id}
          <Item
            {item}
            oncomplete={() => {
              const Db = DB.getInstance();
              Db.Item.delete(item.id);
              items = items.filter(({ id }) => id !== item.id);
            }}
            onclick={() => onupdate(item)}
          />
        {/key}
      </div>
    {/each}
  </div>
</div>

{#if !!items.length}
  <Fab
    onclick={oncreate}
    class="mb-6 mr-6 bg-[#5b758e] hover:bg-[#476480]"
    style="bottom: {safeArea.bottom}px; right: {safeArea.right}px"
  >
    {@render createIcon()}
  </Fab>
{/if}

{#snippet createIcon()}
  <svg class="text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" />
  </svg>
{/snippet}

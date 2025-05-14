<script>
  import { DB } from "$lib/DB/DB";
  import Item from "$lib/components/Item.svelte";

  import PageHeading from "$lib/components/PageHeading.svelte";
  import { onMount, tick } from "svelte";
  import { App } from "@capacitor/app";
  import { Capacitor } from "@capacitor/core";
  import Fab from "$lib/components/FAB.svelte";
  import { displayPrettyDate, sortByField } from "$lib";
  import { Loading, Plus } from "$lib/icon";
  import { goto } from "$app/navigation";
  import Undo from "$lib/components/Undo.svelte";

  let { onclose, oncreate } = $props();

  /** @type {import('$lib/DB/DB').Item[]}*/
  let items = $state([]);
  let id = $state("");
  let index = $state(0);

  $effect(() => {
    refresh();
  });

  async function refresh() {
    const Db = DB.getInstance();
    let data = await Db.Item.data;

    let future = [];
    let past = [];
    let no_date = [];

    data = data.filter(({ archived }) => !archived);
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

    items.push(...[...past, ...future, ...no_date]);
  }

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

  <!-- <Loading size={40} color="#fff" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> -->
  <div class="mt-6 space-y-1.5">
    {#if items.length === 0}
      <div class="flex flex-col items-center gap-4 py-12">
        <div class="text-lg text-gray-400">Jou lys is skoon!</div>
        <button
          type="button"
          class="rounded-md bg-[#5b758e] px-12 py-6 flex justify-center items-center gap-2 text-sm font-medium text-white transition-colors hover:bg-[#476480] focus:outline-none focus:ring-2 focus:ring-[#5b758e] focus:ring-offset-2"
          onclick={oncreate}
        >
          <Plus size={40} />
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

      <Item
        {item}
        oncomplete={async () => {
          index = items.findIndex(({ id }) => id === item.id);
          items.splice(index, 1);

          const Db = DB.getInstance();
          item.completed = true;
          await Db.Item.archive(item.id);
          await tick();

          id = item.id;
          setTimeout(() => {
            if (item.id !== id) return;
            id = "";
          }, 3000);
        }}
        onclick={() => goto(`/${item.id}`)}
      />
    {/each}
  </div>
</div>

{#if !!items.length}
  <Fab
    onclick={() => goto("/create")}
    class="bottom-6 right-6 bg-[#5b758e] hover:bg-[#476480]"
    area_label="Skep 'n nuwe taak"
  >
    <Plus />
  </Fab>
{/if}

<Undo
  show={!!id}
  onclick={async () => {
    const Db = DB.getInstance();
    const item = await Db.Item.read(id);
    if (!item) return;

    item.completed = false;
    item.archived = false;
    await Db.Item.update(id, item);
    id = "";
    items.splice(index, 0, item);
  }}
/>

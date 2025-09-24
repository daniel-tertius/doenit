<script>
  import { Edit, Clock, Check, Trash } from "$lib/icon";
  import { auth } from "$lib/services/auth.svelte";
  import { t } from "$lib/services/language.svelte";

  /**
   * @typedef {Object} Props
   * @property {string} name
   * @property {{ email: string, pending?: boolean }[]} users
   * @property {boolean} [selected=false]
   * @property {() => void} [onedit]
   * @property {() => void} [onremove]
   */

  /** @type {Props & Record<string, any>} */
  const { id, name, users, selected = false, onedit, onremove, ...rest } = $props();

  // Check if the card is pending (at least one user is pending)
  const pending = $derived(users.some((user) => user.pending));
  users.sort((a, b) => {
    if (a.pending === b.pending) return 0;
    return a.pending ? -1 : 1;
  });
</script>

<div
  class={[
    "p-4 border  w-full text-left rounded-md",
    !selected && !pending && "bg-surface border-default",
    selected && "bg-success/20! border border-success text-alt",
    pending && "bg-yellow-900/30 border border-yellow-600/50",
    rest.class || "",
  ]}
>
  <div class="flex justify-between items-center mb-2 gap-1">
    <div class="flex items-center gap-2 flex-1 min-w-0">
      {#if pending}
        <Clock class="text-yellow-500 flex-shrink-0" />
      {/if}

      <h2 class="text-lg font-semibold truncate">
        {name}
      </h2>
    </div>

    {#if !!onedit}
      <button type="button" class="p-1 -mr-1 -mt-1" aria-label={t("edit_room")}>
        <Edit
          onclick={onedit}
          class={[
            "p-1 text-3xl rounded-lg bg-card group-active:bg-success! group-active:text-muted!",
            selected && "bg-success! text-muted! ",
          ]}
        />
      </button>
    {:else if !!onremove && pending}
      <button type="button" class="p-1 -mr-1 -mt-1" aria-label={t("remove_room")}>
        <Trash onclick={onremove} class={["p-1 text-2xl rounded-lg text-alt bg-error group-active:text-muted!"]} />
      </button>
    {/if}
  </div>
  <div>
    {#if pending}
      <span class="text-yellow-500 text-sm font-normal">{t("pending")}</span>
    {/if}

    <div class="flex gap-2 overflow-x-auto scrollbar-none">
      {#each users as user}
        {#if user.email !== auth.user?.email}
          <span
            class={[
              "px-3 py-1 rounded-full h-fit text-sm flex border items-center gap-1.5",
              selected && !user.pending && "bg-success/30 border-success",
              selected && user.pending && "bg-yellow-600/70 ",
              !selected && !user.pending && "bg-card text-muted border-default",
              !selected && user.pending && "bg-yellow-800/50 text-yellow-300/80",
            ]}
          >
            {#if user.pending}
              <Clock class="text-lg flex-shrink-0" />
            {:else}
              <Check class="text-lg flex-shrink-0 text-alt" />
            {/if}
            <span class="truncate">{user.email}</span>
          </span>
        {/if}
      {/each}
    </div>
  </div>
</div>

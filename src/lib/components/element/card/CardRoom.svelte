<script>
  import { Edit, Clock, Check } from "$lib/icon";

  /**
   * @typedef {Object} Props
   * @property {string} name
   * @property {{ email: string, pending?: boolean }[]} users
   * @property {boolean} [selected=false]
   * @property {() => void} [onedit]
   */

  /** @type {Props & Record<string, any>} */
  const { name, users, selected = false, onedit, ...rest } = $props();

  // Check if the card is pending (at least one user is pending)
  const pending = $derived(users.some(user => user.pending));
  users.sort((a, b) => {
    if (a.pending === b.pending) return 0;
    return a.pending ? -1 : 1;
  });
</script>

<div
  class={[
    "p-4 bg-dark-400 w-full text-left rounded-md group-active:bg-green-700",
    selected && "bg-green-800 border border-green-400",
    pending && "bg-yellow-900/30 border border-yellow-600/50",
    rest.class || "",
  ]}
>
  <div class="flex justify-between items-center mb-2 gap-1">
    <div class="flex items-center gap-2 flex-1 min-w-0">
      {#if pending}
        <Clock size={20} class="text-yellow-500 flex-shrink-0" />
      {/if}
      <h2 class="text-lg font-semibold truncate">
        {name}
        {users.length > 1 ? `(${users.length})` : ""}
        {#if pending}
          <span class="text-yellow-500 text-sm font-normal">- Pending</span>
        {/if}
      </h2>
    </div>
    {#if !!onedit && !pending}
      <button type="button" class="p-1 -mr-1 -mt-1" aria-label="Edit Room">
        <Edit
          size={28}
          onclick={onedit}
          class={[
            "p-1 rounded-lg bg-dark-600 group-active:bg-green-600! group-active:text-dark-secondary!",
            selected && "bg-green-700! text-dark-secondary! ",
          ]}
        />
      </button>
    {/if}
  </div>
  <div class="flex gap-2 overflow-x-auto scrollbar-none">
    {#each users as user}
      <span
        class={[
          "px-3 py-1 rounded-full h-fit text-sm group-active:bg-green-600! group-active:text-dark-secondary! flex items-center gap-1.5",
          selected && !user.pending && "bg-green-600 text-dark-secondary",
          selected && user.pending && "bg-yellow-600/70 text-dark-secondary",
          !selected && !user.pending && "bg-dark-500 text-dark-secondary/70",
          !selected && user.pending && "bg-yellow-800/50 text-yellow-300/80",
        ]}
      >
        {#if user.pending}
          <Clock size={14} class="flex-shrink-0" />
        {:else}
          <Check size={14} class="flex-shrink-0 text-green-400" />
        {/if}
        <span class="truncate">{user.email}</span>
      </span>
    {/each}
  </div>
</div>

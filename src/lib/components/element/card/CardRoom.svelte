<script>
  import { Edit } from "$lib/icon";

  /**
   * @typedef {Object} Props
   * @property {string} name
   * @property {string[]} users
   * @property {boolean} [selected=false]
   * @property {() => void} [onedit]
   */

  /** @type {Props & Record<string, any>} */
  const { name, users, selected = false, onedit, ...rest } = $props();
</script>

<div
  class={[
    "p-4 bg-dark-400 w-full text-left rounded-md group-active:bg-green-700",
    selected && "bg-green-800 border border-green-400",
    rest.class || "",
  ]}
>
  <div class="flex justify-between items-center mb-2 gap-1">
    <h2 class="text-lg font-semibold truncate">{name} {users.length > 1 ? `(${users.length})` : ""}</h2>
    {#if !!onedit}
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
          "bg-dark-500 px-3 py-1 rounded-full h-fit text-sm text-dark-secondary/70 group-active:bg-green-600! group-active:text-dark-secondary!",
          selected && "bg-green-600 text-dark-secondary",
        ]}
      >
        {user}
      </span>
    {/each}
  </div>
</div>

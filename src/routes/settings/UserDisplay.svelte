<script>
  import { Loading } from "$lib/icon";
  import { auth } from "$lib/services/auth.svelte";
  import { slide } from "svelte/transition";
</script>

{#if !auth.is_loaded}
  <div class="relative flex justify-center h-10 bg-surface rounded-lg items-center p-4" transition:slide>
    <Loading />
  </div>
{:else if !!auth.user}
  <div class="relative flex flex-col bg-surface rounded-lg items-center p-4" transition:slide>
    <!-- Profile Picture -->
    <img src={auth.user.photoURL} alt="Profile" class="mb-4 w-24 h-24 rounded-full" referrerpolicy="no-referrer" />

    <!-- User Info -->
    <div class="text-center space-y-0.5">
      <h2 class="text-2xl font-semibold">
        {auth.user.displayName}
      </h2>
      <p class="text-sm text-muted">
        {auth.user.email}
      </p>
    </div>

    <button class="underline text-sm text-muted opacity-80 absolute top-1 right-2" onclick={() => auth.signOut()}>
      teken uit
    </button>
  </div>
{/if}

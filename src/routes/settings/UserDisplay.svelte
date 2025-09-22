<script>
  import { Loading } from "$lib/icon";
  import { auth } from "$lib/services/auth.svelte";
</script>

<div class="bg-surface rounded-lg items-center p-4 flex flex-col relative gap-4">
  {#if !auth.is_loaded}
    <Loading />
  {:else if !auth.is_logged_in}
    <div class="text-center space-y-0.5">
      <h2 class="text-2xl font-semibold">You are not logged in</h2>
      <p class="text-sm text-muted">Please log in to view your profile information.</p>
    </div>

    <button
      class="flex items-center bg-primary text-alt font-medium py-2 px-4 rounded-lg"
      onclick={() => auth.signInWithGoogle()}
    >
      Log in with Google
    </button>
  {:else if auth.user}
    <div class="flex justify-start gap-4 w-full">
      <!-- Profile Picture -->
      <img src={auth.user.photoURL} alt="Profile" class="w-13 h-13 my-auto rounded-full" referrerpolicy="no-referrer" />

      <!-- User Info -->
      <div class="space-y-0.5">
        <h2 class="text-2xl font-semibold">
          {auth.user.displayName}
        </h2>
        <p class="text-sm text-muted">
          {auth.user.email}
        </p>
      </div>

      <button class="underline text-sm text-muted opacity-80 absolute top-4 right-4" onclick={() => auth.signOut()}>
        teken uit
      </button>
    </div>
  {/if}
</div>

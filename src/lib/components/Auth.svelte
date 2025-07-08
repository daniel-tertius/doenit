<script>
  import { AuthService } from '$lib/services/auth';
  import { user, loading } from '$lib/services/auth';

  let email = '';
  let password = '';
  let isSignUp = false;
  let error = '';
  let isLoading = false;

  async function handleEmailAuth() {
    if (!email || !password) {
      error = 'Please enter email and password';
      return;
    }

    isLoading = true;
    error = '';

    try {
      if (isSignUp) {
        await AuthService.createAccount(email, password);
      } else {
        await AuthService.signInWithEmail(email, password);
      }
    } catch (err) {
      error = err.message || 'Authentication failed';
    } finally {
      isLoading = false;
    }
  }

  async function handleTestAuth() {
    isLoading = true;
    error = '';

    try {
      await AuthService.signInWithTestAccount();
    } catch (err) {
      error = err.message || 'Test account sign in failed';
    } finally {
      isLoading = false;
    }
  }

  async function handleAnonymousAuth() {
    isLoading = true;
    error = '';

    try {
      await AuthService.signInAnonymously();
    } catch (err) {
      error = err.message || 'Anonymous sign in failed';
    } finally {
      isLoading = false;
    }
  }

  async function handleSignOut() {
    try {
      await AuthService.signOut();
    } catch (err) {
      error = err.message || 'Sign out failed';
    }
  }
</script>

{#if $loading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4">Loading...</p>
    </div>
  </div>
{:else if $user}
  <!-- User is authenticated -->
  <div class="p-4">
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      <p><strong>Authenticated!</strong></p>
      <p>UID: {$user.uid}</p>
      <p>Email: {$user.email || 'Anonymous'}</p>
    </div>
    
    <button
      onclick={handleSignOut}
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Sign Out
    </button>
  </div>
{:else}
  <!-- Authentication form -->
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="max-w-md w-full space-y-8 p-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
      </div>
      
      <div class="space-y-4">
        <!-- Quick test button with test account -->
        <button
          onclick={handleTestAuth}
          disabled={isLoading}
          class="w-full bg-green-500 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Signing in...' : 'Quick Test (Demo Account)'}
        </button>
        
        <!-- Anonymous auth button (requires setup) -->
        <button
          onclick={handleAnonymousAuth}
          disabled={isLoading}
          class="w-full bg-blue-500 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
        >
          {isLoading ? 'Signing in...' : 'Anonymous Sign In'}
        </button>
        
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">Or use your own account</span>
          </div>
        </div>
        
        <!-- Email/Password form -->
        <form onsubmit={handleEmailAuth} class="space-y-4">
          <div>
            <input
              type="email"
              bind:value={email}
              placeholder="Email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <input
              type="password"
              bind:value={password}
              placeholder="Password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {#if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          {/if}
          
          <button
            type="submit"
            disabled={isLoading}
            class="w-full bg-green-500 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded"
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <button
          onclick={() => isSignUp = !isSignUp}
          class="w-full text-blue-500 hover:text-blue-700 text-sm"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
        
        <div class="text-xs text-gray-500 mt-4 p-3 bg-gray-100 rounded">
          <p><strong>Quick Start:</strong></p>
          <p>• Use "Demo Account" for instant testing (no setup required)</p>
          <p>• "Anonymous Sign In" requires enabling it in Firebase Console</p>
          <p>• Email auth requires enabling Email/Password in Firebase Console</p>
        </div>
      </div>
    </div>
  </div>
{/if}

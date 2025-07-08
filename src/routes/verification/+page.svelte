<script lang="ts">
  // import { AuthService } from "$lib/services/auth";
  // import { goto } from "$app/navigation";
  // import { Loading } from "$lib/icon";
  // import Google from "$lib/icon/Google.svelte";

  // let isLoading = false;
  // let error = "";
  // let verifiedEmail = "";
  // let isVerified = false;
  // let showSuccessMessage = false;

  // async function handleGoogleVerification() {
  //   isLoading = true;
  //   error = "";

  //   try {
  //     console.log("Starting Google verification...");

  //     // Check if GoogleAuth is available
  //     if (typeof window !== "undefined") {
  //       console.log("Running in browser environment");
  //     }

  //     const result = await AuthService.verifyEmailWithGoogle();
  //     console.log("Verification result:", result);

  //     if (result && result.email) {
  //       verifiedEmail = result.email;
  //       isVerified = result.isEmailVerified;
  //       showSuccessMessage = true;

  //       // Automatically sign out after verification
  //       setTimeout(async () => {
  //         await AuthService.signOut();
  //       }, 2000);
  //     } else {
  //       console.error("No result or email from verification");
  //       error = "Unable to retrieve email from Google account";
  //     }
  //   } catch (err: any) {
  //     console.error("Google verification error:", err);
  //     console.error("Error details:", {
  //       message: err.message,
  //       code: err.code,
  //       stack: err.stack,
  //     });

  //     // Handle specific error types
  //     if (err.code) {
  //       switch (err.code) {
  //         case "popup_closed_by_user":
  //         case "sign_in_cancelled":
  //           error = "Google sign-in was cancelled";
  //           break;
  //         case "network_error":
  //           error = "Network error. Please check your internet connection and try again.";
  //           break;
  //         case "sign_in_failed":
  //           error = "Google sign-in failed. Please try again.";
  //           break;
  //         case "auth/popup-blocked":
  //           error = "Popup was blocked by browser. Please allow popups and try again.";
  //           break;
  //         case "auth/operation-not-allowed":
  //           error = "Google Sign-In is not enabled. Please contact support.";
  //           break;
  //         default:
  //           error = `Authentication error: ${err.code}`;
  //       }
  //     } else if (err.message) {
  //       if (err.message.includes("popup_closed_by_user") || err.message.includes("sign_in_cancelled")) {
  //         error = "Google sign-in was cancelled";
  //       } else if (err.message.includes("network_error")) {
  //         error = "Network error. Please check your internet connection and try again.";
  //       } else if (err.message.includes("sign_in_failed")) {
  //         error = "Google sign-in failed. Please try again.";
  //       } else if (err.message.includes("GoogleAuth is not available")) {
  //         error = "Google Auth is not properly initialized. Please try reloading the page.";
  //       } else {
  //         error = err.message;
  //       }
  //     } else {
  //       error = "An unexpected error occurred. Please try again.";
  //     }
  //   } finally {
  //     isLoading = false;
  //   }
  // }

  // function handleContinue() {
  //   goto("/");
  // }

  // function handleTryAgain() {
  //   verifiedEmail = "";
  //   isVerified = false;
  //   showSuccessMessage = false;
  //   error = "";
  // }
</script>

<!-- <div class="flex-1 flex flex-col justify-center px-4 py-8">
  <div class="max-w-md mx-auto w-full">
    {#if !showSuccessMessage}
      <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
          <p class="text-gray-600 text-sm">
            Use your Google account to quickly verify your email address. We won't store any login information.
          </p>
        </div>

        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-md p-3">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        {/if}

        <button
          on:click={handleGoogleVerification}
          disabled={isLoading}
          class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if isLoading}
            <Loading />
            Verifying...
          {:else}
            <Google size={18} class="mr-3" />
            Continue with Google
          {/if}
        </button>

        <div class="text-center">
          <p class="text-xs text-gray-500">
            By continuing, you agree to verify your email address. No account will be created and you will be
            automatically signed out after verification.
          </p>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
          <p class="text-gray-600 text-sm mb-4">Your email address has been successfully verified.</p>
        </div>

        <div class="bg-gray-50 rounded-md p-4">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">Verified Email:</p>
            <p class="font-medium text-gray-900">{verifiedEmail}</p>
            {#if isVerified}
              <div class="flex items-center justify-center mt-2">
                <svg class="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-sm text-green-600">Email verified by Google</span>
              </div>
            {/if}
          </div>
        </div>

        <div class="space-y-3">
          <button
            on:click={handleContinue}
            class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continue
          </button>

          <button
            on:click={handleTryAgain}
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Verify Different Email
          </button>
        </div>
      </div>
    {/if}
  </div>
</div> -->

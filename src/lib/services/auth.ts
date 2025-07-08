import { auth } from "$lib/firebase";
import { signOut, GoogleAuthProvider, signInWithCredential, onAuthStateChanged, type User } from "firebase/auth";
import { writable } from "svelte/store";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { Capacitor } from "@capacitor/core";

// Svelte store for auth state
export const user = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state listener
onAuthStateChanged(auth, (firebaseUser) => {
  user.set(firebaseUser);
  loading.set(false);
});

export class AuthService {
  // Sign out
  static async signOut() {
    try {
      await signOut(auth);
      console.log("Sign out successful");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  }

  // Get current auth token
  static async getAuthToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("No authenticated user found");
      return null;
    }

    try {
      const token = await currentUser.getIdToken();
      alert("Auth token retrieved successfully");
      return token;
    } catch (error) {
      alert("Failed to get auth token:" + error + " " + JSON.stringify(error));
      return null;
    }
  }

  // Sign in with Google using Capacitor Google Auth
  static async signInWithGoogle() {
    try {
      console.log("Starting Google sign-in process...");
      console.log("Platform check - isNativePlatform:", Capacitor.isNativePlatform());

      // For now, let's try the same client ID for both platforms
      // You'll need to get the correct web client ID from Firebase Console
      const clientId = "546887238633-ke85anm6ka70ik3endt31pkq7fh570ag.apps.googleusercontent.com";

      // Initialize Google Auth
      if (Capacitor.isNativePlatform()) {
        console.log("Initializing GoogleAuth for native platform");
        await GoogleAuth.initialize({
          clientId: clientId,
          scopes: ["profile", "email"],
          grantOfflineAccess: true,
        });
      } else {
        console.log("Initializing GoogleAuth for web platform");
        // For web, we might need a different client ID
        // Check Firebase Console > Project Settings > General > Web apps
        await GoogleAuth.initialize({
          clientId: clientId, // This might need to be different for web
          scopes: ["profile", "email"],
          grantOfflineAccess: false,
        });
      }

      console.log("GoogleAuth initialized, starting sign in...");

      // Sign in with Google
      const googleUser = await GoogleAuth.signIn();

      // Validate the response
      if (!googleUser) {
        throw new Error("No user returned from Google sign-in");
      }

      if (!googleUser.authentication) {
        throw new Error("No authentication object returned from Google sign-in");
      }

      if (!googleUser.authentication.idToken) {
        throw new Error("No ID token returned from Google sign-in");
      }

      // Create Firebase credential from Google auth
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);

      // Sign in to Firebase with the credential
      const result = await signInWithCredential(auth, credential);
      console.log("Firebase sign in successful:", result.user);

      return {
        user: result.user,
        email: result.user.email,
        isEmailVerified: result.user.emailVerified,
      };
    } catch (error: any) {
      console.error("Google sign in failed:", error);

      // Enhanced error logging
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
      });

      // Handle specific error codes
      if (error.code === 10 || error.message?.includes("10")) {
        const enhancedError = new Error(
          "Google Sign-In configuration error (Code 10):\n\n" +
            "This usually means:\n" +
            "• Missing or incorrect SHA-1 fingerprint in Firebase Console\n" +
            "• Wrong client ID for the platform\n" +
            "• Package name mismatch in Firebase project\n" +
            "• Outdated google-services.json file\n\n" +
            "Please check GOOGLE_AUTH_TROUBLESHOOTING.md for detailed fix steps."
        );
        enhancedError.name = "GoogleAuthConfigError";
        throw enhancedError;
      }

      // Handle other common error codes
      if (error.code === 12501 || error.message?.includes("12501")) {
        throw new Error("Google Sign-In was cancelled by user");
      }

      if (error.code === 7 || error.message?.includes("7")) {
        throw new Error("Network error. Please check your internet connection.");
      }

      throw error;
    }
  }

  // Simple Google verification using Capacitor Google Auth
  static async verifyEmailWithGoogle() {
    try {
      console.log("Starting Google email verification...");

      const result = await this.signInWithGoogle();

      return {
        email: result.email,
        isEmailVerified: result.isEmailVerified,
        user: result.user,
      };
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  }
}

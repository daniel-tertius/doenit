import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, type User } from "firebase/auth";
import { writable } from "svelte/store";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { PUBLIC_GOOGLE_AUTH } from "$env/static/public";
import { t } from "$lib/services/language.svelte";

// Svelte store for auth state
export const user = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state listener
onAuthStateChanged(auth, (firebaseUser) => {
  user.set(firebaseUser);
  loading.set(false);
});

export async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    return currentUser.getIdToken();
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

export async function signInWithGoogle() {
  try {
    await GoogleAuth.initialize({
      clientId: PUBLIC_GOOGLE_AUTH,
    });

    const googleUser = await GoogleAuth.signIn();
    if (!googleUser) {
      throw new Error("No user returned from Google sign-in");
    }

    if (!googleUser.authentication) {
      throw new Error("No authentication object returned from Google sign-in");
    }

    if (!googleUser.authentication.idToken) {
      throw new Error("No ID token returned from Google sign-in");
    }

    const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
    const result = await signInWithCredential(auth, credential);

    return {
      user: result.user,
      email: result.user.email,
      isEmailVerified: result.user.emailVerified,
    };
  } catch (error: any) {
    alert(t("google_verification_failed") + " " + error.error);
    return {};
  }
}

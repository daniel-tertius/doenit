import { GoogleAuthProvider, signInWithCredential, signOut, getAuth } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import type { User } from "firebase/auth";
import { getApp, initializeApp } from "firebase/app";
import { PUBLIC_GOOGLE_AUTH } from "$env/static/public";
import { t } from "$lib/services/language.svelte";
import { Capacitor } from "@capacitor/core";
import { FIREBASE_CONFIG } from "$lib";

class Auth {
  user: User | null = $state(null);
  is_loaded = $state(false);
  is_logged_in = $derived(this.is_loaded && !!this.user);

  async init() {
    const app = initializeApp(FIREBASE_CONFIG);

    const auth = getAuth(app);

    return new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        this.user = user;
        unsubscribe();
        resolve();
      });
    });
  }

  constructor() {
    try {
      const app = initializeApp(FIREBASE_CONFIG);

      if (Capacitor.isNativePlatform()) {
        const auth = getAuth(app);
        auth.onAuthStateChanged((user) => {
          if (!user) return;
          this.user = user;
        });
      } else {
        // @ts-ignore
        this.user = {
          displayName: "John Doe",
          email: "john.doe@example.com",
          photoURL: "https://i.pravatar.cc/300",
        };
      }

      if (Capacitor.isNativePlatform()) {
        FirebaseAuthentication.useAppLanguage();
        GoogleAuth.initialize({
          clientId: PUBLIC_GOOGLE_AUTH,
        });
      }
      this.is_loaded = true;
    } catch (error) {
      console.error("[Doenit]: Firebase initialization error:", error);
      this.is_loaded = true;
      throw error;
    }
  }

  getUser(): User | null {
    return this.user;
  }

  async getAuthToken(): Promise<string> {
    if (!this.user) throw Error("User not signed in");

    return this.user.getIdToken();
  }

  async signInWithGoogle(): Promise<SimpleResult> {
    try {
      if (!Capacitor.isNativePlatform()) {
        // @ts-ignore
        this.user = {
          displayName: "John Doe",
          email: "john.doe@example.com",
          photoURL: "https://i.pravatar.cc/300",
        };
        return { success: true };
      }
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
      const auth = getAuth(getApp());
      const result = await signInWithCredential(auth, credential);
      this.user = result.user;

      return { success: true };
    } catch (error: any) {
      console.error("[Doenit]: Google sign-in error:", error);
      alert(`${t("google_verification_failed")} ${error}`);
      return { success: false, error_message: error.message || "Unknown error" };
    }
  }

  async signOut() {
    try {
      if (Capacitor.isNativePlatform()) {
        const auth = getAuth(getApp());
        await signOut(auth);
        await GoogleAuth.signOut();
      }
      this.user = null;
      return { success: true };
    } catch (error) {
      console.error("[Doenit]: Sign-out error:", error);
      alert(`Sign-out error: ${error || JSON.stringify(error)}`);
      return { success: false, error_message: error || "Unknown error" };
    }
  }

  getUserID(): string | null {
    const user = this.getUser();
    if (!user) return null;

    return user.uid;
  }
}

export const auth = new Auth();

import { GoogleAuthProvider, signInWithCredential, signOut, getAuth } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import type { Auth as FirebaseAuth, User } from "firebase/auth";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { PUBLIC_GOOGLE_AUTH } from "$env/static/public";
import { t } from "$lib/services/language.svelte";
import { Capacitor } from "@capacitor/core";
import {
  PUBLIC_FIREBASE_API_KEY,
  PUBLIC_FIREBASE_AUTH_DOMAIN,
  PUBLIC_FIREBASE_PROJECT_ID,
  PUBLIC_FIREBASE_STORAGE_BUCKET,
  PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  PUBLIC_FIREBASE_APP_ID,
} from "$env/static/public";
import Backup from "./backup.svelte";
import Files from "./files.svelte";
import { getStorage } from "firebase/storage";

class Auth {
  private readonly CONFIG = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
  };

  readonly app: FirebaseApp;
  readonly auth: FirebaseAuth;
  user: User | null = $state(null);
  is_loaded = $state(false);
  backup: Backup | null = $state(null);
  files: Files | null = $state(null);

  constructor() {
    try {
      this.app = initializeApp(this.CONFIG);
      this.auth = getAuth(this.app);
      if (Capacitor.isNativePlatform()) {
        this.auth.onAuthStateChanged((user) => {
          if (!user) return;

          this.user = user;
          const storage = getStorage(this.app);
          this.files = new Files(storage, this.user);
          this.backup = new Backup(this.files, this.user);
        });
      } else {
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

  async getAuthToken(): Promise<string> {
    if (!this.user) throw Error("User not signed in");

    return this.user.getIdToken();
  }

  async signInWithGoogle(): Promise<SimpleResult> {
    try {
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
      const result = await signInWithCredential(this.auth, credential);
      this.user = result.user;

      const storage = getStorage(this.app);
      this.files = new Files(storage, this.user);
      this.backup = new Backup(this.files, this.user);

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
        await signOut(this.auth);
        await GoogleAuth.signOut();
      }
      this.user = null;
      this.files = null;
      this.backup = null;
      return { success: true };
    } catch (error) {
      console.error("[Doenit]: Sign-out error:", error);
      alert(`Sign-out error: ${error || JSON.stringify(error)}`);
      return { success: false, error_message: error || "Unknown error" };
    }
  }
}

export const auth = new Auth();

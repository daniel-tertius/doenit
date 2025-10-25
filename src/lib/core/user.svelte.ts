import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { PUBLIC_ADMIN_EMAILS, PUBLIC_GOOGLE_AUTH } from "$env/static/public";
import { getApp, initializeApp } from "$lib/chunk/firebase-app";
import { t } from "$lib/services/language.svelte";
import { FIREBASE_CONFIG, normalize } from "$lib";
import { Capacitor } from "@capacitor/core";
import {
  getAuth,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { Value } from "$lib/utils.svelte";
import { Cached } from "./cache.svelte";

class User {
  private _user = $state() as FirebaseUser;
  private _message_token: string | null = $state(null);

  readonly is_friends_enabled: boolean = $derived(!!this._user && PUBLIC_ADMIN_EMAILS.includes(this._user?.email || ""));
  readonly is_backup_enabled: boolean = $derived(!!this._user && !!Cached.automaticBackup.value);

  constructor(user: FirebaseUser) {
    this._user = user;
  }

  get name(): string {
    return this._user.displayName || this._user.email || "";
  }

  get email(): string {
    return normalize(this._user.email ?? "");
  }

  get id_token() {
    return this._user.getIdToken();
  }

  get avatar(): string {
    return this._user.photoURL ?? "";
  }

  get uid(): string {
    return this._user.uid ?? "";
  }

  get message_token(): string | null {
    return this._message_token;
  }

  set message_token(token: string | null) {
    if (token === this._message_token) return;

    this._message_token = token;
  }
}

const UserValue = new Value<User>();

export default UserValue;

initializeUser();
function initializeUser() {
  const app = initializeApp(FIREBASE_CONFIG);
  if (Capacitor.isNativePlatform()) {
    const auth = getAuth(app);
    auth.onAuthStateChanged((user) => {
      if (!user) {
        UserValue.value = null;
      } else {
        UserValue.value = new User(user);
      }
    });
  }
}

export async function signIn(): Promise<SimpleResult> {
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

    await GoogleAuth.initialize({ clientId: PUBLIC_GOOGLE_AUTH });
    const gu = await GoogleAuth.signIn();
    if (!gu) throw new Error(t("sign_in_error_no_user"));

    if (!gu.authentication) {
      throw new Error(t("sign_in_error_no_auth"));
    }

    const id_token = gu.authentication.idToken;
    if (!id_token) throw new Error(t("sign_in_error_no_idtoken"));

    const credential = GoogleAuthProvider.credential(id_token);
    const auth = getAuth(getApp());
    await signInWithCredential(auth, credential);

    return { success: true };
  } catch (error: any) {
    return { success: false, error_message: `${t("google_verification_failed")} ${error}` };
  }
}

export async function signOut(): Promise<SimpleResult> {
  try {
    if (Capacitor.isNativePlatform()) {
      await firebaseSignOut(getAuth(getApp()));
      await GoogleAuth.initialize({ clientId: PUBLIC_GOOGLE_AUTH });
      await GoogleAuth.signOut();
    }
    UserValue.value = null;
    return { success: true };
  } catch (error) {
    return { success: false, error_message: `Sign-out error: ${error || JSON.stringify(error)}` };
  }
}

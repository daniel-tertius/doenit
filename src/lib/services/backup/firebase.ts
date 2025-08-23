import { initializeApp } from "firebase/app";
import { getAuth, type User } from "firebase/auth";
import { browser } from "$app/environment";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyCH5uvUSpZ-mkhHw9EK0QnZ_c01hE5ERzs",
  authDomain: "doenit2.firebaseapp.com",
  projectId: "doenit2",
  storageBucket: "",
  messagingSenderId: "546887238633",
  appId: "1:546887238633:android:158790fc0e5e2e7873c178",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Capacitor Firebase Authentication
if (Capacitor.isNativePlatform()) {
  FirebaseAuthentication.useAppLanguage();
}

// Firebase Cloud Functions URLs (from deployment output)
export const FUNCTIONS_URLS = {
  createBackup: "https://createbackup-moz6pj6djq-uc.a.run.app",
  restoreBackup: "https://restorebackup-moz6pj6djq-uc.a.run.app",
};

// Auth state management
let currentUser: User | null = null;

if (browser) {
  auth.onAuthStateChanged((user) => {
    currentUser = user;
  });
}

export function getCurrentUser(): User | null {
  return currentUser;
}

export async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  try {
    const token = await currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

import { initializeApp } from "firebase/app";
import { getAuth, type User } from "firebase/auth";
import { browser } from "$app/environment";

// Your Firebase config object
const firebaseConfig = {
  // Replace with your Firebase project configuration
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

// Firebase Cloud Functions URLs (from deployment output)
export const FUNCTIONS_URLS = {
  getTasks: "https://gettasks-moz6pj6djq-uc.a.run.app",
  createTask: "https://createtask-moz6pj6djq-uc.a.run.app",
  updateTask: "https://updatetask-moz6pj6djq-uc.a.run.app",
  deleteTask: "https://deletetask-moz6pj6djq-uc.a.run.app",
  getCategories: "https://getcategories-moz6pj6djq-uc.a.run.app",
  createCategory: "https://createcategory-moz6pj6djq-uc.a.run.app",
  createBackup: "https://createbackup-moz6pj6djq-uc.a.run.app",
  restoreBackup: "https://restorebackup-moz6pj6djq-uc.a.run.app",
};

// Auth state management
let currentUser: User | null = null;
let authReady = false;

if (browser) {
  console.log("auth", auth);
  auth.onAuthStateChanged((user) => {
    console.log("Auth state changed:", user);
    currentUser = user;
    authReady = true;
  });
}

export function getCurrentUser(): User | null {
  return currentUser;
}


export async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log('No authenticated user found');
    return null;
  }
  
  try {
    const token = await currentUser.getIdToken();
    console.log('Auth token retrieved successfully');
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { auth } from '../firebase';
import { writable } from 'svelte/store';

// Svelte store for auth state
export const user = writable<User | null>(null);
export const loading = writable(true);

// Initialize auth state listener
onAuthStateChanged(auth, (firebaseUser) => {
  console.log('Auth state changed:', firebaseUser);
  user.set(firebaseUser);
  loading.set(false);
});

export class AuthService {
  // Create or sign in with a test account (for development)
  static async signInWithTestAccount() {
    const testEmail = 'test@doenit.app';
    const testPassword = 'testpassword123';
    
    try {
      // Try to sign in first
      const result = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('Test account sign in successful:', result.user);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user doesn't exist, create the account
        try {
          const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          console.log('Test account created successfully:', result.user);
          return result.user;
        } catch (createError) {
          console.error('Test account creation failed:', createError);
          throw createError;
        }
      } else {
        console.error('Test account sign in failed:', error);
        throw error;
      }
    }
  }

  // Sign in anonymously (for testing without requiring email/password)
  static async signInAnonymously() {
    try {
      const result = await signInAnonymously(auth);
      console.log('Anonymous sign in successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Anonymous sign in failed:', error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email sign in successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Email sign in failed:', error);
      throw error;
    }
  }

  // Create account with email and password
  static async createAccount(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account creation successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Account creation failed:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      await signOut(auth);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  // Get current auth token
  static async getAuthToken(): Promise<string | null> {
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
}

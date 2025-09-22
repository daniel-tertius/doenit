import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { FIREBASE_CONFIG, normalize } from "$lib";
import { auth } from "$lib/services/auth.svelte";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  fcmToken?: string;
  lastActive: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class UserProfileService {
  private profilesCollection = collection(db, "userProfiles");

  /**
   * Create or update user profile
   */
  async createOrUpdateProfile(): Promise<SimpleResult> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) {
        return { success: false, error_message: "User not authenticated" };
      }

      const profileDoc = doc(this.profilesCollection, user.email.toLowerCase());
      const existingProfile = await getDoc(profileDoc);

      const now = Timestamp.now();

      if (existingProfile.exists()) {
        // Update existing profile
        await updateDoc(profileDoc, {
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || null,
          lastActive: now,
          updatedAt: now,
        });
      } else {
        // Create new profile
        const profileData: UserProfile = {
          email: user.email.toLowerCase(),
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || undefined,
          lastActive: now,
          createdAt: now,
          updatedAt: now,
        };

        await setDoc(profileDoc, profileData);
      }

      return { success: true };
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      return { success: false, error_message: "Failed to update profile" };
    }
  }

  /**
   * Get user profile by email
   */
  async getProfile(email: string): Promise<UserProfile | null> {
    try {
      const profileDoc = doc(this.profilesCollection, email.toLowerCase());
      const profileSnapshot = await getDoc(profileDoc);

      if (profileSnapshot.exists()) {
        return profileSnapshot.data() as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting profile:", error);
      return null;
    }
  }

  /**
   * Update FCM token for push notifications
   */
  async updateFCMToken(token: string): Promise<void> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) return;

      const profileDoc = doc(this.profilesCollection, user.email.toLowerCase());
      await updateDoc(profileDoc, {
        fcmToken: token,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating FCM token:", error);
    }
  }

  /**
   * Get FCM token for a user (for sending notifications)
   */
  async getFCMToken(email: string): Promise<string | null> {
    try {
      const profile = await this.getProfile(email);
      return profile?.fcmToken || null;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(): Promise<void> {
    try {
      const user = auth.getUser();
      if (!user || !user.email) return;

      const profileDoc = doc(this.profilesCollection, normalize(user.email));
      await updateDoc(profileDoc, {
        lastActive: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating last active:", error);
    }
  }

  /**
   * Check if user exists by email
   */
  async userExists(email: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(email);
      return profile !== null;
    } catch (error) {
      console.error("Error checking if user exists:", error);
      return false;
    }
  }

  /**
   * Search users by email (for invite system)
   */
  async searchUsers(emailQuery: string): Promise<UserProfile[]> {
    try {
      const email_address = normalize(emailQuery);
      // Note: Firestore doesn't support case-insensitive queries or partial matches
      // This is a basic implementation that requires exact matches
      const q = query(this.profilesCollection, where("email", "==", email_address));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as UserProfile);
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }
}

export const userProfileService = new UserProfileService();

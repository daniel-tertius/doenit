import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
});

// CORS configuration - Allow localhost and Capacitor app origins
const corsHandler = cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:4173", // Vite preview
    "http://localhost:3000", // Alternative dev port
    "http://localhost:8080", // Common dev port
    "http://localhost:8100", // Ionic/Capacitor dev port
    "capacitor://localhost", // Capacitor iOS
    "http://localhost", // Capacitor Android
    "https://localhost", // HTTPS localhost
    /^capacitor:\/\/.*$/, // Any capacitor protocol
    /^https:\/\/.*\.firebaseapp\.com$/, // Firebase hosting
    /^https:\/\/.*\.web\.app$/, // Firebase web app
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 200,
});

// Helper function to verify Firebase ID token
async function verifyToken(idToken: string) {
  try {
    return admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid token");
  }
}

// Backup functions
// Send Push Notification function
export const sendPushNotification = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      // Auth header (optional, but recommended)
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      await verifyToken(idToken); // Throws if invalid

      // Get notification details from body
      const { token, title, body } = req.body;
      if (!token) {
        res.status(400).json({ error: "Missing token" });
        return;
      }

      // Send notification using firebase-admin
      await admin.messaging().send({
        token: token,
        notification: {
          title: title || "Doenit Kennisgewing",
          body: body || "U het 'n nuwe kennisgewing",
        },
      });

      res.json({ success: true });
    } catch (error) {
      const error_message = error instanceof Error ? error.message : String(error);
      console.error("Fout met stuur van push notification:", error_message);
      res.status(500).json({ error: error_message });
    }
  });
});

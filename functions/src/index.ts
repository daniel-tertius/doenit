import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { MongoClient, Db } from "mongodb";
import * as cors from "cors";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
admin.initializeApp();

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
    /^http:\/\/localhost:\d+$/, // Any localhost port
    /^https:\/\/.*\.firebaseapp\.com$/, // Firebase hosting
    /^https:\/\/.*\.web\.app$/, // Firebase web app
    true, // Allow any origin in development
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 200,
});

// MongoDB connection
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(uri);
  await client.connect();

  const dbName = process.env.MONGODB_DB_NAME || "DoenitDB";
  cachedDb = client.db(dbName);

  return cachedDb;
}

// Helper function to verify Firebase ID token
async function verifyToken(idToken: string) {
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid token");
  }
}

// Backup functions
export const createBackup = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyToken(idToken);
      const userId = decodedToken.uid;

      const db = await connectToDatabase();

      const backup = {
        userId,
        tasks: req.body.tasks,
        categories: req.body.categories,
        createdAt: new Date(),
        version: "1.0",
      };

      const previous_backup = await db.collection("backups").findOne({ userId });
      let result;
      if (previous_backup) {
        // Update existing backup
        result = await db
          .collection("backups")
          .updateOne(
            { userId },
            { $set: { tasks: backup.tasks, categories: backup.categories, createdAt: backup.createdAt } }
          );

        // For updateOne, check if the operation was successful
        if (result.matchedCount > 0) {
          res.json({ success: true });
        } else {
          res.status(500).json({ error: "Failed to update backup" });
        }
      } else {
        result = await db.collection("backups").insertOne(backup);

        // For insertOne, check if the document was inserted
        if (result.insertedId) {
          res.json({ success: true });
        } else {
          res.status(500).json({ error: "Failed to create backup" });
        }
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export const restoreBackup = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyToken(idToken);
      const userId = decodedToken.uid;

      const db = await connectToDatabase();

      const backup = await db.collection("backups").findOne({ userId });
      if (!backup) {
        res.status(404).json({ error: "Backup not found" });
        return;
      }

      res.json({
        success: true,
        data: { tasks: backup.tasks, categories: backup.categories },
      });
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

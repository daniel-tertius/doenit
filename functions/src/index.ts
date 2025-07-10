import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { MongoClient, Db } from "mongodb";
import * as cors from "cors";
import * as dotenv from "dotenv";
import * as CryptoJS from "crypto-js";
import * as pako from "pako";

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

// Helper functions for encryption and compression
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return key;
}

function compressAndEncrypt(data: any): string {
  try {
    // Convert data to JSON string
    const jsonString = JSON.stringify(data);
    
    // Compress the data
    const compressed = pako.gzip(jsonString);
    
    // Convert compressed data to base64
    const compressedBase64 = Buffer.from(compressed).toString('base64');
    
    // Encrypt the compressed data
    const encrypted = CryptoJS.AES.encrypt(compressedBase64, getEncryptionKey()).toString();
    
    return encrypted;
  } catch (error) {
    console.error("Error compressing and encrypting data:", error);
    throw new Error("Failed to compress and encrypt data");
  }
}

function decryptAndDecompress(encryptedData: string): any {
  try {
    // Decrypt the data
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
    const compressedBase64 = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    // Convert base64 back to buffer
    const compressed = Buffer.from(compressedBase64, 'base64');
    
    // Decompress the data
    const decompressed = pako.ungzip(compressed, { to: 'string' });
    
    // Parse JSON
    return JSON.parse(decompressed);
  } catch (error) {
    console.error("Error decrypting and decompressing data:", error);
    throw new Error("Failed to decrypt and decompress data");
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

      const backupData = {
        tasks: req.body.tasks,
        categories: req.body.categories,
      };

      // Compress and encrypt the backup data
      const encryptedData = compressAndEncrypt(backupData);

      const backup = {
        userId,
        data: encryptedData,
        createdAt: new Date(),
        version: "2.0", // Updated version to indicate encrypted format
      };

      const previous_backup = await db.collection("backups").findOne({ userId });
      let result;
      if (previous_backup) {
        // Update existing backup
        result = await db
          .collection("backups")
          .updateOne(
            { userId },
            { $set: { data: backup.data, createdAt: backup.createdAt, version: backup.version } }
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

      let tasks, categories;

      // Check if backup is encrypted (version 2.0+) or legacy format
      if (backup.version === "2.0" && backup.data) {
        try {
          // Decrypt and decompress the data
          const decryptedData = decryptAndDecompress(backup.data);
          tasks = decryptedData.tasks;
          categories = decryptedData.categories;
        } catch (error) {
          console.error("Error decrypting backup data:", error);
          res.status(500).json({ error: "Failed to decrypt backup data" });
          return;
        }
      } else {
        // Legacy backup format (unencrypted)
        tasks = backup.tasks;
        categories = backup.categories;
      }

      res.json({
        success: true,
        data: { tasks, categories },
      });
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

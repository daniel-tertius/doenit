import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { MongoClient, Db, ObjectId } from "mongodb";
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

// CRUD operations for tasks
export const getTasks = functions.https.onRequest(async (req, res) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
    res.set("Access-Control-Max-Age", "3600");
    res.status(200).send("");
    return;
  }

  return corsHandler(req, res, async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyToken(idToken);
      const userId = decodedToken.uid;

      const db = await connectToDatabase();
      const tasks = await db.collection("tasks").find({ userId }).toArray();

      res.json({ success: true, data: tasks });
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export const createTask = functions.https.onRequest(async (req, res) => {
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
    res.set("Access-Control-Max-Age", "3600");
    res.status(200).send("");
    return;
  }

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

      const { title, description, category, priority, dueDate } = req.body;

      const db = await connectToDatabase();
      const newTask = {
        userId,
        title,
        description,
        category,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("tasks").insertOne(newTask);

      res.json({
        success: true,
        data: { ...newTask, _id: result.insertedId },
      });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export const updateTask = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "PUT") {
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

      const { taskId, ...updates } = req.body;

      if (!taskId) {
        res.status(400).json({ error: "Task ID is required" });
        return;
      }

      const db = await connectToDatabase();

      // Add updatedAt timestamp
      updates.updatedAt = new Date();

      const result = await db.collection("tasks").updateOne({ _id: new ObjectId(taskId), userId }, { $set: updates });

      if (result.matchedCount === 0) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.json({ success: true, message: "Task updated successfully" });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export const deleteTask = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "DELETE") {
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

      const { taskId } = req.body;

      if (!taskId) {
        res.status(400).json({ error: "Task ID is required" });
        return;
      }

      const db = await connectToDatabase();
      const result = await db.collection("tasks").deleteOne({ _id: new ObjectId(taskId), userId });

      if (result.deletedCount === 0) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

// Categories CRUD
export const getCategories = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await verifyToken(idToken);
      const userId = decodedToken.uid;

      const db = await connectToDatabase();
      const categories = await db.collection("categories").find({ userId }).toArray();

      res.json({ success: true, data: categories });
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

export const createCategory = functions.https.onRequest(async (req, res) => {
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

      const { name, color } = req.body;

      const db = await connectToDatabase();
      const newCategory = {
        userId,
        name,
        color,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("categories").insertOne(newCategory);

      res.json({
        success: true,
        data: { ...newCategory, _id: result.insertedId },
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

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
      console.log("Creating backup for user:", userId);

      // Get all user data
      const tasks = await db.collection("tasks").find().toArray();
      const categories = await db.collection("categories").find().toArray();
      console.log("Tasks:", tasks);

      const backup = {
        userId,
        tasks,
        categories,
        createdAt: new Date(),
        version: "1.0",
      };

      const result = await db.collection("backups").insertOne(backup);

      res.json({
        success: true,
        data: { backupId: result.insertedId, createdAt: backup.createdAt },
      });
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

      const { backupId } = req.body;

      const db = await connectToDatabase();

      // Get backup data
      const backup = await db.collection("backups").findOne({ _id: new ObjectId(backupId), userId });

      if (!backup) {
        res.status(404).json({ error: "Backup not found" });
        return;
      }

      // Clear existing data
      await db.collection("tasks").deleteMany({ userId });
      await db.collection("categories").deleteMany({ userId });

      // Restore data
      if (backup.tasks && backup.tasks.length > 0) {
        await db.collection("tasks").insertMany(backup.tasks);
      }

      if (backup.categories && backup.categories.length > 0) {
        await db.collection("categories").insertMany(backup.categories);
      }

      res.json({ success: true, message: "Backup restored successfully" });
    } catch (error) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

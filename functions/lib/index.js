"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreBackup = exports.createBackup = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const mongodb_1 = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
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
let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI environment variable is not set");
    }
    const client = new mongodb_1.MongoClient(uri);
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || "DoenitDB";
    cachedDb = client.db(dbName);
    return cachedDb;
}
// Helper function to verify Firebase ID token
async function verifyToken(idToken) {
    try {
        return await admin.auth().verifyIdToken(idToken);
    }
    catch (error) {
        throw new functions.https.HttpsError("unauthenticated", "Invalid token");
    }
}
// Backup functions
exports.createBackup = functions.https.onRequest(async (req, res) => {
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
            console.log("CreateBackup - userId:", userId);
            const db = await connectToDatabase();
            console.log("CreateBackup - request body:", req.body);
            console.log("CreateBackup - request body type:", typeof req.body);
            console.log("CreateBackup - request body tasks:", req.body.tasks);
            console.log("CreateBackup - request body categories:", req.body.categories);
            // Get all user data
            // const tasks = JSON.parse(req.body.tasks || "[]");
            // const categories = JSON.parse(req.body.categories || "[]");
            // console.log("CreateBackup - tasks count:", tasks.length);
            // console.log("CreateBackup - categories count:", categories.length);
            const backup = {
                userId,
                tasks: req.body.tasks,
                categories: req.body.categories,
                createdAt: new Date(),
                version: "1.0",
            };
            const previous_backup = await db.collection("backups").findOne({ userId });
            console.log("CreateBackup - previous backup exists:", !!previous_backup);
            let result;
            if (previous_backup) {
                // Update existing backup
                result = await db
                    .collection("backups")
                    .updateOne({ userId }, { $set: { tasks: backup.tasks, categories: backup.categories, createdAt: backup.createdAt } });
                // For updateOne, check if the operation was successful
                if (result.matchedCount > 0) {
                    console.log("CreateBackup - backup updated successfully");
                    res.json({ success: true });
                }
                else {
                    console.log("CreateBackup - failed to update backup, matchedCount:", result.matchedCount);
                    res.status(500).json({ error: "Failed to update backup" });
                }
            }
            else {
                result = await db.collection("backups").insertOne(backup);
                // For insertOne, check if the document was inserted
                if (result.insertedId) {
                    console.log("CreateBackup - backup created successfully, insertedId:", result.insertedId);
                    res.json({ success: true });
                }
                else {
                    console.log("CreateBackup - failed to create backup");
                    res.status(500).json({ error: "Failed to create backup" });
                }
            }
        }
        catch (error) {
            console.error("Error creating backup:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
});
exports.restoreBackup = functions.https.onRequest(async (req, res) => {
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
            console.log("RestoreBackup - userId:", userId);
            const db = await connectToDatabase();
            // Get backup data
            const backup = await db.collection("backups").findOne({ userId });
            console.log("RestoreBackup - backup found:", !!backup);
            if (!backup) {
                console.log("RestoreBackup - no backup found for userId:", userId);
                res.status(404).json({ error: "Backup not found" });
                return;
            }
            console.log("RestoreBackup - returning backup data");
            res.json({
                success: true,
                data: { tasks: backup.tasks, categories: backup.categories },
            });
        }
        catch (error) {
            console.error("Error restoring backup:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
});
//# sourceMappingURL=index.js.map
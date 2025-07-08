# Firebase Cloud Functions with MongoDB Setup

This setup allows your Capacitor/SvelteKit app to connect to MongoDB through Firebase Cloud Functions.

## Prerequisites

1. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. **MongoDB Atlas**: Set up a MongoDB cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
3. **Firebase CLI**: Install with `npm install -g firebase-tools`

## Setup Steps

### 1. Configure Firebase

1. Replace the Firebase config in `src/lib/firebase.ts` with your project's configuration
2. Update `.firebaserc` with your Firebase project ID
3. Login to Firebase: `firebase login`

### 2. Configure MongoDB

1. Copy `functions/.env.example` to `functions/.env`
2. Update the MongoDB connection string in `functions/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB_NAME=doenit
   ```

### 3. Set Environment Variables in Firebase

Set your MongoDB URI in Firebase Functions environment:
```bash
firebase functions:config:set mongodb.uri="mongodb+srv://username:password@cluster.mongodb.net/"
firebase functions:config:set mongodb.db_name="doenit"
```

### 4. Deploy Functions

```bash
cd functions
npm run build
firebase deploy --only functions
```

### 5. Update Frontend Configuration

After deployment, update the `FUNCTIONS_BASE_URL` in `src/lib/firebase.ts` with your deployed functions URL:
```
https://your-region-your-project-id.cloudfunctions.net
```

## API Endpoints

The following endpoints are available:

- `GET /getTasks` - Get all tasks for authenticated user
- `POST /createTask` - Create a new task
- `PUT /updateTask/{id}` - Update a specific task
- `DELETE /deleteTask/{id}` - Delete a specific task
- `GET /getCategories` - Get all categories for authenticated user
- `POST /createCategory` - Create a new category
- `POST /createBackup` - Create a backup of user data
- `POST /restoreBackup` - Restore from a backup

## Authentication

All endpoints require Firebase Authentication. The frontend automatically includes the auth token in requests.

## Database Schema

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: string,
  title: string,
  description: string,
  category: string,
  priority: string,
  dueDate: Date,
  completed: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  userId: string,
  name: string,
  color: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Backups Collection
```javascript
{
  _id: ObjectId,
  userId: string,
  tasks: Array,
  categories: Array,
  createdAt: Date,
  version: string
}
```

## Usage in Components

Import and use the API service:

```javascript
import { api } from '$lib/services/api';

// Get tasks
const tasks = await api.getTasks();

// Create task
await api.createTask({
  title: 'New Task',
  description: 'Task description',
  category: 'work',
  priority: 'high'
});
```

## Security

- All requests require Firebase Authentication
- MongoDB queries are scoped to the authenticated user
- CORS is enabled for your domain
- Input validation should be added as needed

## Testing

You can test your functions locally using the Firebase emulator:

```bash
cd functions
npm run serve
```

## Troubleshooting

1. **CORS errors**: Ensure your domain is included in the CORS configuration
2. **Authentication errors**: Check that Firebase Auth is properly configured
3. **MongoDB connection errors**: Verify your connection string and network access
4. **Function timeout**: Increase timeout in Firebase console if needed

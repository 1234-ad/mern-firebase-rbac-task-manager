# Setup Instructions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Firebase project with Authentication enabled

## Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication with Email/Password provider

2. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Add a web app and copy the config object
   - Go to Project Settings > Service Accounts
   - Generate a new private key (download JSON file)

3. **Firebase Security Rules** (Optional)
   - Set up Firestore security rules if using Firestore
   - Configure Authentication settings

## Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager
   NODE_ENV=development
   
   # Firebase Admin SDK
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

## Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## Database Setup

### MongoDB Local Setup
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create the database automatically

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in backend `.env`

## Testing the Application

1. **Create Test Users**
   - Register new users through the frontend
   - First user can be manually promoted to admin in the database

2. **Manual Admin Creation** (MongoDB)
   ```javascript
   // Connect to your MongoDB and run:
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

3. **Test Role-Based Access**
   - Login with different user roles
   - Verify access restrictions work correctly
   - Test CRUD operations on tasks

## API Endpoints

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `GET /api/auth/users` - Get all users (admin only)
- `PUT /api/auth/users/:id/role` - Update user role (admin only)

### Tasks
- `GET /api/tasks` - Get tasks (role-filtered)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

## Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure MongoDB connection is configured
3. Set `NODE_ENV=production`

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update `REACT_APP_API_URL` to your backend URL

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Verify Firebase config is correct
   - Check if Email/Password provider is enabled
   - Ensure Firebase project ID matches

2. **MongoDB Connection Issues**
   - Check MongoDB service is running
   - Verify connection string format
   - Check network access for MongoDB Atlas

3. **CORS Issues**
   - Verify frontend URL is in backend CORS configuration
   - Check if ports are correct

4. **Permission Errors**
   - Verify user roles are set correctly in database
   - Check middleware authentication logic

### Debug Mode
- Set `NODE_ENV=development` for detailed error messages
- Check browser console for frontend errors
- Monitor backend logs for API issues

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique values for production

2. **Firebase Security**
   - Implement proper security rules
   - Regularly rotate service account keys

3. **Database Security**
   - Use MongoDB authentication in production
   - Implement proper network security

4. **API Security**
   - Rate limiting is implemented
   - Input validation on all endpoints
   - JWT token verification for all protected routes
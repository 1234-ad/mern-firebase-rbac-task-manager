# MERN Firebase RBAC Task Manager

A full-stack MERN application with Firebase authentication and role-based authorization for task management.

## Features

- **Authentication**: Firebase Authentication Service
- **Role-Based Authorization**: Admin, Manager, User roles
- **CRUD Operations**: Complete task management
- **Secure APIs**: Role-based access control
- **Modern Stack**: React, Node.js, Express, MongoDB

## Tech Stack

- **Frontend**: React, Material-UI, Firebase SDK
- **Backend**: Node.js, Express.js, Firebase Admin SDK
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Authentication
- **Authorization**: Custom role-based middleware

## User Roles

- **Admin**: Full access (CRUD all tasks)
- **Manager**: Create, read, update tasks
- **User**: Read own tasks, create tasks

## API Endpoints

- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get tasks (filtered by role)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

3. Start backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:5000
```

3. Start frontend:
```bash
npm start
```

## Project Structure

```
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
└── README.md
```

## License

MIT License
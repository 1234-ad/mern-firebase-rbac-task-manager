# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Firebase JWT token in the Authorization header:
```
Authorization: Bearer <firebase_jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if applicable)"
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Get User Profile
```http
GET /auth/profile
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "firebaseUid": "string",
    "email": "string",
    "displayName": "string",
    "role": "user|manager|admin",
    "isActive": boolean,
    "permissions": ["array", "of", "permissions"],
    "createdAt": "ISO date",
    "lastLogin": "ISO date"
  }
}
```

### Update User Profile
```http
PUT /auth/profile
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "displayName": "string",
  "profile": {
    "department": "string",
    "phoneNumber": "string"
  }
}
```

### Get All Users (Admin Only)
```http
GET /auth/users?page=1&limit=10&role=admin&isActive=true&search=john
```

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (user|manager|admin)
- `isActive` (optional): Filter by status (true|false)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "users": [
    {
      "firebaseUid": "string",
      "email": "string",
      "displayName": "string",
      "role": "string",
      "isActive": boolean,
      "createdAt": "ISO date",
      "lastLogin": "ISO date"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Update User Role (Admin Only)
```http
PUT /auth/users/:userId/role
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "role": "user|manager|admin"
}
```

### Toggle User Status (Admin Only)
```http
PUT /auth/users/:userId/status
```

**Headers:**
- `Authorization: Bearer <token>`

### Delete User (Admin Only)
```http
DELETE /auth/users/:userId
```

**Headers:**
- `Authorization: Bearer <token>`

### Get User Statistics (Admin Only)
```http
GET /auth/users/stats
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "totalUsers": 100,
    "activeUsers": 85,
    "inactiveUsers": 15,
    "admins": 2,
    "managers": 8,
    "users": 90
  },
  "recentUsers": [
    {
      "displayName": "string",
      "email": "string",
      "role": "string",
      "createdAt": "ISO date"
    }
  ]
}
```

---

## Task Endpoints

### Get Tasks
```http
GET /tasks?page=1&limit=10&status=pending&priority=high&search=project&sortBy=createdAt&sortOrder=desc
```

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending|in-progress|completed)
- `priority` (optional): Filter by priority (low|medium|high)
- `assignedTo` (optional): Filter by assigned user ID
- `search` (optional): Search in title, description, tags
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): Sort order (asc|desc, default: desc)

**Role-based Filtering:**
- **User**: Only sees tasks assigned to them or created by them
- **Manager/Admin**: Sees all tasks

**Response:**
```json
{
  "tasks": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "status": "pending|in-progress|completed",
      "priority": "low|medium|high",
      "dueDate": "ISO date",
      "createdBy": "string",
      "assignedTo": "string",
      "tags": ["array", "of", "strings"],
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTasks": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Single Task
```http
GET /tasks/:id
```

**Headers:**
- `Authorization: Bearer <token>`

**Access Control:**
- **User**: Can only view own tasks (assigned or created)
- **Manager/Admin**: Can view all tasks

### Create Task
```http
POST /tasks
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "status": "pending|in-progress|completed (optional, default: pending)",
  "priority": "low|medium|high (optional, default: medium)",
  "dueDate": "ISO date (optional)",
  "assignedTo": "string (optional, defaults to creator)",
  "tags": ["array", "of", "strings (optional)"]
}
```

**Permissions:**
- Requires `create:tasks` permission

### Update Task
```http
PUT /tasks/:id
```

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:** Same as create task (all fields optional)

**Access Control:**
- **User**: Can only update tasks they created
- **Manager/Admin**: Can update all tasks

### Delete Task
```http
DELETE /tasks/:id
```

**Headers:**
- `Authorization: Bearer <token>`

**Access Control:**
- **User**: Can only delete tasks they created
- **Admin**: Can delete all tasks

### Get Task Statistics
```http
GET /tasks/stats
```

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "stats": {
    "total": 100,
    "pending": 30,
    "inProgress": 45,
    "completed": 25,
    "highPriority": 15,
    "overdue": 8
  }
}
```

**Role-based Filtering:**
- **User**: Stats for own tasks only
- **Manager/Admin**: Stats for all tasks

---

## Role-Based Permissions

### User Role
- `read:own-tasks` - Can read tasks assigned to them or created by them
- `create:tasks` - Can create new tasks

### Manager Role
- `read:all-tasks` - Can read all tasks
- `create:tasks` - Can create new tasks
- `update:all-tasks` - Can update all tasks

### Admin Role
- `read:all-tasks` - Can read all tasks
- `create:tasks` - Can create new tasks
- `update:all-tasks` - Can update all tasks
- `delete:all-tasks` - Can delete all tasks
- `manage:users` - Can manage user accounts and roles

---

## Rate Limiting

All endpoints are rate-limited to 100 requests per 15-minute window per IP address.

## CORS

The API accepts requests from:
- `http://localhost:3000` (development)
- Your production frontend domain (configure in server.js)

## Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "ISO date"
}
```

---

## Example Usage

### JavaScript/Fetch
```javascript
// Get user profile
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${firebaseToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### cURL
```bash
# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish the MERN stack project",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z"
  }'
```
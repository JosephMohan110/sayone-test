# Task Management App Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Setup Instructions](#setup-instructions)
5. [How It Works Step by Step](#how-it-works-step-by-step)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Database Schema](#database-schema)
9. [Authentication Flow](#authentication-flow)
10. [Troubleshooting](#troubleshooting)

## Introduction
This is a full-stack task management application built with Django REST Framework for the backend and React for the frontend. It allows users to register, login, and manage their tasks with features like due date tracking, task completion, reordering via drag-and-drop, and priority suggestions.

The application includes:
- User authentication with JWT tokens
- Task CRUD operations
- Due date calculations and summaries
- Drag-and-drop task reordering
- Category-based task organization
- Priority suggestions based on task titles

## Technology Stack

### Backend
- **Framework**: Django 4.2
- **API Framework**: Django REST Framework (DRF)
- **Authentication**: Django REST Framework Simple JWT
- **Database**: SQLite3
- **CORS Handling**: django-cors-headers
- **Password Validation**: Django's built-in validators
- **Logging**: Python logging module

### Frontend
- **Framework**: React 19.2.4
- **Routing**: React Router DOM 7.13.2
- **HTTP Client**: Axios 1.13.6
- **Testing**: React Testing Library, Jest
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Styling**: CSS (custom styles)

### Development Tools
- **Version Control**: Git
- **Package Managers**: pip (Python), npm (Node.js)
- **Database Migrations**: Django migrations
- **API Testing**: Postman (implied from setup)

### Deployment
- **Web Server**: Django's development server (for dev)
- **Static Files**: Served via Django (for dev)
- **CORS**: Configured for localhost:3000

## Architecture Overview

The application follows a standard client-server architecture:

### Backend Architecture
- **Project Structure**:
  - `backend/backend/`: Main Django project settings
  - `backend/task/`: Task management app
  - `backend/user/`: User management app
- **API Endpoints**:
  - `/api/auth/register/`: User registration
  - `/api/auth/login/`: User login
  - `/api/auth/logout/`: User logout
  - `/api/tasks/`: Task CRUD operations
- **Models**:
  - User: Django's built-in User model
  - Task: Custom model with fields for title, description, category, due_date, etc.
- **Serializers**:
  - UserSerializer: Handles user registration and validation
  - TaskSerializer: Handles task data serialization
  - LoginSerializer: Extends JWT serializer for custom claims

### Frontend Architecture
- **Component Structure**:
  - `App.js`: Main router component
  - `AuthContext.js`: Authentication state management
  - `PrivateRoute.js`: Route protection component
  - `Dashboard.js`: Main dashboard with task management
  - `Login.js` & `Register.js`: Authentication pages
  - `TaskForm.js`, `TaskItem.js`, `TaskList.js`: Task components
- **Services**:
  - `api.js`: Axios-based API client with JWT token handling
- **State Management**:
  - React Context for authentication
  - Local component state for tasks and UI

### Data Flow
1. User registers/logs in → JWT tokens stored in localStorage
2. API requests include Authorization header with Bearer token
3. Backend validates token and returns user-specific data
4. Frontend updates UI based on API responses

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install djangorestframework-simplejwt
   ```

3. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```
   - Username: admin
   - Email: admin@example.com
   - Password: admin123

5. Start the backend server:
   ```bash
   python manage.py runserver
   ```
   - Backend will be available at http://localhost:8000

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   - Frontend will be available at http://localhost:3000

### Usage
1. Register a new account at http://localhost:3000/register
2. Login at http://localhost:3000/login
3. Access the dashboard at http://localhost:3000/ or http://localhost:3000/dashboard
4. Tasks require authentication and auto-refresh tokens on 401 responses
5. Logout clears the session

## How It Works Step by Step

### 1. User Registration
- User fills out registration form with username, email, and password
- Frontend sends POST request to `/api/auth/register/`
- Backend validates:
  - Username: Must contain only letters and spaces, at least 1 character
  - Email: Must be valid format and unique (case-insensitive)
  - Password: Must meet Django's password requirements
- If username exists, appends a number (e.g., "alex" → "alex1")
- If email exists, returns validation error
- On success, creates user and returns user data with 201 status

### 2. User Login
- User enters username/email and password
- Frontend sends POST to `/api/auth/login/`
- Backend authenticates user and returns JWT access and refresh tokens
- Tokens are stored in localStorage
- Frontend redirects to dashboard

### 3. Dashboard Loading
- Dashboard component mounts and calls `loadTasks()`
- API request fetches user's tasks from `/api/tasks/`
- Tasks are displayed in a list with drag-and-drop reordering
- Summary statistics are calculated:
  - Total tasks count
  - Completed tasks count
  - Completion percentage
  - Tasks due in 1 day (due_date is tomorrow)
  - Overdue tasks (due_date is before today)

### 4. Due Date Calculation Logic
- For each incomplete task with a due_date:
  - Parse due_date string (YYYY-MM-DD) into Date object
  - Get today's midnight and due date's midnight
  - Calculate difference in days: `Math.floor((dueMidnight - todayMidnight) / (1000 * 60 * 60 * 24))`
  - If diffDays < 0: overdue
  - If diffDays === 1: due soon
  - This ensures accurate day-based calculations without timezone issues

### 5. Task Management
- **Create**: User fills form, POST to `/api/tasks/`, task added with next order number
- **Update**: PUT/PATCH to `/api/tasks/{id}/`, updates task data
- **Delete**: DELETE to `/api/tasks/{id}/`, removes task
- **Complete**: POST to `/api/tasks/{id}/complete/`, sets completed=true
- **Reorder**: Drag-and-drop updates order field, POST to `/api/tasks/reorder/` with new order array

### 6. Authentication Flow
- All API requests include Authorization: Bearer {access_token}
- On 401 response, frontend attempts token refresh using refresh token
- If refresh fails, user is logged out
- Logout blacklists the refresh token on server

### 7. Priority Suggestion
- POST to `/api/tasks/suggest_priority/` with task title
- Simple keyword matching:
  - High: urgent, asap, critical, important, emergency, deadline
  - Low: maybe, later, someday, optional, if possible
  - Default: medium

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register/
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "username",
    "email": "email@example.com"
  }
}
```

**Validation Rules:**
- Username: 1+ chars, letters/spaces only, duplicates allowed (appends number)
- Email: Valid format, must be unique
- Password: Meets Django requirements, password and password2 must match

#### POST /api/auth/login/
Login user.

**Request Body:**
```json
{
  "username": "string or email",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "username": "username"
}
```

#### POST /api/auth/logout/
Logout user (blacklist refresh token).

**Request Body:**
```json
{
  "refresh": "refresh_token"
}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### Task Endpoints

#### GET /api/tasks/
List user's tasks.

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Task title",
    "description": "Task description",
    "category": "work",
    "due_date": "2024-12-31",
    "completed": false,
    "created_at": "2024-01-01T00:00:00Z",
    "order": 1,
    "image_url": "",
    "priority": "medium"
  }
]
```

#### POST /api/tasks/
Create new task.

**Request Body:**
```json
{
  "title": "string",
  "description": "string (optional)",
  "category": "work|personal|shopping|other",
  "due_date": "YYYY-MM-DD (optional)",
  "image_url": "string (optional)"
}
```

#### GET /api/tasks/{id}/
Get specific task.

#### PUT /api/tasks/{id}/
Update task.

#### DELETE /api/tasks/{id}/
Delete task.

#### POST /api/tasks/{id}/complete/
Mark task as completed.

**Response (200):** Updated task object

#### POST /api/tasks/suggest_priority/
Suggest task priority based on title.

**Request Body:**
```json
{
  "title": "Task title"
}
```

**Response (200):**
```json
{
  "priority": "high|medium|low"
}
```

#### POST /api/tasks/reorder/
Reorder tasks.

**Request Body:**
```json
{
  "order": [1, 3, 2]  // Array of task IDs in new order
}
```

**Response (200):**
```json
{
  "status": "reordered"
}
```

## Frontend Components

### App.js
Main application component with routing:
- `/login`: Login page
- `/register`: Registration page
- `/` and `/dashboard`: Protected dashboard (requires authentication)

### AuthContext.js
React Context for authentication state:
- Stores user data and tokens in localStorage
- Provides login/logout functions
- Handles token refresh on 401 responses

### PrivateRoute.js
Route guard component:
- Checks if user is authenticated
- Redirects to login if not authenticated

### Dashboard.js
Main dashboard component:
- Loads and displays tasks
- Calculates summary statistics including due date logic
- Handles task CRUD operations
- Implements drag-and-drop reordering
- Shows error messages

### TaskList.js
Task list component:
- Renders TaskItem components
- Handles drag-and-drop events
- Passes task actions to parent

### TaskItem.js
Individual task component:
- Displays task details
- Provides edit/delete/complete buttons
- Handles drag events

### TaskForm.js
Task creation/editing form:
- Validates input
- Submits to API
- Supports priority suggestions

### Login.js & Register.js
Authentication forms:
- Handle form submission
- Display validation errors
- Redirect on success

### api.js
API service module:
- Axios instance with base URL and interceptors
- Automatic token attachment to requests
- Token refresh logic
- Error handling

## Database Schema

### User Model (Django built-in)
- id: Auto-incrementing primary key
- username: Unique username (but app allows duplicates with suffix)
- email: Email field (unique enforced)
- password: Hashed password
- Other Django User fields (first_name, last_name, etc.)

### Task Model
- id: Auto-incrementing primary key
- user: Foreign key to User (CASCADE delete)
- title: CharField(max_length=200)
- description: TextField(blank=True)
- category: CharField(choices=['work', 'personal', 'shopping', 'other'])
- due_date: DateField(null=True, blank=True)
- completed: BooleanField(default=False)
- created_at: DateTimeField(auto_now_add=True)
- order: PositiveIntegerField(default=0) - for drag-and-drop ordering
- image_url: TextField(blank=True, null=True)
- priority: CharField(max_length=10, default='medium')

## Authentication Flow

1. **Registration**:
   - User submits form
   - Serializer validates data
   - User created with unique email, username may be suffixed
   - Success response with user data

2. **Login**:
   - User submits credentials
   - Django authenticate() checks username/password
   - JWT tokens generated and returned
   - Frontend stores tokens in localStorage

3. **API Requests**:
   - Axios interceptor adds Authorization header
   - Backend validates JWT token
   - Returns user-specific data

4. **Token Refresh**:
   - On 401 response, attempt refresh with refresh token
   - If successful, retry original request
   - If failed, logout user

5. **Logout**:
   - POST to logout endpoint with refresh token
   - Server blacklists refresh token
   - Frontend clears localStorage and redirects to login

## Troubleshooting

### Common Issues

1. **"Due in 1 day" and "Overdue" counters showing wrong values**
   - Check that due_date is in YYYY-MM-DD format
   - Ensure date calculations use midnight timestamps
   - Verify task.completed is false for counting

2. **Duplicate user registration crashes**
   - Email must be unique (enforced in serializer)
   - Username duplicates allowed with automatic suffixing
   - IntegrityError handled in views

3. **Authentication errors**
   - Check JWT token expiration (access: 60min, refresh: 1 day)
   - Verify CORS settings allow frontend origin
   - Ensure tokens are stored correctly in localStorage

4. **Task operations failing**
   - Verify user authentication
   - Check API endpoints match frontend requests
   - Review serializer validation

5. **Drag-and-drop not working**
   - Ensure tasks have unique IDs
   - Check browser support for HTML5 drag-and-drop
   - Verify reorder API call succeeds

### Development Tips

- Use Django admin at /admin/ with superuser credentials
- Check browser console for frontend errors
- Use Django logs for backend debugging
- Test API endpoints with tools like Postman
- Run `python manage.py check` for Django validation
- Run `npm test` for frontend tests (requires react-router-dom)

### Environment Variables

For production deployment, set:
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `SECRET_KEY`: Secure secret key for JWT signing
- Database settings for production DB instead of SQLite

This documentation provides a comprehensive overview of the Task Management App, covering all aspects from setup to detailed functionality.
Sayone Task Tracker

This repository contains a full stack task management application built with Django REST Framework for the backend and React for the frontend. Features include user authentication, task creation and editing, due date tracking, task categories, priority suggestion, image attachment via drag-and-drop, completion summary, and drag-and-drop task ordering.

Backend setup:
1. Navigate to the backend folder.
2. Install dependencies using pip.
3. Run database migrations.
4. Create a superuser with admin credentials.
5. Start the Django development server.

Frontend setup:
1. Navigate to the frontend folder.
2. Install dependencies using npm.
3. Start the React development server.

Usage:
1. Register a new account or sign in with the superuser credentials.
2. Create tasks with title, description, category, due date, priority, and optional image upload by dragging and dropping or selecting a file.
3. View tasks list on the dashboard with summary metrics (total, completed, completion percentage, due soon, overdue).
4. Rearrange tasks by dragging and dropping task cards.
5. Mark tasks as complete or edit and delete tasks.

The backend uses JWT authentication and token refresh logic in the frontend to handle session expiry. API endpoints are available under /api/tasks/. Ensure the backend server is running on http://localhost:8000 and frontend on http://localhost:3000 for local development.

Technology stack:
- Backend: Python, Django, Django REST Framework, SQLite
- Authentication: djangorestframework-simplejwt (JWT)
- Frontend: React, React Router, Axios
- Styling: basic CSS
- Development: npm for frontend, pip for backend

Git usage:
Clone the repository, create a feature branch, commit changes with clear messages, and push to the remote. Use pull requests for code review and merge only after verification and testing.
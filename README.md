# TaskFlow

TaskFlow is a simple Jira-like Agile Task and Project Management System.

## Features

- User registration and login
- JWT authentication
- Project CRUD
- Task CRUD
- Task priority
- Due dates
- Task assignment
- Kanban board
- To Do / In Progress / Done status
- Dashboard statistics
- MySQL database

## Requirements

- Node.js
- MySQL
- A browser

## Setup

### 1. Database

Open MySQL Workbench/phpMyAdmin and run:

`database/taskflow.sql`

### 2. Backend

Open a terminal:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and update the MySQL password.

Then:

```bash
npm run dev
```

The API runs at:

`http://localhost:5000`

### 3. Frontend

Open `frontend/index.html` in the browser.

For the smoothest local setup, use VS Code Live Server and open `frontend/index.html`.

## Demo flow

1. Register a user.
2. Login.
3. Create a project.
4. Open the project board.
5. Add tasks.
6. Change status.
7. Edit/delete tasks.
8. Return to dashboard.

## Future enhancements

- Kafka-based notifications
- WebSockets
- Redis caching
- Microservices
- Docker
- Prometheus/Grafana monitoring
- Sprint management
- Comments and attachments
- Role-based access

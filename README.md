# AMSId

AMSId is a full-stack patient tracking system for key populations, built for Alive Medical Services. It provides unique IDs, secure data management, and a modern UI

## Tech Stack

- **Backend:** Java Spring Boot
- **Frontend:** React (Vite) + Tailwind CSS

## Features

- Unique patient ID assignment
- Secure data capture & retrieval
- Responsive dashboard & protected routes

## Quickstart

### 1. Clone the Repository

```bash
git clone <repo-url>
cd FullStackAms
```

### 2. Run Everything with Docker Compose

```bash
docker-compose up --build
```

This will start the backend (Spring Boot), frontend (React), and PostgreSQL database automatically.

- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Database: localhost:5432 (PostgreSQL)

No manual setup required! All environment variables are pre-configured for local development.

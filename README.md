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

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd FullStackAms
   ```
2. **Backend**
   ```bash
   cd Backend
   ./mvnw clean install
   ./mvnw spring-boot:run
   # Runs at http://localhost:8080
   ```
3. **Frontend**
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   # Runs at http://localhost:3000
   ```
4. **API URL**
   Edit `Frontend/.env`:
   ```
   VITE_API_URL=http://localhost:8080
   ```


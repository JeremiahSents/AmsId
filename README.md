# FullStackAms

FullStackAms is a full-stack application template that combines a Java Spring Boot backend and a modern React frontend. It is designed for rapid development and deployment of web applications, featuring Docker support, NGINX configuration, and Kubernetes manifests for local or cloud deployment. The backend provides RESTful APIs, while the frontend offers a responsive UI built with React and Tailwind CSS.

## Features

- **Backend:** Java Spring Boot REST API
- **Frontend:** React (Vite) with Tailwind CSS
- **Authentication:** Context-based authentication flow
- **Dockerized:** Ready-to-use Dockerfiles for both frontend and backend
- **Kubernetes:** Manifests for local k8s deployment
- **NGINX:** Reverse proxy configuration

## Folder Structure

- `Backend/` - Java Spring Boot backend
- `Frontend/` - React frontend
- `k8s-local/` - Kubernetes manifests
- `nginx.conf` - NGINX configuration
- `docker-compose.yml` - Multi-container orchestration

---

# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) (for frontend)
- [Java 17+](https://adoptopenjdk.net/) (for backend)
- [Docker](https://www.docker.com/) (for containerization)
- [Maven](https://maven.apache.org/) (for backend build)

## 1. Clone the Repository

```bash
git clone <repo-url>
cd FullStackAms
```

## 2. Backend Setup

```bash
cd Backend
# Build the backend
./mvnw clean install
# Run the backend
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080` by default.

## 3. Frontend Setup

```bash
cd ../Frontend
# Install dependencies
npm install
# Start the frontend
npm run dev
```

The frontend will start on `http://localhost:5173` by default.

## 4. Environment Variables

Edit `Frontend/.env` to set the API URL:

```
VITE_API_URL=http://localhost:8080
```

## 5. Docker Compose (Optional)

To run both frontend and backend with Docker:

```bash
docker-compose up --build
```

## 6. Kubernetes (Optional)

To deploy locally with Kubernetes (e.g., minikube):

```bash
kubectl apply -f k8s-local/
```

## 7. NGINX (Optional)

Use the provided `nginx.conf` for reverse proxy setup.

---

# Usage

- Access the frontend at `http://localhost:5173`
- The frontend communicates with the backend via the API URL set in `.env`
- Authentication and protected routes are handled in the frontend

# Contributing

Feel free to fork and submit pull requests.

# License

MIT License

# TaskFlow: Docker and Deployment Guide

TaskFlow is a React + Vite frontend and an Express API. PostgreSQL stores users and tasks, and Redis caches each user's task list for 30 seconds.

## 1. Architecture

```text
Browser
   | :8080                         | :3000 (direct API and /health)
   v                               v
frontend (Nginx :80) --/api/--> backend (Express :3000)
                                   |              |
                                   v              v
                          postgres :5432      redis :6379
                                   |
                                   v
                         postgres_data volume

All four containers share the taskflow-network bridge network.
```

| Service | Image | Container port | Host port: `docker-compose.yml` | Host port: `docker-compose.deploy.yml` |
|---|---|---:|---|---|
| frontend | built from `frontend/` | 80 | 8080 | 8080 |
| backend | built from `backend/` | 3000 | 3000 | 3000 |
| postgres | `postgres:16-alpine` | 5432 | 127.0.0.1:5432 | not published |
| redis | `redis:7-alpine` | 6379 | 127.0.0.1:6379 | not published |

## 2. Dockerfiles

**`backend/Dockerfile`**
- Uses `node:20-alpine` and sets `NODE_ENV=production`.
- Copies `package*.json` first, so dependency layers stay cached when only source code changes.
- Installs production dependencies with `npm install --omit=dev`. The repository has no backend lockfile, so `npm ci` cannot be used.
- Copies `src/` and `db/`, then runs as the unprivileged `node` user (UID 1000).
- Starts with `node src/server.js` directly, so the process receives `SIGTERM` and shuts down cleanly.
- Contains no secrets. All configuration comes from environment variables at runtime.

**`frontend/Dockerfile`**
- Stage 1 (`node:20-alpine`) installs dependencies and runs `npm run build`, which writes to `dist/`.
- Stage 2 (`nginx:1.27-alpine`) contains only the built files and `nginx.conf`, so Node and `node_modules` are not shipped.
- Exposes port 80 and has a `HEALTHCHECK`.

`.dockerignore` files in both folders keep `node_modules`, `.env` and similar files out of the build context.

## 3. Compose files

**`docker-compose.yml`** builds the frontend and backend locally:

```bash
docker compose up -d --build
```

**`docker-compose.deploy.yml`** has no `build:` keys and needs only itself and a `.env` file. It differs from the local file in three ways:
- The frontend and backend come from `${DOCKERHUB_USERNAME}/frontend:latest` and `${DOCKERHUB_USERNAME}/backend:latest`.
- The backend runs `db/apply-schema.js` before starting. That script is inside the image and creates the tables, so no repository checkout is needed.
- PostgreSQL and Redis are reachable only inside the Docker network.

**Startup order:** PostgreSQL and Redis become healthy, then the backend, then the frontend. This uses `depends_on` with `condition: service_healthy`.

| Service | Health check |
|---|---|
| postgres | `pg_isready` over TCP, so it does not pass during first-time initialisation |
| redis | `redis-cli ping` |
| backend | `GET /health`, which also checks PostgreSQL and Redis |
| frontend | `wget` against Nginx |

## 4. Networking

Compose attaches all services to the `taskflow-network` bridge network, where Docker DNS resolves service names. Inside a container, `localhost` means that container, so the services use these names instead:

- Backend to database: `postgres:5432`, through `DATABASE_URL`
- Backend to cache: `redis:6379`, through `REDIS_URL`
- Nginx to backend: `backend:3000`, set in `frontend/nginx.conf`

The browser calls `/api` on the frontend's own origin, and Nginx proxies it to the backend.

## 5. PostgreSQL persistence

The named volume `postgres_data` is mounted at `/var/lib/postgresql/data`, so data survives container removal.

| Command | Effect on data |
|---|---|
| `docker compose down` | Kept |
| `docker compose down -v` | **Deleted** |

Locally, `backend/db/init.sql` is mounted into `/docker-entrypoint-initdb.d`, which PostgreSQL runs only when the volume is empty. In deployment, `db/apply-schema.js` runs the same SQL on each backend start. This is safe to repeat because the SQL uses `IF NOT EXISTS`.

## 6. Environment variables

Copy `.env.example` to `.env`. Git ignores `.env`, so never force-add it.

| Variable | Used by | Notes |
|---|---|---|
| `POSTGRES_DB` | postgres | Default `taskflow` |
| `POSTGRES_USER` | postgres | Default `taskflow_user` |
| `POSTGRES_PASSWORD` | postgres | Required. Wrap it in single quotes if it contains `$` or `#`, and do not use a single quote in it |
| `DATABASE_URL` | backend | Required. Must contain the same password, URL-encoded if it has special characters |
| `REDIS_URL` | backend | Default `redis://redis:6379` |
| `JWT_SECRET` | backend | Required. Generate one with `openssl rand -hex 32` |
| `PORT` | template only | Compose sets the backend to 3000 |
| `DOCKERHUB_USERNAME` | deploy file | Your Docker Hub username |

## 7. Publishing to Docker Hub

Create public repositories named `frontend` and `backend`, then run:

```bash
docker login
docker build -t YOUR_DOCKERHUB_USERNAME/backend:latest ./backend
docker build -t YOUR_DOCKERHUB_USERNAME/frontend:latest ./frontend
docker push YOUR_DOCKERHUB_USERNAME/backend:latest
docker push YOUR_DOCKERHUB_USERNAME/frontend:latest
```

Use a Docker Hub access token at the password prompt.

## 8. Deployment

Put `docker-compose.deploy.yml` and a filled-in `.env` in one folder on any machine with Docker, then run:

```bash
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
docker compose -f docker-compose.deploy.yml ps
```

## 9. GitHub Secrets

In your fork, open **Settings > Secrets and variables > Actions > New repository secret**.

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token with Read and Write permission |
| `POSTGRES_PASSWORD` | Strong password without a single quote |

## 10. GitHub Actions

**`.github/workflows/cd.yml`** runs on every push to `main` and on manual dispatch:

1. Checkout repository
2. Validate required secrets
3. Set up Docker Buildx
4. Login to Docker Hub
5. Build backend image
6. Publish backend image
7. Build frontend image
8. Publish frontend image
9. Create temporary deployment environment (`JWT_SECRET` is generated for each run)
10. Validate the deployment Compose file
11. Pull published images
12. Deploy published images
13. Verify backend health
14. Verify frontend accessibility
15. Run API tests against the deployment
16. Record image references
17. Clean up, even if an earlier step failed

The deployment exists only on the temporary GitHub runner and is removed at the end of the run. It does not create a public URL.

**`.github/workflows/ci.yml`** is the instructor's evaluation workflow and is unchanged. It needs `scripts/check-required-files.sh` and `scripts/persistence-test.sh` from the `main` branch it checks out.

## 11. Testing and verification

```bash
docker compose config --quiet
docker compose -f docker-compose.deploy.yml config --quiet
docker compose up -d --build
docker compose ps
curl http://localhost:3000/health
curl -I http://localhost:8080/
curl http://localhost:8080/health
```

Expected health response:

```json
{"status":"ok","postgres":"ok","redis":"ok"}
```

API tests (Linux, macOS or Git Bash):

```bash
cd tests
npm ci
BASE_URL=http://localhost:3000 NODE_OPTIONS=--experimental-vm-modules npm test
```

Persistence check: create a task in the app, run `docker compose down` and then `docker compose up -d`, and confirm the task is still there.

Redis check: open the task list twice within 30 seconds. The page should show `postgres` first and then `redis-cache` as the last response source.

Dockerfile lint:

```bash
docker run --rm -i hadolint/hadolint < backend/Dockerfile
docker run --rm -i hadolint/hadolint < frontend/Dockerfile
```

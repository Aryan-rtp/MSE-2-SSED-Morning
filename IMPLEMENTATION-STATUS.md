# Implementation Status

Last verified: 2026-11-18, on Docker Desktop (server 29.5.2) on Windows.

## Verified by running it

| Check | Result |
|---|---|
| `docker compose config` for both Compose files | Passed |
| Frontend and backend image builds | Passed |
| `docker compose up -d --build` | All four services healthy |
| API test suite against the local stack | 12 of 12 passed |
| API test suite against the deployment file | 12 of 12 passed |
| Frontend to backend through Nginx (`/api`) | Passed |
| PostgreSQL and Redis connectivity through `/health` | Passed |
| Data survives `down` and `up`, local and deployment | Passed |
| Deployment from a folder holding only the Compose file and `.env` | Passed, using locally tagged images |
| Database password containing `$`, `#` and `&` | Passed |
| Backend runs as non-root and stops cleanly on `SIGTERM` | Passed |
| hadolint on both Dockerfiles | Passed |
| actionlint on `cd.yml` | Passed |

actionlint reports one unused-variable warning in the instructor's `ci.yml`, which was left unchanged.

## Not verified

- Pushing images to Docker Hub, or pulling them from it.
- Any GitHub Actions run, including the `cd.yml` changes.
- The instructor's `ci.yml`. Its `scripts/` files are not in this repository.

## Fixed during verification

- `docker-compose.deploy.yml` crashed PostgreSQL on a machine without the repository, because it mounted `backend/db/init.sql`. The schema is now applied from the backend image by `backend/db/apply-schema.js`.
- Both Dockerfiles failed hadolint, which would have failed the `ci.yml` lint steps.
- PostgreSQL's health check could pass during first-time initialisation. It now checks over TCP.
- PostgreSQL and Redis were published on all host interfaces. They are now limited to `127.0.0.1` locally and not published in deployment.
- The backend now runs `node` directly, so it shuts down cleanly.
- `cd.yml` now has separate build, publish, health and frontend steps, and handles special characters in the database password.

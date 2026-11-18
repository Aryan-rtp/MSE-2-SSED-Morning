# Submission Pack

Replace every `[...]` with real values. Tick a box only after you have seen that result yourself.

## 1. Final checklist

**Before pushing**
- [ ] `README.md` is restored (`git restore README.md`)
- [ ] `origin` points to my fork
- [ ] `.env` is not staged (`git status` does not list it)
- [ ] GitHub secrets are added: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `POSTGRES_PASSWORD`
- [ ] Docker Hub repositories `frontend` and `backend` exist

**After pushing**
- [ ] CD workflow finished with a green status
- [ ] Both images are visible on Docker Hub
- [ ] `docker compose -f docker-compose.deploy.yml pull` works on my laptop
- [ ] App opens at `http://localhost:8080` and I can register, log in and manage tasks
- [ ] `http://localhost:3000/health` returns `ok` for PostgreSQL and Redis
- [ ] Task survives `docker compose down` and `docker compose up -d`
- [ ] Screenshots are taken and added to the PDF
- [ ] PDF is named `ROLL_NUMBER_STUDENT_NAME.pdf` and uploaded to Moodle
- [ ] Pull Request is created, with the PDF attached

## 2. Pull Request

**Title**

```text
DOCKER-EXAM | [ROLL-NUMBER] | [STUDENT-NAME] | [SECTION]
```

**Description**

```markdown
## Student Details

- Name: [NAME]
- Roll Number: [ROLL NUMBER]
- Section: [SECTION]
- GitHub Username: [GITHUB USERNAME]
- Docker Hub Username: [DOCKER HUB USERNAME]
- GitHub Repository: https://github.com/[GITHUB USERNAME]/MSE-2-SSED-Morning

## Docker Hub Images

- Frontend Image: https://hub.docker.com/r/[DOCKER HUB USERNAME]/frontend
- Backend Image: https://hub.docker.com/r/[DOCKER HUB USERNAME]/backend

## Application Deployment

- Application URL: http://localhost:8080 (local deployment from the published images)
- Backend Health URL: http://localhost:3000/health

## Implementation Checklist

- [ ] Frontend Dockerfile implemented
- [ ] Backend Dockerfile implemented
- [ ] docker-compose.yml implemented
- [ ] docker-compose.deploy.yml implemented
- [ ] Frontend image published to Docker Hub
- [ ] Backend image published to Docker Hub
- [ ] PostgreSQL persistence verified
- [ ] Redis caching verified
- [ ] Application functionality tested
- [ ] CD pipeline passed successfully
- [ ] Latest changes committed and pushed

## CI/CD Verification

- CD Workflow Run URL: [ACTIONS RUN URL]
- Final Workflow Status: [STATUS SHOWN ON GITHUB]

## AI Assistance Disclosure

AI tools were used for this submission, with the instructor's permission: [LIST EVERY TOOL USED, e.g. Claude Code]. They generated and corrected the Dockerfiles, Compose files, CD workflow changes, `backend/db/apply-schema.js` and documentation.

## Declaration

I confirm that I have disclosed the AI assistance above, reviewed the submitted implementation, and tested the containerized application myself.
```

## 3. PDF outline

File name: `ROLL_NUMBER_STUDENT_NAME.pdf`

1. **Student information:** full name, university roll number, section, branch, GitHub username.
2. **GitHub submission:** fork URL and branch used.
3. **Docker Hub details:** username, frontend image URL, backend image URL.
4. **CI/CD evidence.** Add a real, readable screenshot for each item:
   - [ADD SCREENSHOT: Actions run overview with final status]
   - [ADD SCREENSHOT: Login to Docker Hub step]
   - [ADD SCREENSHOT: Build backend image and Publish backend image steps]
   - [ADD SCREENSHOT: Build frontend image and Publish frontend image steps]
   - [ADD SCREENSHOT: Pull published images step]
   - [ADD SCREENSHOT: Deploy published images step]
   - [ADD SCREENSHOT: Verify backend health step]
   - [ADD SCREENSHOT: Verify frontend accessibility step]
   - [ADD SCREENSHOT: Instructor CI evaluation result, if available]
5. **Supporting evidence:**
   - [ADD SCREENSHOT: Docker Hub repositories]
   - [ADD SCREENSHOT: `docker compose ps` with four healthy services]
   - [ADD SCREENSHOT: TaskFlow running in the browser]
6. **AI assistance disclosure:** same text as the Pull Request.
7. **Declaration:** "I hereby declare that I have disclosed the AI assistance used in this Docker implementation. I have executed and verified the required CI/CD pipeline stages, published the Docker images to my Docker Hub account, and tested the application deployment."

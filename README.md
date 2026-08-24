# team6-frontend
Team6 Frontend

## Quickstart

Install dependencies:

```bash
npm install
```

Run in hot reload mode:

```bash
npm run dev
```

Build to `./dist`:

```bash
npm run build
```

Start from built output:

```bash
npm run start
```

Run tests:

```bash
npm test
```

## Run With Docker Containers

Build the frontend image:

```bash
docker build -t team6-frontend:v1 .
```

Run backend container (required):

```bash
docker run -p 3000:3000 team6-backend:v1
```

Run frontend container in a new terminal:

```bash
docker run -p 3001:3001 team6-frontend:v1
```

Then open:

- Frontend: http://localhost:3001
- Backend health (if exposed): http://localhost:3000/health

Run UI end-to-end tests (Playwright):

```bash
npm run test:e2e
```

`test:e2e` runs Playwright against a running app (default base URL: `http://localhost:3001`).

If you want the script to build/start/stop the app automatically:

```bash
npm run test:e2e:with-server
```

Open Playwright UI mode:

```bash
npm run test:e2e:ui
```

Open Playwright HTML report:

```bash
npm run test:e2e:report
```

Git pre-push checks (lint + test):

```bash
npm run setup-hooks
```

After this is set once, every `git push` will run lint and tests locally before push.

## Playwright Test Framework

This repository includes a Playwright + TypeScript E2E framework with:

- `playwright.config.ts`:
	- Base URL support via `PLAYWRIGHT_BASE_URL`
	- Auto-starts the app server for test runs
	- Failure artifacts (trace, screenshot, video)
	- CI-safe retries and reporters
- `tests/e2e/`: user-facing E2E specs
- `tests/pages/`: page objects to keep selectors and page actions reusable
- `tests/fixtures/`: shared test data

Unit and E2E test runners are separated:

- Vitest: `src/**/*.test.ts`
- Playwright: `tests/e2e/**/*.spec.ts`

### Good Practices Used

- Keep test intent in specs, and page interaction details in page objects.
- Prefer accessible selectors (`getByRole`, `getByLabel`) for resilient tests.
- Keep test data separate from test logic.
- Keep each test independent; no ordering assumptions.
- Capture debug artifacts only on failure to reduce noise.

### Useful E2E Commands

```bash
# Headless run
npm run test:e2e

# Run with real browser window
npm run test:e2e:headed

# Interactive inspector/debug mode
npm run test:e2e:debug
```

## Endpoints

- `GET /`
	- Returns a basic HTML page with `Hello World`.
- `GET /health`
	- Returns:

```json
{
	"status": "UP",
	"time": "2026-08-05T09:17:08.698Z"
}
```

The `time` value is the current timestamp at request time.

## Docker Optimization Notes

### Why `.dockerignore` if `.gitignore` exists?

- `.gitignore` controls what Git tracks.
- `.dockerignore` controls what gets sent to Docker as build context.
- Files excluded by `.gitignore` can still be sent to Docker unless they are also in `.dockerignore`.
- Smaller build context usually means faster builds and fewer cache invalidations.

### `npm install` vs `npm ci`

- `npm install` is flexible for local development and may update lockfile state.
- `npm ci` is deterministic and installs exactly from `package-lock.json`.
- For CI/CD and container builds, prefer `npm ci` for repeatability.

### Install production dependencies only

- Runtime stage uses production dependencies only (`npm ci --omit=dev`).
- Keep build-time tooling (TypeScript, test tooling) out of the final image.

### Docker layer caching strategy

- Copy less frequently changing files first (`package*.json`) before app source.
- Install dependencies before copying source when possible.
- In this project, build stage copies only `src/` and `tsconfig.json` so unrelated file changes do not invalidate build layers.

### Non-root runtime security

- Runtime image creates a dedicated non-root user (`app`).
- Files are copied with `--chown=app:app` and the container runs as `USER app`.
- This reduces risk if the process is compromised.

### Suggested comparison commands

```bash
# Build a baseline image (before optimization) and a final image
docker build -t team6-frontend:baseline .
docker build -t team6-frontend:optimized .

# Compare image sizes
docker images | grep team6-frontend

# Compare layer sizes
docker history team6-frontend:baseline
docker history team6-frontend:optimized

# Verify container runs as non-root
docker run --rm --entrypoint id team6-frontend:optimized
```

### Example progress table

| Version | Technique | Size | Reduction |
|---|---|---:|---:|
| v1 | Original | _(measure)_ | Baseline |
| v2 | Minimal base image | _(measure)_ | _(calc)_ |
| v3 | Multi-stage build | _(measure)_ | _(calc)_ |
| v4 | All optimizations | _(measure)_ | _(calc)_ |

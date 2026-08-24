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

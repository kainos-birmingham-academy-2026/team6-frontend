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

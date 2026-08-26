# Docker Setup for Legal Insure App

## Architecture

Only the **frontend** is containerized. The **backend runs locally on the
host**, not in Docker - a deliberate choice, not a gap.

- **Frontend**: React + Vite, built and served by Nginx in a container
  (host port 8080)
- **Backend**: Flask API, run directly on the host (`python app.py` /
  `flask run`), listening on port 5000

There is no inter-container networking here, because there's only one
container. The **browser** (running on your machine, not inside Docker)
calls the backend directly at `http://localhost:5000/api` -
`frontend/global.js` hardcodes that URL. Nginx inside the container never
proxies API calls; it only serves the built static files, with a SPA
fallback (`try_files ... /index.html`) so client-side routes survive a
page refresh.

## Port Management

| Service  | Where it runs      | Port  | URL                    |
|----------|---------------------|-------|------------------------|
| Backend  | Host (not in Docker)| 5000  | http://localhost:5000  |
| Frontend | Docker container     | 8080→80 | http://localhost:8080 |

## Starting

1. Start the backend locally first, as usual:
   ```bash
   cd legal-insure-app/backend
   python app.py
   ```
2. Build and start the frontend container:
   ```bash
   cd legal-insure-app
   docker compose up --build
   ```
   Add `-d` to run it detached.
3. Open http://localhost:8080. Login and every other API call goes
   straight from the browser to your locally-running Flask process.

## Stopping

```bash
docker compose down
```

## Rebuilding after frontend changes

```bash
docker compose up --build
```

Backend changes don't need a rebuild - it isn't containerized, so just
restart the local Flask process as you normally would.

## Debugging

```bash
docker compose logs -f       # follow nginx/container logs
docker compose ps            # confirm the container is up
docker exec -it legal-insure-frontend /bin/sh   # shell into the container
```

If the app loads but API calls fail (network errors in the browser
console), the backend almost certainly isn't running locally on port
5000 - start it and refresh, no container involved.

## Why the backend isn't containerized (yet)

This was a deliberate scope decision, not an oversight: the backend
needs the Microsoft ODBC Driver 18 for SQL Server installed in its image
(not just `unixodbc`), a real WSGI server instead of Flask's dev server,
and a decision on how it reaches SQL Server from inside a container
before it's worth containerizing. None of that blocks frontend-only
Docker evidence; it's just explicitly out of scope for this setup.

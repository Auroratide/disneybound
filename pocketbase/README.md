# Pocketbase

Disney Bounding uses [Pocketbase](https://pocketbase.io) as its backend for community outfit submissions. It runs as a Docker container and is fully configured via migrations — no manual setup in the admin UI is needed.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose

## First-time setup

1. Copy the example env file and fill in your credentials:

   ```sh
   cp .env.example .env.local
   ```

   Edit `.env.local` and set a real email and a strong password for `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD`.

2. Start the container:

   ```sh
   docker compose up
   ```

   On first boot, Pocketbase will:
   - Run all pending migrations in `pb_migrations/`
   - Create the superuser account from your env vars
   - Create the `community_outfits` collection
   - Start serving at `http://localhost:8090`

3. Verify it's running by visiting `http://localhost:8090/_/` and logging in with the credentials from `.env.local`.

## Daily use

```sh
docker compose up        # start
docker compose down      # stop (data is preserved in the Docker volume)
docker compose down -v   # stop AND wipe all data (destructive!)
```

## Migrations

Schema changes are made by adding a new migration file to `pb_migrations/`. Files run in alphabetical order; use a sequential numeric prefix (`003_`, `004_`, …) to control ordering.

Each file must export a `migrate(up, down)` pair:

```js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // apply change
}, (app) => {
  // revert change
});
```

Migrations run automatically the next time the container starts. They are tracked in the database and never re-run.

## Pocketbase version

The version is pinned in `docker/pocketbase/Dockerfile` via the `PB_VERSION` build arg. To upgrade, change that value and rebuild:

```sh
docker compose build --no-cache
docker compose up
```

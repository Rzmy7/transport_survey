# Railway Deployment

Deploy the repository root as a single Railway service. The root `Dockerfile` builds the frontend, copies the production assets into Laravel, and starts the backend API in one container.

## Required variables

Set these on the Railway service:

- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` set to the Railway service URL
- `APP_KEY`
- `DB_CONNECTION=pgsql`
- `DB_URL` set to the Railway Postgres connection string
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

The frontend is built with `VITE_API_BASE_URL=/api`, so it talks to the backend on the same domain and does not need its own Railway service or separate API URL.

## Database

Add a Railway Postgres database plugin and connect it to the service.

## Notes

- Railway should detect the root `Dockerfile` automatically.
- The container runs migrations and seeds the admin user on startup.
- If you change the admin email or password, redeploy or reseed the backend so the seeded account stays in sync.
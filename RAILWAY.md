# Railway Deployment

Deploy the backend and frontend as two Railway services from the same repository.

## 1. Backend service

Use the `Backend` folder as the service root.

Required variables on Railway:

- `APP_NAME`
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` set to the backend service URL
- `APP_KEY`
- `DB_CONNECTION=pgsql`
- `DB_URL` set to the Railway Postgres connection string
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FRONTEND_URL` set to the frontend service URL

The backend container runs migrations and seeds the admin user on startup.

## 2. Frontend service

Use the `Frontend` folder as the service root.

Required variables on Railway:

- `VITE_API_BASE_URL` set to the backend service URL with `/api`, for example `https://your-backend.up.railway.app/api`

## 3. Database

Add a Railway Postgres database plugin and connect it to the backend service.

## 4. Notes

- The frontend must point at the deployed backend URL, not `localhost`.
- If you change the admin email or password, redeploy or reseed the backend so the seeded account stays in sync.
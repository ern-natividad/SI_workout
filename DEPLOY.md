Deployment checklist and runbook

This project contains a Node/Express backend (`server/`) and a Vite React frontend (project root). The following steps make deploying easier and reproducible.

1) Prepare production database

- Create a MySQL or MariaDB instance and make sure the server can be reached from your backend host.
- Import the provided SQL schema (`workout_app.sql`):

  ```bash
  mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < workout_app.sql
  # Example (local):
  # mysql -h 127.0.0.1 -u root -p workout_app < workout_app.sql
  ```

2) Environment variables (required)

Set these env vars in your hosting dashboard (Render/Heroku/VPS/Windows service):

- `DB_HOST` (host or IP of MySQL)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (e.g. `workout_app`)
- `JWT_SECRET` (strong random string)
- `NODE_ENV=production`

Optional / recommended:
- `FRONTEND_URL` (frontend origin, e.g. `https://www.example.com`) — used to restrict CORS in production
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_AUTH_MAX`
- `MAX_JSON_SIZE`, `MAX_UPLOAD_BYTES`

3) Single-host deployment (recommended for simplicity)

- Build the frontend and serve statically from the Express backend.

  From project root:
  ```bash
  npm install
  npm run build
  ```

- The Vite build is created in the `dist/` folder. Deploy the whole repository and start the backend from the `server/` folder.

  On the host (server/):
  ```bash
  cd server
  npm install --production
  npm start
  ```

  Note: `server/server.js` has code to serve `dist/` when `NODE_ENV=production` and a `dist` folder exists at the repository root. Ensure `dist` is present adjacent to the `server` folder when deploying.

4) Separate-host deployment (frontend and backend split)

- Backend: deploy `server/` as an API service and set required env vars.
- Frontend: deploy Vite `dist` to Vercel/Netlify or similar.
  - Set an environment variable `VITE_API_BASE` in the frontend deployment to the backend API base (e.g. `https://api.example.com`).
  - The frontend code reads `import.meta.env.VITE_API_BASE` and prepends it to `/api` calls when present.
- Ensure the backend allows CORS from the frontend origin (set `FRONTEND_URL` env var or allow origins in provider settings).

5) File storage for avatars/uploads

- The current server stores uploads under `public/uploads` and `public/uploads/avatars` relative to the repo. In production use one of:
  - Persisted filesystem offered by your host (ensure the directory is preserved across deploys)
  - S3-compatible object storage (recommended). Store the uploaded file in S3 and save the S3 URL in the DB.

6) Post-deploy tests

- Health endpoint:
  ```bash
  curl -v https://your-backend.example.com/api/health
  ```
  Expect JSON `{ "status":"OK", "database":"Connected to MySQL" }`.

- Signup test:
  ```bash
  curl -X POST https://your-backend.example.com/api/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"username":"deploy_test","email":"deploy_test@example.com","password":"Test1234!"}'
  ```

- Login test:
  ```bash
  curl -X POST https://your-backend.example.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"deploy_test@example.com","password":"Test1234!"}'
  ```
  Expect JSON including `token` and `user_id`.

- Use the returned JWT to call a protected endpoint (example uses `users` update route):
  ```bash
  curl -X POST https://your-backend.example.com/api/users/17 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <TOKEN>" \
    -d '{"height":"180"}'
  ```

7) Production hardening checklist

- Ensure HTTPS (TLS) is enforced for both frontend and backend.
- Restrict CORS to the known frontend origin by setting `FRONTEND_URL`.
- Keep `JWT_SECRET` secret and rotate if needed.
- Use reasonable rate limits (adjust `RATE_LIMIT_*` in env vars).
- Move file uploads to durable object storage (S3) if you expect multiple instances / auto-scaling.
- Monitor logs and enable automated alerts for 5xx rates and DB errors.

If you want, I can:
- Add automated scripts to copy `dist/` into `server/` for single-host deployments, or
- Create provider-specific steps for Heroku/Render/Vercel with exact env var locations.

End of deploy guide.

---

Docker (local production testing)

1. Build the frontend locally from the repository root:

```pwsh
npm install
npm run build
```

2. You can either copy `dist/` into `server/public` or let the `server/Dockerfile` try to copy `../dist` when building. To copy manually:

```pwsh
rm -rf server/public/*
cp -R dist/* server/public/
```

3. Start the stack for local testing (MySQL + backend):

```pwsh
docker-compose up --build
```

4. The backend will be available at `http://localhost:5000`. Import the `workout_app.sql` into the local MySQL on port 3306.

Notes:
- The included `docker-compose.yml` is for local testing and convenience only. For production, use a managed DB and a proper CI/CD flow.
- Ensure you set secure environment variables (especially `JWT_SECRET`) either in your host or when running containers.


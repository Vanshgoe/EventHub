# EventHub

EventHub is a MERN event management platform for discovering, creating, and registering for events.

## Features

- Event discovery with title/location search and category filters
- Featured events and event detail pages
- JWT signup/login and protected routes
- Event creation, editing, and deletion for organizers
- Event registration with duplicate and capacity checks
- User dashboard for created and registered events
- MongoDB-backed data and sample events

## Project structure

```text
eventhub/
├── backend/
├── frontend/
├── render.yaml
└── PROJECT_PROGRESS.md
```

## Run locally

Requirements: Node.js 22.14.0 or later and npm.

1. Copy `backend/.env.example` to `backend/.env`. For local development, the backend can use an in-memory MongoDB if `MONGO_URI` is blank.
2. Install and start the backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

3. In another terminal, copy `frontend/.env.example` to `frontend/.env.local`, then install and start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:5173.

The local seeded demo account is `demo@eventhub.com` / `demo123`. Production seeding does not use this known password.

## Deploy (Vercel + Render + MongoDB Atlas)

The repository includes a Render Blueprint at `render.yaml` and Vercel SPA routing at `frontend/vercel.json`. Deployment requires your own GitHub, Render, Vercel, and MongoDB Atlas accounts. Never put credentials in the repository.

### 1. Push the project to GitHub

Create an empty private or public GitHub repository, then from PowerShell in the `eventhub` folder:

```powershell
git init
git add .
git commit -m "Prepare EventHub for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Include `render.yaml`, both `package.json` files, and both lockfiles. Do not push `.env` files or `node_modules`. If this folder is already a Git repository, inspect its current status and remotes instead of running `git init` or adding a second remote.

### 2. Create a persistent MongoDB database

1. Create a MongoDB Atlas cluster and database user.
2. In Atlas Network Access, allow connections from Render. For a first deployment, `0.0.0.0/0` works with Render's changing outbound addresses, but restrict access to known static outbound IPs if your hosting plan supports them.
3. Copy the application connection string and replace its username, password, and database name. URL-encode special characters in the database password.

Do not use the in-memory local database for deployment; it is temporary and is deliberately rejected in production.

### 3. Deploy the backend to Render

1. In Render, choose **New → Blueprint** and connect the GitHub repository containing `render.yaml`.
2. Set `MONGO_URI` to the Atlas connection string when prompted. Render generates `JWT_SECRET`.
3. Create the service. Its health endpoint is `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.
4. Copy the backend service URL. In Render's environment settings, set `CLIENT_URL` to the eventual Vercel site origin (for example `https://eventhub-yourname.vercel.app`). Save and redeploy after creating the frontend.

You can also create a Render Web Service manually with root directory `backend`, build command `npm install`, start command `npm start`, and the same environment variables.

### 4. Deploy the frontend to Vercel

1. In Vercel, import the same GitHub repository.
2. Set the project **Root Directory** to `frontend`; use the Vite defaults (`npm run build`, output directory `dist`).
3. Add the environment variable:

   ```text
   VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
   ```

4. Deploy and copy the Vercel site origin (no trailing slash).
5. Set Render's `CLIENT_URL` to that exact origin and redeploy the backend.

For a custom domain, update `CLIENT_URL` on Render to the custom origin and redeploy. `VITE_API_URL` is a public frontend setting, not a secret.

### 5. Verify deployment

- Open the Render `/api/health` URL and confirm it returns `{"status":"ok",...}`.
- Open the Vercel site; confirm event cards load and a detail-page refresh works.
- Create an account, publish an event, register for another event, and confirm the dashboard shows both.
- In Render logs, confirm MongoDB connected via `MONGO_URI`; never accept an in-memory DB message in production.

Render's free web services may sleep when idle and take longer to answer the first request. Use a persistent MongoDB Atlas database regardless of the web service plan.

## Environment variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port; hosting providers set this automatically |
| `MONGO_URI` | Yes in production | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes in production | Secret used to sign JWTs; Render Blueprint generates it |
| `CLIENT_URL` | Yes for browser deployment | Exact frontend origin; comma-separated origins are supported |
| `NODE_ENV` | Yes in production | Set to `production` |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes in production | Backend API base URL ending in `/api` |

## API overview

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Create account | No |
| POST | `/api/auth/login` | Sign in | No |
| GET | `/api/auth/me` | Current user | Yes |
| GET | `/api/events` | Browse/search/filter events | No |
| GET | `/api/events/:id` | Event details | No |
| POST | `/api/events` | Create event | Yes |
| PUT | `/api/events/:id` | Update owned event | Yes |
| DELETE | `/api/events/:id` | Delete owned event | Yes |
| POST | `/api/events/:id/register` | Register for event | Yes |
| GET | `/api/users/me` | User profile | Yes |
| GET | `/api/users/me/events` | Events created by user | Yes |
| GET | `/api/users/me/registrations` | User registrations | Yes |

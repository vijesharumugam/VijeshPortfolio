# Vijesh Portfolio Website

Modern responsive personal portfolio for a fresher in Data Science, AI, and Software Development.

## Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Auth: JWT admin login
- Uploads: Multer + Cloudinary for images and PDF files

## Features

- Sticky responsive navbar with smooth scrolling
- Modern hero section with animated typing effect
- Glassmorphism cards, gradients, animated background, theme toggle
- Dynamic About, Experience, Education, Projects, Certifications, Skills, and Contact sections
- Project modal popup with image carousel
- Contact form with MongoDB message storage
- Admin login at `/edit`
- Admin dashboard with CRUD for portfolio content
- Profile photo, resume, project image, and certificate upload handling
- Seeded starter content and default visual assets

## Folder Structure

```text
frontend/
  index.html
  edit/
    index.html
    dashboard/index.html
  assets/
    css/
    js/

backend/
  config/
  controllers/
  middleware/
  models/
  public/uploads/
  routes/
  utils/
  package.json
  server.js
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example` and update:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- optionally `ADMIN_PASSWORD_HASH` if you want a bcrypt hash instead of plain `ADMIN_PASSWORD`

Run the API:

```bash
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### 2. Frontend

Serve the `frontend` folder with any static server.

Example using VS Code Live Server:

- Open the `frontend` folder
- Start Live Server
- Keep the frontend URL added inside backend `CLIENT_URL`

If your frontend runs on a different URL, either:

- update `CLIENT_URL` in backend `.env`
- or set `localStorage.setItem("portfolioApiRoot", "http://localhost:5000")` in the browser console if needed

## Admin Login

- URL: `/edit`
- Default username: `Vijesh`
- Default password: `Vijesh26@1`

Change these in production through backend environment variables.

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user and password.
3. Open Network Access and allow your deployment IP or `0.0.0.0/0` for testing.
4. Copy the connection string.
5. Paste it into `MONGODB_URI` in backend `.env`.
6. Start the backend once. The app seeds starter portfolio data automatically if the collections are empty.

## Cloudinary Setup

1. Create an account at Cloudinary.
2. Open the Cloudinary dashboard.
3. Copy these values:
   - `Cloud name`
   - `API Key`
   - `API Secret`
4. Put them into backend `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Restart the backend.
6. Check:

```text
http://127.0.0.1:5000/api/health
```

You should see:

```json
{
  "message": "Portfolio API running",
  "databaseConnected": true,
  "cloudinaryConfigured": true
}
```

## API Overview

- `POST /api/auth/login`
- `GET /api/auth/session`
- `GET /api/profile`
- `PUT /api/profile`
- `GET/POST/PUT/DELETE /api/experiences`
- `GET/POST/PUT/DELETE /api/education`
- `GET/POST/PUT/DELETE /api/projects`
- `GET/POST/PUT/DELETE /api/certifications`
- `GET/POST/PUT/DELETE /api/skills`
- `POST /api/messages`
- `GET /api/messages`
- `PUT /api/messages/:id/read`
- `DELETE /api/messages/:id`
- `GET /api/messages/dashboard/summary`

Protected routes require:

```text
Authorization: Bearer <jwt_token>
```

## Deployment

### Frontend on Netlify

1. Push this project to GitHub.
2. In Netlify, create a new site from Git.
3. Set the publish directory to `frontend`.
4. Deploy.
5. Because `frontend/edit/index.html` exists, `/edit` will open the admin login page.
6. In the deployed browser, set `localStorage.setItem("portfolioApiRoot", "https://your-backend-url.onrender.com")` once, or replace the fallback URL in `frontend/assets/js/config.js`.

### Frontend on Vercel

1. Import the repository in Vercel.
2. Configure the project as a static site.
3. Use `frontend` as the output directory.
4. Deploy and confirm `/edit` and `/edit/dashboard/` resolve correctly.
5. Point the frontend to your deployed backend using `frontend/assets/js/config.js` or the `localStorage` override above.

### Backend on Render

1. Create a new Web Service from the repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
   - `CLIENT_URL` set to your Netlify/Vercel frontend URL
6. Deploy.

Note: this project is configured to upload admin media to Cloudinary. The seeded default demo assets still come from the local `/uploads/defaults` folder.

### Backend on Railway

1. Create a new project from GitHub.
2. Set the service root to `backend`.
3. Add the same environment variables used for Render.
4. Deploy and copy the public backend URL.
5. Update the frontend API root to that backend URL.

## Production Notes

- Replace the default admin password before going live.
- Prefer `ADMIN_PASSWORD_HASH` for production.
- Update seeded placeholder links, email, phone number, and social URLs from the admin dashboard.
- Upload your real resume PDF, profile photo, project screenshots, and certificates after first login.

## Verification Performed

- Project structure created from scratch
- JavaScript syntax check passed with `node --check` across frontend and backend `.js` files

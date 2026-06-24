# Deployment Guide - Spreetail HR Portal

This guide provides instructions on how to deploy the Spreetail HR Portal (Backend and Frontend).

## Prerequisites
1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Neon Database**: Create a PostgreSQL database on [Neon.tech](https://neon.tech/) and get the `DATABASE_URL`.
3.  **Accounts**: Create accounts on [Render.com](https://render.com/) and [Vercel.com](https://vercel.com/).

---

## Option 1: Unified Deployment on Render (Easiest)

Render can host both your backend and frontend using the `render.yaml` file at the root.

1.  Log in to [Render](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will detect the `render.yaml` and show the services to be created.
5.  Set the following environment variables in the Render dashboard when prompted:
    *   `DATABASE_URL`: Your Neon PostgreSQL connection string.
    *   `CLIENT_URL`: Set this to `https://spreetail-portal-frontend.onrender.com` (or whatever URL Render gives you for the frontend).
    *   `SMTP_USER` / `SMTP_PASS`: Your email credentials (if using Gmail, use an App Password).

---

## Option 2: Backend on Render + Frontend on Vercel (Recommended for Speed)

This setup uses Vercel's edge network for the frontend, which is faster for users.

### Step 1: Backend (Render)
1.  Log in to [Render](https://dashboard.render.com/).
2.  Create a new **Web Service**.
3.  Connect your repo and set the **Root Directory** to `backend`.
4.  **Build Command**: `npm install`
5.  **Start Command**: `npm start`
6.  Add the Environment Variables from `backend/.env` (DATABASE_URL, JWT secrets, etc.).
7.  Note down the backend URL provided by Render (e.g., `https://spreetail-hr-backend.onrender.com`).

### Step 2: Frontend (Vercel)
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Connect your repo and set the **Root Directory** to `frontend`.
4.  Vercel will detect it as a **Vite** project.
5.  Add the following **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
    *   `VITE_API_BASE_URL`: `https://your-backend-url.onrender.com`
6.  Click **Deploy**.

---

## Post-Deployment: Seeding Data
Once the backend is live, you may want to seed the initial data.
1.  In the Render dashboard, go to your backend service.
2.  Click on **Shell**.
3.  Run: `npm run seed`
    *   **Warning**: This script clears the database and refills it with 1,500 employees. Only run it once for the initial setup.

## Notes on File Uploads
Since Render's free tier uses ephemeral storage, uploaded documents will be deleted whenever the server restarts.
*   **Production Tip**: For persistent storage, consider integrating **AWS S3** or **Cloudinary** for the `uploads` directory.

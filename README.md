# 🚀 BarangayConnect Deployment & Setup Guide

BarangayConnect is a full-stack Smart Barangay Management System configured for cloud deployment on **Neon (PostgreSQL)**, **Render (Express API)**, and **Vercel (React Frontend)**.

---

## 🗄️ Step 1: Database Setup (Neon)

1. Sign in or register at [Neon](https://neon.tech).
2. Create a new project named `barangayconnect`.
3. Open the **SQL Editor** tab in Neon.
4. Copy the contents of [`database/schema.sql`](file:///c:/Users/abero/OneDrive/Documents/barangayhall/database/schema.sql) and execute it.
5. Copy the contents of [`database/seed.sql`](file:///c:/Users/abero/OneDrive/Documents/barangayhall/database/seed.sql) and execute it.
6. Copy your Neon connection string (e.g. `postgresql://user:pass@ep-xxxx.neon.tech/barangayconnect?sslmode=require`).

---

## ⚙️ Step 2: Backend Deployment (Render)

1. Sign in to [Render](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing the `backend` folder.
4. Set the following options:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` = *(Your Neon connection string)*
   - `JWT_SECRET` = *(Generate a secure random 32-character string)*
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-app.vercel.app` *(Update after Vercel deployment)*

---

## 🌐 Step 3: Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Set the following options:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy**.

---

## 💻 Local Development Instructions

### Backend
```bash
cd backend
# Create .env from .env.example and fill DATABASE_URL
npm run dev
# Server starts at http://localhost:5000
```

### Frontend
```bash
cd frontend
# Create .env from .env.example
npm run dev
# Client starts at http://localhost:5173
```

---

## 🔑 Default Seed Credentials

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@barangayconnect.com` | `Admin@123` |
| **Barangay Captain** | `captain@barangayconnect.com` | `Admin@123` |
| **Barangay Staff** | `staff1@barangayconnect.com` | `Admin@123` |
| **Resident** | `resident1@barangayconnect.com` | `Admin@123` |

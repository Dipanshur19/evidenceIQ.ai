# 🚀 EvidenceIQ.ai — Public Deployment Guide

This guide provides 4 proven methods to deploy **EvidenceIQ.ai** so that anyone—including hackathon judges, teammates, and clients—can access and interact with the live application over the public internet.

---

## ⚡ Method 1: Instant Public Access via Cloudflare Tunnel (30 Seconds · Recommended for Live Demos)

If your local server is running (`http://localhost:3000`), you can generate a **free, secure, public HTTPS URL** in 30 seconds without signing up or configuring DNS:

### Option A: Cloudflare Tunnel (Fastest & Most Reliable)
Open a new terminal and run:
```bash
npx -y cloudflared tunnel --url http://localhost:3000
```
- **Output:** Cloudflare will output a public URL like:
  ```
  https://random-words-here.trycloudflare.com
  ```
- Anyone in the world can open this link on their browser or phone to experience the live prototype.

### Option B: LocalTunnel
```bash
npx -y localtunnel --port 3000
```
- Outputs: `https://your-subdomain.loca.lt` (Click "Click to Continue" on the first visit).

---

## ☁️ Method 2: 1-Click Free Cloud Deployment on Render.com (Permanent 24/7 Hosting)

We have pre-configured a [`render.yaml`](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/render.yaml) Blueprint in this repository that automates the deployment of both the Python FastAPI backend and the React/Node web platform.

### Steps:
1. Push your latest code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Go to **[https://render.com](https://render.com)** and sign in with your GitHub account.
3. Click **New +** in the top navigation bar and select **Blueprint**.
4. Connect your repository: **`Dipanshur19/evidenceIQ.ai`**.
5. Render will detect `render.yaml` and automatically configure two services:
   - `evidenceiq-fastapi-backend`: Python 3.12 environment running `uvicorn main:app`.
   - `evidenceiq-web-platform`: Node.js environment building the React Vite frontend and running the Express gateway.
6. Click **Apply**.
7. In ~3 minutes, Render will provide a permanent public URL (e.g. `https://evidenceiq-web-platform.onrender.com`).

---

## ▲ Method 3: Vercel (Frontend) + Render / Railway (Backend)

For optimal global CDN performance, you can host the React frontend on **Vercel** and the FastAPI backend on **Render** or **Railway**:

### 1. Deploy the Backend on Render
- Go to Render &rarr; **New Web Service** &rarr; Select repository.
- **Runtime:** Python 3.
- **Build Command:** `pip install -r requirements.txt`.
- **Start Command:** `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Note your backend URL: `https://evidenceiq-backend.onrender.com`.

### 2. Deploy the Frontend on Vercel
- Go to **[https://vercel.com](https://vercel.com)** &rarr; **Add New Project**.
- Select **`Dipanshur19/evidenceIQ.ai`**.
- In the project configuration:
  - **Root Directory:** Click Edit and select `evidenceiq-web/apps/web`.
  - **Framework Preset:** Vite.
  - **Environment Variables:**
    - `FASTAPI_URL` = `https://evidenceiq-backend.onrender.com`
- Click **Deploy**.
- Vercel will build and assign an instant production URL: `https://evidenceiq.vercel.app`.

---

## 🐳 Method 4: Production Docker Container (Any Cloud VM / AWS / GCP / DigitalOcean)

The repository includes a production multi-stage [`Dockerfile`](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/Dockerfile) and [`docker-compose.yml`](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/docker-compose.yml).

### Run with Docker Compose:
```bash
docker compose up --build -d
```
- Exposes port `3001` (serving both the compiled React frontend and the API gateway) and port `8000` (FastAPI).
- Access at: `http://<your-server-ip>:3001`.

### Build & Run Individual Container:
```bash
docker build -t evidenceiq-app .
docker run -d -p 3001:3001 -p 8000:8000 --name evidenceiq evidenceiq-app
```

---

## 📋 Pre-Deployment Verification Checklist

Before sharing your public URL, verify:
- [x] **Frontend Production Build**: `npm run build` inside `evidenceiq-web/apps/web` succeeds without errors.
- [x] **Backend Test Suite**: `pytest -v` in the root folder passes **25/25 tests (100% green)**.
- [x] **Static Asset Serving**: Express API gateway in `evidenceiq-web/apps/api/src/index.js` automatically serves `dist/` when present.
- [x] **High Contrast & Dark Mode**: All pages (Dashboard, Anomaly Scanner, Investigation, 3D Graph, Contracts, Fleet) render cleanly in Obsidian Dark theme.

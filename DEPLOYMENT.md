# CropYield AI – Production Deployment Guide

This guide covers all options for deploying the **CropYield AI** platform to the cloud or on-premise servers.

---

## Architecture Overview

CropYield AI supports two deployment topologies:

1. **Unified Full-Stack Deployment (Recommended)**:
   - The multi-stage `Dockerfile` compiles the React 19 frontend into static production bundles (`frontend/dist`) and embeds them into the FastAPI Python runtime.
   - A single container or process serves **both** the interactive web UI (at `/`) and the ML prediction REST API (at `/api/*`).
   - Benefits: **Single domain, zero CORS configuration, half the cloud hosting cost, and automatic HTTPS.**

2. **Decoupled Architecture**:
   - Frontend hosted on **Vercel** or **Netlify** (Global Edge CDN).
   - Backend hosted on **Render**, **Railway**, or a **VPS** as a standalone Python API service.

---

## Option 1: 1-Click Free Deployment on Render.com (Recommended)

[Render](https://render.com) offers free cloud hosting for Docker web services with automatic SSL certificates.

### Step 1: Initialize Git and Push to GitHub
Open your terminal in the project directory:
```bash
cd C:\Users\dipak\.gemini\antigravity\scratch\cropyieldprediction

# Initialize git if not already done
git init
git add .
git commit -m "Production release of CropYield AI"

# Create a repository on GitHub, then link and push:
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/cropyield-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub account and select the `cropyield-ai` repository.
3. Choose **Docker** as the Runtime (Render automatically detects [`Dockerfile`](./Dockerfile) and [`render.yaml`](./render.yaml)).
4. Set the **Instance Type** to **Free**.
5. Click **Create Web Service**.

> Render will build the React frontend, set up Python 3.12, load the Random Forest ML model, and give you a live public URL:  
> `https://cropyield-ai-xxxx.onrender.com`

---

## Option 2: Deployment on Railway.app

[Railway](https://railway.app) provides fast, modern cloud infrastructure with zero configuration.

### Steps:
1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select your `cropyield-ai` repository.
4. Railway automatically detects the `Dockerfile` and deploys both the frontend and backend.
5. In project **Settings** $\rightarrow$ **Networking**, click **Generate Domain** to get your public HTTPS URL.

---

## Option 3: Decoupled Deployment (Vercel + Render)

If you prefer hosting the React frontend on Vercel's global CDN:

### Part A: Deploy Backend to Render
1. Deploy the repository to Render following **Option 1**, but with start command:
   ```bash
   uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
   ```
2. Note your backend URL: `https://cropyield-backend.onrender.com`.

### Part B: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and import the repository.
2. Set the **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   ```
   VITE_API_URL = https://cropyield-backend.onrender.com/api
   ```
4. Click **Deploy**. Vercel will build and distribute your frontend globally.

---

## Option 4: Self-Hosted Server / VPS (Docker Compose)

For deployment on your own Linux / Windows VPS (AWS EC2, DigitalOcean Droplet, Linode, Ubuntu):

### Prerequisites:
- Docker and Docker Compose installed.

### Steps:
1. Clone the repository on your server:
   ```bash
   git clone https://github.com/<YOUR_GITHUB_USERNAME>/cropyield-ai.git
   cd cropyield-ai
   ```

2. Start the container in detached mode:
   ```bash
   docker compose up -d --build
   ```

3. The application will be live at:
   `http://<YOUR_SERVER_IP>:8000`

### Optional: Nginx Reverse Proxy with Free SSL (Let's Encrypt)
Add this configuration block to `/etc/nginx/sites-available/cropyield`:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Run `certbot --nginx -d yourdomain.com` for instant HTTPS!

---

## Option 5: Local Production Mode (Single Port)

If you want to run the compiled production build locally without running two separate servers:

Double click **[`start_production.bat`](./start_production.bat)** or run:
```powershell
.\start_production.bat
```
This builds the frontend once and serves the complete application directly from FastAPI on **`http://localhost:8000`**.

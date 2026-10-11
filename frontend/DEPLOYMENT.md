# Vercel Deployment Guide for Aequitas Recon Frontend

This React + Vite frontend is pre-configured for 1-click deployment on **Vercel**.

---

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to [https://vercel.com/new](https://vercel.com/new) and select your repository.
3. In **Project Configuration**:
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Framework Preset:** Vite (Auto-detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**:
   - Add `VITE_API_URL` = Your backend URL (e.g. `https://your-fastapi-backend.railway.app` or your public API domain).
   *(Note: You can also change the backend URL directly in the UI via the Gateway Settings modal at any time!)*
5. Click **Deploy**.

---

### Method 2: Deploy via Vercel CLI

```bash
cd "/Users/manishyadav/Desktop/Autonomous Finance Reconciliation Agent/frontend"

# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

---

### Features Included in this React Build:
- **`vercel.json`**: Pre-configured SPA rewrite rules to ensure seamless client-side routing with zero 404s.
- **Dynamic Gateway Setting**: Built-in in-app modal to change or test the backend URL on the fly without redeploying.
- **Ultra-Fast Vite Bundling**: Optimized production bundle built in <700ms.
- **Rich Fintech Dark Aesthetic**: Glassmorphism, real-time KPI stat cards, interactive charts, and 1-click demo logins.

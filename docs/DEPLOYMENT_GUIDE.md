# ResQOne — Cloud Deployment Guide (MongoDB Atlas + Render + Vercel)

Yeh guide step-by-step batati hai ki ResQOne project ko live production par kaise deploy karein:
- **Database**: MongoDB Atlas (Free Cloud Cluster)
- **Backend**: Render (Web Service for Node.js Express + Socket.IO)
- **Frontend**: Vercel (Fast Global Edge Hosting for React + Vite)

---

## STEP 1: MongoDB Atlas Setup (Cloud Database)

1. **Account banayein**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) par sign in karein.
2. **Cluster banayein**:
   - Free **M0 (Shared)** cluster select karein.
   - Provider: AWS (koi bhi nearest region, jaise Mumbai `ap-south-1`).
   - Cluster name: `ResQOneCluster` (ya default).
3. **Database User create karein**:
   - **Security > Database Access > Add New Database User**.
   - Authentication method: `Password`.
   - Username: e.g. `resqone_admin`.
   - Strong Password generate karein aur save kar lein.
   - Role: `Read and write to any database`.
4. **Network Access (IP Whitelist)**:
   - **Security > Network Access > Add IP Address**.
   - Click karein: **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *(Note: Render dynamic IPs use karta hai, isliye 0.0.0.0/0 zaroori hai).*
5. **Connection String copy karein**:
   - Cluster par **Connect** button dabayein > **Drivers** (Node.js).
   - Connection string kuch aisi dikhegi:
     ```
     mongodb+srv://resqone_admin:<password>@cluster0.abcde.mongodb.net/resqone?retryWrites=true&w=majority
     ```
   - `<password>` ko apne actual password se replace karein aur database name `/resqone` daalna na bhoolein.
6. *(Optional) Initial Data Seed*:
   - Apne local machine par backend `.env` me temporary Atlas ka connection string daal kar `npm run seed` chala sakte hain taaki seed admin accounts (Fortis Escorts, Central Admin, response units) cloud database me aa jayein.

---

## STEP 2: Render Par Backend Deploy Karna (Node.js + Socket.IO)

1. **GitHub par code push karein**:
   - Apne ResQOne repository ko GitHub par push karein.
2. **Render Account**: [render.com](https://render.com) par login karein.
3. **New Web Service banayein**:
   - Click: **New +** > **Web Service**.
   - Apna GitHub repository connect karein.
4. **Settings configure karein**:
   - **Name**: `resqone-backend`
   - **Region**: Singapore / Frankfurt (Nearest to your users)
   - **Branch**: `main` (ya jo branch aap use kar rahe hain)
   - **Root Directory**: `backend` *(Bohat important hai: ise `backend` set karein)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: `Free`
5. **Environment Variables add karein** (Render Dashboard > Environment):

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render standard port (Render auto-routes this) |
   | `MONGODB_URI` | `mongodb+srv://resqone_admin:<password>@cluster0.../resqone?retryWrites=true&w=majority` | Atlas Connection String |
   | `JWT_SECRET` | `ek_lamba_random_secret_string_32_characters_plus` | Production JWT Key |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry |
   | `CLIENT_URL` | `https://your-app-name.vercel.app` | Vercel frontend URL (Step 3 ke baad update karein) |

6. **Deploy**:
   - Click **Create Web Service**.
   - Render build aur start karein. Once live, aapko ek URL milega, jaise:
     `https://resqone-backend.onrender.com`
   - Browser me check karein: `https://resqone-backend.onrender.com/api/health` — status **ONLINE** aana chahiye!

---

## STEP 3: Vercel Par Frontend Deploy Karna (React + Vite)

1. **Vercel Account**: [vercel.com](https://vercel.com) par login karein.
2. **New Project Import karein**:
   - Click: **Add New...** > **Project**.
   - Apna GitHub repository select karein.
3. **Project Settings**:
   - **Framework Preset**: `Vite` (Auto-detected).
   - **Root Directory**: Click *Edit* aur select karein `frontend`. *(Bohat important!)*
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables add karein** (Vercel Project Setup screen):

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://resqone-backend.onrender.com/api/v1` *(Apna Render Backend URL + `/api/v1`)* |
   | `VITE_SOCKET_URL` | `https://resqone-backend.onrender.com` *(Apna Render Backend URL bina trailing slash)* |

5. **SPA Routing**:
   - Frontend me humne `frontend/vercel.json` already create kar diya hai, jisse React Router ke deep links (`/citizen`, `/admin`, `/hospital`) refresh karne par 404 nahi honge.
6. **Deploy**:
   - Click **Deploy**.
   - Kuch hi seconds me aapki site live ho jayegi (e.g. `https://resqone.vercel.app`).

---

## STEP 4: CORS Final Linkup (Connecting Frontend to Backend)

1. Vercel se mila live frontend URL copy karein (e.g., `https://resqone.vercel.app`).
2. **Render Dashboard** me jayein > `resqone-backend` > **Environment**.
3. `CLIENT_URL` variable ki value ko update karke apna Vercel URL daal dein:
   - `CLIENT_URL = https://resqone.vercel.app`
4. Render automatically redeploy ho jayega.

---

## ✅ Deployment Checklist & Verification

Deployment ke baad ye test karein:
- [ ] Vercel URL open karein: `https://your-app.vercel.app`
- [ ] `/report-incident` par jaakar naya emergency report submit karein.
- [ ] Central Admin (`admin@resqone.org`) se login karke incident ko approve karein.
- [ ] Socket.IO real-time dispatch check karein.
- [ ] Map markers aur OpenStreetMap tiles load hone verify karein.

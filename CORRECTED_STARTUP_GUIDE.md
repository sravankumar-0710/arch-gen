# ✅ CORRECTED - ArchGen AI Startup Commands

## 🔴 **CRITICAL FIXES APPLIED**

### **Problem 1: Electron Blank Screen**
**Root Cause:** Running `npm run dev` from `src/` folder instead of project root  
**Fix:** Always run from root: `cd archgen-ai && npm run dev`

### **Problem 2: ERR_CONNECTION_REFUSED**
**Root Cause:** Backend `.env` had `PORT=8001` instead of `PORT=8000`  
**Fix:** Updated `backend/.env` to use `PORT=8000`

### **Problem 3: Wrong .env Locations**
**Root Cause:** Mixed backend and frontend vars in same file  
**Fix:** Separated into:
- `archgen-ai/.env` → Frontend vars only (VITE_*)
- `archgen-ai/backend/.env` → Backend vars only

### **Problem 4: Vite Port Not Enforced**
**Root Cause:** Missing `strictPort: true` in vite.config.js  
**Fix:** Added `strictPort: true` to crash if port 5182 is taken

---

## ✅ **CORRECT STARTUP COMMANDS**

### **Terminal 1 - Backend (Port 8000):**
```bash
cd c:\Users\User\Desktop\archgen-ai\backend
python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### **Terminal 2 - Frontend (Port 5182):**
```bash
cd c:\Users\User\Desktop\archgen-ai
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5182/
➜  Network: use --host to expose
➜  press h + enter to show help
```

⚠️ **IMPORTANT:** Run from `archgen-ai/` (root), NOT from `archgen-ai/src/`!

---

### **Terminal 3 - Electron (Optional):**
```bash
cd c:\Users\User\Desktop\archgen-ai
npm run electron:dev
```

**Expected Output:**
```
> archgen-ai@1.0.0 electron:dev
> cross-env NODE_ENV=development electron .

[Electron window opens showing the app]
```

⚠️ **IMPORTANT:** Only run this AFTER both backend and frontend are running!

---

## 🧪 **VERIFICATION STEPS**

### **Step 1: Verify Backend is Running**
```bash
curl http://127.0.0.1:8000/health
```
**Expected Response:**
```json
{"status":"ok"}
```

### **Step 2: Verify Frontend is Running**
Open browser: http://localhost:5182

**Expected:** ArchGen AI login page appears

### **Step 3: Check Browser Console (F12)**
- ✅ NO errors about "ERR_CONNECTION_REFUSED"
- ✅ NO errors about "Failed to fetch"
- ✅ API calls should go to `http://localhost:8000`

### **Step 4: Test Login**
1. Click "Sign up free"
2. Create an account
3. Should redirect to dashboard (no network errors)

---

## 📂 **ENVIRONMENT FILES**

### **File 1: `archgen-ai/.env` (Frontend)**
```env
# Frontend — Vite env vars (must be VITE_ prefixed)
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_VERSION=1.0.0-mvp
```

### **File 2: `archgen-ai/backend/.env` (Backend)**
```env
DATABASE_URL=sqlite:///c:/Users/User/Desktop/archgen-ai/backend/archgen.db
SECRET_KEY=archgen-dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
HOST=127.0.0.1
PORT=8000
GEMINI_API_KEY=AIzaSyCq1SiYMd8VIfeu7Xq_WIGkMCuXM2gdQZk
```

### **File 3: `archgen-ai/src/.env` (Legacy - Can Delete)**
Not needed anymore! Vite reads from root `.env`

---

## 🎯 **QUICK START (EASIEST METHOD)**

### **Option 1: Use Batch Script**
```bash
# Double-click or run:
START_ALL_SERVERS.bat

# Wait 10-15 seconds, then verify:
# - Backend terminal shows "Application startup complete"
# - Frontend terminal shows "Local: http://localhost:5182/"
```

### **Option 2: Manual (Copy-Paste Each Command)**
```bash
# Terminal 1
cd c:\Users\User\Desktop\archgen-ai\backend && python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 (NEW WINDOW)
cd c:\Users\User\Desktop\archgen-ai && npm run dev

# Terminal 3 (NEW WINDOW - Optional)
cd c:\Users\User\Desktop\archgen-ai && npm run electron:dev
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Backend crashes with "DATABASE_URL is not set"**
**Solution:** 
1. Check file exists: `c:\Users\User\Desktop\archgen-ai\backend\.env`
2. Verify it's named `.env` not `_env` or `.env.txt`
3. Make sure it contains `DATABASE_URL=sqlite:///...`

### **Issue: Frontend shows "VITE_API_BASE_URL is not set"**
**Solution:**
1. Check file exists: `c:\Users\User\Desktop\archgen-ai\.env`
2. Verify it contains `VITE_API_BASE_URL=http://localhost:8000`
3. Restart Vite server (Vite only reads .env on startup)

### **Issue: Vite starts on port 5173 instead of 5182**
**Solution:**
1. Port 5182 is already in use
2. Kill existing Vite processes: `tasklist | findstr node` then `taskkill /PID xxxx /F`
3. Or change Electron to use 5173: Edit `electron/main.js` line 31

### **Issue: Electron still shows blank screen**
**Solution:**
1. Stop Electron
2. Verify frontend is running: Open http://localhost:5182 in browser
3. If browser works, try Electron again
4. Check Electron console (F12 in Electron window) for errors
5. Verify `electron/main.js` line 31 matches Vite port

### **Issue: "ERR_CONNECTION_REFUSED" when logging in**
**Solution:**
1. Backend is not running - check Terminal 1
2. Backend crashed - look for Python errors in Terminal 1
3. Wrong port - verify browser is calling `http://localhost:8000` (check Network tab)

---

## 📊 **PORT CONFIGURATION SUMMARY**

| Component | Port | Config File | Config Key |
|-----------|------|-------------|------------|
| Backend | 8000 | `backend/.env` | `PORT=8000` |
| Frontend | 5182 | `vite.config.js` | `server.port` |
| Electron | - | `electron/main.js` | `loadURL('http://localhost:5182')` |

---

## 🎉 **SUCCESS CHECKLIST**

- [ ] Backend terminal shows "Application startup complete"
- [ ] Frontend terminal shows "Local: http://localhost:5182/"
- [ ] `curl http://127.0.0.1:8000/health` returns `{"status":"ok"}`
- [ ] Browser at http://localhost:5182 shows login page
- [ ] No errors in browser console (F12)
- [ ] Can create account and login
- [ ] Electron window opens and shows the app

---

**Last Updated:** 2026-04-01  
**All Issues Fixed:** ✅ Port mismatch, ✅ .env locations, ✅ strictPort, ✅ npm run dev directory

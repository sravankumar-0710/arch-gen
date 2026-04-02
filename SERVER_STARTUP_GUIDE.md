# ArchGen AI - Server Startup Guide

## 📋 **What Was Fixed**

### Issues Found:
1. ❌ **Port Mismatch**: Backend was configured to run on port 8002, but we started it on 8000
2. ❌ **Frontend API calls**: Were trying to connect to port 8002 instead of 8000  
3. ❌ **Electron didn't open**: Process started but window failed to appear
4. ❌ **Browser showing port 5173**: Instead of configured port 5182

### Fixes Applied:
✅ Updated `.env` files to use port **8000** for backend
✅ Updated `src/.env` to point to `http://localhost:8000`
✅ Updated CSP headers in `index.html` to allow port 8000
✅ Created batch scripts for easy server startup

---

## 🚀 **How to Start the Application**

### Method 1: Using Batch Scripts (EASIEST)

**Step 1: Start Backend & Frontend**
```bash
# Double-click this file or run from terminal:
START_ALL_SERVERS.bat
```
This will open 2 new terminal windows:
- Backend (FastAPI) on http://127.0.0.1:8000
- Frontend (Vite) on http://localhost:5182

**Step 2: Wait 10-15 seconds** for servers to initialize

**Step 3a: Use in Browser**
- Open: http://localhost:5182

**Step 3b: Use in Electron Desktop App**
```bash
# Double-click this file or run from terminal:
START_ELECTRON.bat
```

---

### Method 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd c:\Users\User\Desktop\archgen-ai\backend
..\\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\User\Desktop\archgen-ai\src
npm run dev
```

**Terminal 3 - Electron (optional):**
```bash
cd c:\Users\User\Desktop\archgen-ai
npm run electron:dev
```

---

## 🔧 **Configuration Summary**

| Component | Port | URL |
|-----------|------|-----|
| Backend (FastAPI) | 8000 | http://127.0.0.1:8000 |
| API Documentation | 8000 | http://127.0.0.1:8000/docs |
| Frontend (Vite) | 5182 | http://localhost:5182 |
| Electron | - | Loads http://localhost:5182 |

### Environment Variables:
- **Backend**: `c:\Users\User\Desktop\archgen-ai\.env`
  - `PORT=8000`
  - `DATABASE_URL=sqlite:///c:/Users/User/Desktop/archgen-ai/backend/archgen.db`
  - `SECRET_KEY=change-this-to-a-long-random-secret-in-production`

- **Frontend**: `c:\Users\User\Desktop\archgen-ai\src\.env`
  - `VITE_API_BASE_URL=http://localhost:8000`
  - `VITE_APP_VERSION=1.0.0-mvp`

---

## 🛑 **How to Stop Servers**

### If Started with Batch Scripts:
- Simply **close the terminal windows** that opened

### If Started Manually:
- Press `Ctrl+C` in each terminal window
- Or use Task Manager to end the processes

### Using Command Line:
```bash
# Find the processes
tasklist | findstr "python uvicorn node"

# Kill specific process
taskkill /PID <process_id> /F
```

---

## ✅ **Verification Checklist**

After starting servers, verify:

1. **Backend Health Check**:
   - Open: http://127.0.0.1:8000/health
   - Should return: `{"status":"ok"}`

2. **Frontend Loaded**:
   - Open: http://localhost:5182
   - Should show: ArchGen AI login page

3. **API Docs Available**:
   - Open: http://127.0.0.1:8000/docs
   - Should show: Interactive Swagger API documentation

4. **Browser Console** (F12):
   - NO errors about "ERR_CONNECTION_REFUSED"
   - NO errors about port 8002
   - API calls should go to port 8000 ✅

---

## 🎯 **Testing the Application**

### Quick Workflow Test:
1. **Sign Up** - Create a new account
2. **Create Project** - Start a new architectural project
3. **Draw Land** - Use the canvas to draw your plot boundaries
4. **Set Requirements** - Add rooms (bedrooms, kitchen, etc.)
5. **Generate** - Click to generate AI floor plans
6. **View Results** - See 3+ layout variants with Vastu scores

---

## 🐛 **Troubleshooting**

### Issue: "Login failed: Network Error"
**Solution**: Backend is not running or wrong port
- Check backend is running on port 8000
- Verify `.env` has `PORT=8000`
- Check `src/.env` has `VITE_API_BASE_URL=http://localhost:8000`

### Issue: "Frontend on port 5173 instead of 5182"
**Solution**: Vite may auto-increment if port is busy
- Close other Vite instances
- Check if port 5182 is available
- Or update Electron to use 5173: Edit `electron/main.js` line 31

### Issue: "Electron window doesn't open"
**Solution**: 
1. Make sure frontend is running first
2. Check terminal output for errors
3. Try running in browser first to verify setup
4. Update Electron to load correct port in `electron/main.js`

### Issue: "CORS errors in browser console"
**Solution**: Backend CORS is already configured
- Should allow localhost:5182
- Check backend logs for CORS errors
- Verify backend/app.py has proper CORS middleware

---

## 📁 **Project Structure**

```
archgen-ai/
├── backend/              # FastAPI backend (Port 8000)
│   ├── app.py           # Main FastAPI app
│   ├── models/          # SQLAlchemy models
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints
│   └── utils/           # Helper functions
│
├── src/                 # React frontend (Port 5182)
│   ├── pages/           # Page components
│   ├── components/      # Reusable UI components
│   ├── store/           # Zustand state management
│   ├── services/        # API service layer
│   └── index.html       # Entry point
│
├── electron/            # Electron desktop shell
│   ├── main.js          # Main process
│   ├── preload.js       # Preload script
│   └── ipc/             # IPC handlers
│
├── .env                 # Backend environment config
├── START_ALL_SERVERS.bat   # ⭐ Start backend + frontend
└── START_ELECTRON.bat      # ⭐ Start desktop app
```

---

## 🎉 **Success!**

Your ArchGen AI application is configured and ready to run!

**All Phase 1-5 features are complete:**
- ✅ User Authentication (JWT)
- ✅ Project Management (CRUD)
- ✅ Land Input (Polygon drawing)
- ✅ Requirements Configuration
- ✅ AI Layout Generation (3+ variants)
- ✅ Vastu Compliance Scoring
- ✅ Desktop Application (Electron)

---

**Last Updated**: 2026-04-01
**Configuration**: Corrected port 8002 → 8000

# Quest RPG - Complete Local Setup Guide

## 🚀 Quick Start (10 minutes)

### Prerequisites
- Python 3.11+ installed
- Node.js 18+ installed
- Supabase account (free)

---

## Step 1: Setup Supabase (3 minutes)

1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - Name: `quest-rpg`
   - Database Password: (save this)
   - Region: Choose closest
5. Wait for project creation (~2 minutes)

### Get Credentials

**Settings → API:**
- Copy **Project URL** → Save as `SUPABASE_URL`
- Copy **anon public** key → Save as `SUPABASE_ANON_KEY`
- Copy **service_role** key → Save as `SUPABASE_SERVICE_ROLE_KEY`

**Settings → API → JWT Settings:**
- Copy **JWT Secret** → Save as `JWT_SECRET`

### Setup Database

1. Go to **SQL Editor**
2. Click **New Query**
3. Open `backend/supabase/migrations/001_initial_schema.sql`
4. Copy entire file content
5. Paste in SQL Editor
6. Click **Run**
7. Wait for "Success. No rows returned"

---

## Step 2: Setup Backend (3 minutes)

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-jwt-secret-from-supabase
CORS_ORIGINS=http://localhost:3000
DEBUG=true
API_VERSION=v1
JWT_ALGORITHM=HS256
```

**Start backend:**
```bash
uvicorn app.main:app --reload
```

✅ Backend running on http://localhost:8000

Test: Open http://localhost:8000/docs

---

## Step 3: Setup Frontend (3 minutes)

**Open new terminal:**

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start frontend
npm run dev
```

✅ Frontend running on http://localhost:3000

---

## Step 4: Test Everything (1 minute)

1. Open http://localhost:3000
2. Click "Sign up"
3. Create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `test123`
4. Click "Create Account"
5. Login with same credentials
6. Select goal categories (ML, CP, etc.)
7. Click "Start Your Journey"
8. You should see dashboard with quests!

---

## 🎮 Usage

### Daily Workflow

1. Open http://localhost:3000
2. Login (token saved for 365 days)
3. See today's quests
4. Click quests to complete them
5. Watch XP increase
6. Click "Complete Day" to lock
7. Come back tomorrow for new quests!

### Backend API

Swagger UI: http://localhost:8000/docs

Test endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Get quests
curl http://localhost:8000/api/v1/quests
```

---

## 📁 Project Structure

```
quest-rpg/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Entry point
│   │   ├── routers/     # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── models/      # Pydantic models
│   │   └── utils/       # Game logic
│   ├── supabase/
│   │   └── migrations/  # Database schema
│   ├── .env             # Your credentials
│   └── requirements.txt
│
└── frontend/            # Next.js frontend
    ├── src/
    │   ├── app/         # Pages
    │   └── lib/         # API client, state
    ├── .env.local       # API URL
    └── package.json
```

---

## 🔧 Common Issues

### Backend Issues

**"ValidationError: Field required"**
```bash
# Missing .env file
cp .env.example .env
# Edit .env with your Supabase credentials
```

**"Connection refused"**
```bash
# Wrong Supabase credentials
# Double-check URL and keys in Supabase dashboard
```

**"Module not found"**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Issues

**"Failed to fetch"**
```bash
# Backend not running
# Start backend first: uvicorn app.main:app --reload
```

**"Network Error"**
```bash
# Check .env.local has correct API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
```

**Build errors**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

---

## 🚀 Development Tips

### Backend

```bash
# Always activate venv first
source venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload

# Run on different port
uvicorn app.main:app --reload --port 8001
```

### Frontend

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

---

## 📝 Default Quests

After setup, you'll have these quests:
- 🤖 **ML Core (2h)** - 200 XP, Core
- 💻 **CP Practice** - 150 XP, Core
- 💪 **Gym Session** - 100 XP
- 💰 **Expense Tracking** - 50 XP
- 🧘 **Meditation (15min)** - 75 XP
- 📚 **Read (30min)** - 75 XP
- 👨‍💻 **Code Review** - 100 XP

Only quests matching your selected categories will appear.

---

## 🎯 Next Steps

1. Use app daily
2. Build streaks
3. Level up
4. Deploy to production (optional)

### Deploy Backend to Render
See `backend/DEPLOY.md`

### Deploy Frontend to Vercel
```bash
cd frontend
vercel
```

---

## 💡 Features

✅ **Authentication** - 365-day tokens
✅ **Onboarding** - Goal selection
✅ **Daily Quests** - Filtered by goals
✅ **XP System** - Square root scaling
✅ **Levels** - Automatic calculation
✅ **Streaks** - Core quest tracking
✅ **Anti-cheat** - Locked daily runs
✅ **Progress** - Stats & analytics

---

## 🆘 Need Help?

1. Check logs in terminal
2. Read error messages carefully
3. Verify .env files have correct values
4. Make sure both servers are running
5. Check browser console (F12) for frontend errors

---

**You're all set! Start your quest journey! 🎮**
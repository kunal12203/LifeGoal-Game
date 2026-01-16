# Quest RPG - Complete Project Documentation

## 🎮 Project Overview

**Quest RPG** is a gamified productivity application where real-life actions translate into RPG progression. Users complete daily quests across different life categories (ML, CP, Health, Mind, Finance) to earn XP, level up, and maintain streaks.

### Core Concept
- **Daily Runs**: Each day presents a set of quests based on user's selected categories
- **XP & Leveling**: Square root scaling for balanced progression
- **Streaks**: Consecutive day completion for core quests
- **Goals & Milestones**: Long-term epic quests with trackable progress
- **Anti-Cheat**: Locked daily runs prevent retroactive manipulation

---

## 📊 Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT (365-day tokens)
- **Password Hashing**: bcrypt via passlib

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons, custom components
- **Animations**: Framer Motion (planned)

### Infrastructure
- **Backend Hosting**: Render (or Railway)
- **Frontend Hosting**: Vercel
- **Database**: Supabase PostgreSQL

---

## 🏗️ Architecture Overview

### Backend Architecture

```
┌─────────────────────────────────────────────────┐
│                   FastAPI App                    │
├─────────────────────────────────────────────────┤
│  Routers Layer                                   │
│  ├── auth.py (signup, login, onboarding)        │
│  ├── quests.py (CRUD for quests)                │
│  ├── daily_runs.py (daily workflow)             │
│  ├── stats.py (profile, streaks, progress)      │
│  └── goals.py (epic quests, milestones)         │
├─────────────────────────────────────────────────┤
│  Services Layer (Business Logic)                │
│  ├── DailyRunService                            │
│  ├── QuestService                               │
│  ├── StreakService                              │
│  ├── UserService                                │
│  ├── XPService                                  │
│  └── GoalService                                │
├─────────────────────────────────────────────────┤
│  Data Layer                                      │
│  ├── SQLAlchemy Models                          │
│  ├── Pydantic Schemas                           │
│  └── Game Logic Utils                           │
├─────────────────────────────────────────────────┤
│  PostgreSQL (Supabase)                          │
└─────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│              Next.js App Router                  │
├─────────────────────────────────────────────────┤
│  Pages                                           │
│  ├── / (root - routing logic)                   │
│  ├── /login                                      │
│  ├── /signup                                     │
│  ├── /onboarding (category selection)           │
│  ├── /dashboard (main Bento grid)               │
│  └── /stats (analytics view)                    │
├─────────────────────────────────────────────────┤
│  State Management                                │
│  ├── useAuthStore (Zustand + persist)           │
│  └── useGameStore (current run state)           │
├─────────────────────────────────────────────────┤
│  API Layer                                       │
│  ├── api.ts (Axios instance + interceptors)     │
│  ├── authAPI                                     │
│  ├── questAPI                                    │
│  ├── dailyRunAPI                                 │
│  └── statsAPI                                    │
├─────────────────────────────────────────────────┤
│  Components                                      │
│  ├── dashboard/ (quest cards, XP bar)           │
│  ├── shared/ (navigation, footer)               │
│  └── ui/ (primitives)                           │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Core Tables

#### **users**
- `id` (UUID, PK)
- `username` (unique)
- `email` (unique)
- `hashed_password`
- `total_xp` (INT, default 0)
- `current_level` (INT, default 1)
- `goal_categories` (JSON array)
- `has_completed_onboarding` (BOOLEAN)
- `created_at`, `updated_at`

#### **quests**
- `id` (UUID, PK)
- `title`, `description`
- `category` (ML, CP, Health, Mind, Finance)
- `difficulty` (Easy, Medium, Hard)
- `base_xp` (INT)
- `is_core` (affects streaks)
- `is_active` (soft delete)
- `parent_goal_id` (FK to goals, nullable)

#### **daily_runs**
- `id` (UUID, PK)
- `user_id` (FK)
- `date` (DATE, unique per user)
- `total_xp` (INT)
- `is_perfect` (all quests completed)
- `is_locked` (finalized, cannot edit)
- `completed_at` (timestamp when locked)

#### **daily_quest_completions**
- `id` (UUID, PK)
- `daily_run_id` (FK)
- `quest_id` (FK)
- `completed` (BOOLEAN)
- `xp_earned` (INT)
- `completed_at` (timestamp)

#### **streaks**
- `id` (UUID, PK)
- `user_id` (FK)
- `quest_id` (FK)
- `current_streak` (INT)
- `longest_streak` (INT)
- `last_completed_date` (DATE)

#### **goals** (Epic Quests)
- `id` (UUID, PK)
- `user_id` (FK)
- `title`, `description`
- `category`
- `target_date` (nullable)
- `is_completed` (BOOLEAN)
- `xp_reward` (INT, default 500)

#### **milestones**
- `id` (UUID, PK)
- `goal_id` (FK)
- `title`
- `order` (INT, for sequencing)
- `is_completed` (BOOLEAN)

### Key Relationships
- User → Daily Runs (1:N)
- User → Streaks (1:N)
- User → Goals (1:N)
- Goal → Milestones (1:N)
- Daily Run → Quest Completions (1:N)
- Quest → Completions (1:N)
- Quest → Streaks (1:N)

---

## 🎮 Game Mechanics

### XP & Leveling System

**Formula**: Square root scaling
```python
level = floor(sqrt(total_xp / 100)) + 1
xp_for_level(n) = (n - 1)^2 * 100
```

**Example Progression**:
- Level 1: 0 XP
- Level 2: 100 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP
- Level 20: 36,100 XP

### Streak System

**Core Quests** (`is_core = true`) affect streaks:
- Completing a core quest increments streak
- Consecutive days continue the streak
- Missing 1+ days resets streak to 0
- `longest_streak` tracks personal best

**Anti-Cheat Rules**:
- Can only edit today's run
- Can only complete today's run
- Backfill limited to 1 day max
- Once locked, run is immutable

### Daily Run Workflow

1. **Start Run**: Auto-created on dashboard access or manual start
2. **Quest Selection**: Filtered by user's `goal_categories`
3. **Toggle Completion**: Mark quests as done (XP updates in real-time)
4. **Complete Run**: Lock the day to finalize XP and update user level
5. **Streak Update**: Core quests update streak counters

### Perfect Days

A day is "perfect" when ALL quests in the run are completed.

---

## 🔐 Authentication & Security

### JWT Implementation
- **Algorithm**: HS256
- **Expiry**: 365 days
- **Storage**: LocalStorage (frontend), HTTP-only recommended for production
- **Payload**: `{ sub: user_id, exp: timestamp }`

### Password Security
- **Hashing**: bcrypt via passlib
- **Validation**: Min 6 characters (enhance in production)
- **Reset**: Not implemented (add email service)

### Authorization
- **Bearer Token**: `Authorization: Bearer <token>`
- **Middleware**: `get_current_user` dependency
- **Interceptors**: Axios auto-attaches token, handles 401 redirects

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create new user |
| POST | `/api/v1/auth/login` | Login and get token |
| POST | `/api/v1/auth/onboarding` | Set goal categories |
| GET | `/api/v1/auth/me` | Get current user |

### Quests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/quests` | Get all active quests |
| GET | `/api/v1/quests/core` | Get core quests only |
| GET | `/api/v1/quests/{id}` | Get specific quest |
| POST | `/api/v1/quests` | Create quest (admin) |

### Daily Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/daily-runs/start` | Start new daily run |
| GET | `/api/v1/daily-runs/today` | Get/create today's run |
| GET | `/api/v1/daily-runs/{id}` | Get specific run |
| POST | `/api/v1/daily-runs/{id}/complete-quest/{completion_id}` | Toggle quest |
| POST | `/api/v1/daily-runs/{id}/complete` | Lock daily run |
| GET | `/api/v1/daily-runs/history/all` | Get run history |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stats/profile` | User profile with level info |
| GET | `/api/v1/stats/streaks` | All user streaks |
| GET | `/api/v1/stats/progress?days=30` | Progress analytics |
| GET | `/api/v1/stats/heatmap?days=90` | Activity heatmap |

### Goals (Epic Quests)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/goals` | Create new goal |
| GET | `/api/v1/goals` | Get user's goals |
| POST | `/api/v1/goals/milestones/{id}/toggle` | Toggle milestone |

---

## 🚀 Setup & Deployment

### Local Development Setup

**Prerequisites**:
- Python 3.11+
- Node.js 18+
- Supabase account

**Backend Setup**:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

**Frontend Setup**:
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

### Production Deployment

#### Backend (Render)
1. Create new Web Service
2. Connect GitHub repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`
6. Deploy

#### Frontend (Vercel)
```bash
cd frontend
vercel
# Follow prompts, set NEXT_PUBLIC_API_URL to your Render URL
```

#### Database (Supabase)
1. Create project at supabase.com
2. Go to SQL Editor
3. Run migration SQL from `alembic/versions/001_initial_schema.py`
4. Copy credentials to backend `.env`

---

## 🐛 Common Issues & Troubleshooting

### Backend Issues

**"ValidationError: Field required"**
- Missing `.env` file or incomplete variables
- Copy `.env.example` and fill all fields

**"Connection refused to database"**
- Wrong `DATABASE_URL` format
- Supabase credentials incorrect
- Check project is running in Supabase dashboard

**"Table doesn't exist"**
- Run migrations: `alembic upgrade head`
- Check Alembic history: `alembic current`

### Frontend Issues

**"Failed to fetch" / CORS errors**
- Backend not running
- Wrong `NEXT_PUBLIC_API_URL` in `.env.local`
- CORS not configured in backend `config.py`

**"Token expired" / 401 errors**
- JWT_SECRET mismatch between backend and Supabase
- Token corrupted in localStorage
- Clear storage and re-login

**Build errors**
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Database Issues

**Migrations out of sync**
```bash
# Reset and re-run
alembic downgrade base
alembic upgrade head
```

**Duplicate key errors**
- Unique constraint violation
- Check for existing user/quest data
- Use different email/username

---

## 🔄 Development Workflow

### Adding a New Feature

1. **Backend**:
   - Add model in `models.py`
   - Create Pydantic schemas in `schemas.py`
   - Implement service in `services/`
   - Add router endpoints in `routers/`
   - Create migration: `alembic revision --autogenerate -m "add feature"`
   - Apply migration: `alembic upgrade head`

2. **Frontend**:
   - Add API calls in `lib/api.ts`
   - Create page in `app/` directory
   - Add components in `components/`
   - Update store if needed in `lib/store.ts`

### Git Workflow
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR
```

### Testing Locally
```bash
# Backend
cd backend
pytest  # (if tests are set up)

# Frontend
cd frontend
npm run build  # Check for build errors
npm run lint   # Check for linting issues
```

---

## 📋 Default Quests & Categories

### Categories
- **ML** 🤖: Machine Learning, AI research, model training
- **CP** 💻: Competitive Programming, LeetCode, algorithms
- **Health** 💪: Gym, running, nutrition
- **Mind** 🧘: Meditation, reading, journaling
- **Finance** 💰: Budgeting, investing, expense tracking

### Sample Quests
```python
quests = [
    {"title": "ML Core (2h)", "category": "ML", "xp": 200, "is_core": True},
    {"title": "CP Practice", "category": "CP", "xp": 150, "is_core": True},
    {"title": "Gym Session", "category": "Health", "xp": 100, "is_core": False},
    {"title": "Meditation (15min)", "category": "Mind", "xp": 75, "is_core": False},
    {"title": "Expense Tracking", "category": "Finance", "xp": 50, "is_core": False},
]
```

---

## 🎯 Future Enhancements

### High Priority
- [ ] Password reset via email
- [ ] Social features (friends, leaderboards)
- [ ] Quest templates library
- [ ] Mobile app (React Native)
- [ ] Push notifications for streaks

### Medium Priority
- [ ] Custom quest creation by users
- [ ] Achievements/badges system
- [ ] Weekly/monthly challenges
- [ ] Data export functionality
- [ ] Dark/light theme toggle

### Low Priority
- [ ] Multiplayer guilds
- [ ] Quest marketplace
- [ ] AI-powered quest recommendations
- [ ] Integration with fitness trackers
- [ ] Gamification of other life areas

---

## 📚 Key Files Reference

### Backend
- `main.py`: FastAPI app initialization, CORS, routers
- `models.py`: SQLAlchemy ORM models
- `schemas.py`: Pydantic request/response models
- `auth.py`: JWT creation, password hashing, auth middleware
- `game_logic.py`: XP calculations, streak logic, anti-cheat
- `config.py`: Environment variables, settings
- `database.py`: SQLAlchemy engine and session

### Frontend
- `app/layout.tsx`: Root layout, metadata
- `app/page.tsx`: Routing logic (redirects based on auth)
- `app/dashboard/page.tsx`: Main Bento grid interface
- `lib/api.ts`: Axios instance and API functions
- `lib/store.ts`: Zustand stores for auth and game state
- `lib/utils.ts`: Utility functions (formatting, colors)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with clear commit messages
4. Test thoroughly
5. Submit PR with description

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

## 🙏 Acknowledgments

- FastAPI for excellent async Python framework
- Next.js team for App Router architecture
- Supabase for seamless PostgreSQL hosting
- Tailwind CSS for utility-first styling

---

**Built with ❤️ by KK @ VisionIAS**

*Level up your life, one quest at a time.* 🎮✨
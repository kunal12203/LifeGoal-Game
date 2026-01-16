# Quest RPG API Reference

Complete API documentation with request/response examples.

**Base URL**: `http://localhost:8000/api/v1` (local) or `https://your-app.onrender.com/api/v1` (production)

---

## 🔐 Authentication

All protected endpoints require Bearer token in header:
```
Authorization: Bearer <your_jwt_token>
```

### POST `/auth/signup`

Create a new user account.

**Request Body**:
```json
{
  "username": "warrior123",
  "email": "warrior@example.com",
  "password": "securepass123"
}
```

**Response** `201 Created`:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "warrior123",
  "email": "warrior@example.com",
  "total_xp": 0,
  "current_level": 1,
  "goal_categories": [],
  "has_completed_onboarding": false,
  "created_at": "2025-01-16T10:30:00Z"
}
```

**Errors**:
- `400`: Email already registered / Username taken
- `422`: Validation error (missing fields, invalid email, password too short)

---

### POST `/auth/login`

Login and receive JWT token.

**Request Body**:
```json
{
  "email": "warrior@example.com",
  "password": "securepass123"
}
```

**Response** `200 OK`:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 31536000,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "warrior123",
    "email": "warrior@example.com",
    "total_xp": 1250,
    "current_level": 5,
    "goal_categories": ["ML", "CP"],
    "has_completed_onboarding": true,
    "created_at": "2025-01-16T10:30:00Z"
  }
}
```

**Errors**:
- `401`: Incorrect email or password
- `422`: Validation error

---

### POST `/auth/onboarding`

Set user's goal categories after signup. **Requires Auth**.

**Request Body**:
```json
{
  "goal_categories": ["ML", "CP", "Health"]
}
```

**Response** `200 OK`:
```json
{
  "message": "Onboarding completed successfully",
  "goal_categories": ["ML", "CP", "Health"]
}
```

**Errors**:
- `401`: Unauthorized
- `422`: Invalid categories (must be 1-5 from: ML, CP, Health, Mind, Finance)

---

### GET `/auth/me`

Get current authenticated user info. **Requires Auth**.

**Response** `200 OK`:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "warrior123",
  "email": "warrior@example.com",
  "total_xp": 1250,
  "current_level": 5,
  "goal_categories": ["ML", "CP"],
  "has_completed_onboarding": true,
  "created_at": "2025-01-16T10:30:00Z"
}
```

**Errors**:
- `401`: Invalid or expired token
- `404`: User not found

---

## 🎯 Quests

### GET `/quests`

Get all active quests, ordered by category and XP.

**Response** `200 OK`:
```json
[
  {
    "id": "quest-uuid-1",
    "title": "ML Core (2h)",
    "description": "Deep dive into ML theory and practice",
    "category": "ML",
    "difficulty": "Medium",
    "base_xp": 200,
    "is_core": true,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "quest-uuid-2",
    "title": "LeetCode Medium",
    "description": "Solve 3 medium difficulty problems",
    "category": "CP",
    "difficulty": "Medium",
    "base_xp": 150,
    "is_core": true,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### GET `/quests/core`

Get only core quests (those that affect streaks).

**Response**: Same as above, filtered for `is_core: true`

---

### GET `/quests/{quest_id}`

Get specific quest by UUID.

**Response** `200 OK`:
```json
{
  "id": "quest-uuid-1",
  "title": "ML Core (2h)",
  "description": "Deep dive into ML theory and practice",
  "category": "ML",
  "difficulty": "Medium",
  "base_xp": 200,
  "is_core": true,
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Errors**:
- `404`: Quest not found

---

### POST `/quests`

Create a new quest. **Requires Auth** (admin role recommended in production).

**Request Body**:
```json
{
  "title": "Custom Quest",
  "description": "Do something awesome",
  "category": "ML",
  "difficulty": "Hard",
  "base_xp": 300,
  "is_core": false
}
```

**Response** `201 Created`:
```json
{
  "id": "new-quest-uuid",
  "title": "Custom Quest",
  "description": "Do something awesome",
  "category": "ML",
  "difficulty": "Hard",
  "base_xp": 300,
  "is_core": false,
  "is_active": true,
  "created_at": "2025-01-16T12:00:00Z"
}
```

---

## 📅 Daily Runs

### POST `/daily-runs/start`

Start a new daily run for a specific date. **Requires Auth**.

**Request Body** (optional):
```json
{
  "date": "2025-01-16"
}
```

If `date` is omitted, defaults to today.

**Response** `200 OK`:
```json
{
  "id": "run-uuid",
  "user_id": "user-uuid",
  "date": "2025-01-16",
  "total_xp": 0,
  "is_perfect": false,
  "is_locked": false,
  "completed_at": null,
  "created_at": "2025-01-16T08:00:00Z",
  "quests": [
    {
      "completion_id": "completion-uuid-1",
      "quest_id": "quest-uuid-1",
      "title": "ML Core (2h)",
      "description": "Deep dive into ML",
      "category": "ML",
      "difficulty": "Medium",
      "base_xp": 200,
      "is_core": true,
      "completed": false,
      "xp_earned": 0,
      "completed_at": null
    }
  ]
}
```

**Errors**:
- `400`: Daily run already exists / Backfill validation failed
- `401`: Unauthorized

---

### GET `/daily-runs/today`

Get or auto-create today's daily run. **Requires Auth**.

**Response**: Same as `/daily-runs/start`

---

### GET `/daily-runs/{run_id}`

Get specific daily run by UUID. **Requires Auth**.

**Response**: Same structure as above

**Errors**:
- `404`: Daily run not found
- `401`: Unauthorized

---

### POST `/daily-runs/{run_id}/complete-quest/{completion_id}`

Toggle a quest's completion status in a daily run. **Requires Auth**.

**Request**: Empty body

**Response** `200 OK`:
```json
{
  "message": "Quest completion toggled",
  "completed": true,
  "xp_earned": 200
}
```

**Side Effects**:
- Updates `total_xp` on the daily run
- Updates `is_perfect` if all quests completed
- Creates/updates streak if core quest

**Errors**:
- `403`: Run is locked / Not today's run
- `404`: Run or completion not found

---

### POST `/daily-runs/{run_id}/complete`

Finalize and lock a daily run. **Requires Auth**.

**Request**: Empty body

**Response** `200 OK`:
```json
{
  "message": "Daily run completed successfully",
  "locked": true,
  "completed_at": "2025-01-16T22:00:00Z"
}
```

**Side Effects**:
- Sets `is_locked = true`
- Updates user's `total_xp` from all locked runs
- Recalculates user's `current_level`

**Errors**:
- `400`: Run already completed
- `403`: Can only complete today's run
- `404`: Run not found

---

### GET `/daily-runs/history/all?limit=30`

Get user's daily run history. **Requires Auth**.

**Query Parameters**:
- `limit` (int, default=30): Number of runs to return

**Response** `200 OK`:
```json
[
  {
    "id": "run-uuid-1",
    "user_id": "user-uuid",
    "date": "2025-01-16",
    "total_xp": 450,
    "is_perfect": true,
    "is_locked": true,
    "completed_at": "2025-01-16T22:00:00Z",
    "created_at": "2025-01-16T08:00:00Z",
    "quests": [...]
  },
  {
    "id": "run-uuid-2",
    "user_id": "user-uuid",
    "date": "2025-01-15",
    "total_xp": 300,
    "is_perfect": false,
    "is_locked": true,
    "completed_at": "2025-01-15T23:30:00Z",
    "created_at": "2025-01-15T07:00:00Z",
    "quests": [...]
  }
]
```

---

## 📊 Stats

### GET `/stats/profile`

Get comprehensive user profile with level progression. **Requires Auth**.

**Response** `200 OK`:
```json
{
  "user_id": "user-uuid",
  "username": "warrior123",
  "total_xp": 1250,
  "current_level": 5,
  "goal_categories": ["ML", "CP"],
  "has_completed_onboarding": true,
  "xp_in_current_level": 50,
  "xp_needed_for_next_level": 150,
  "xp_for_current_level": 1600,
  "xp_for_next_level": 2500,
  "level_progress_percentage": 25.0,
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Calculations**:
- `xp_in_current_level`: XP earned toward next level
- `xp_needed_for_next_level`: XP remaining to reach next level
- `level_progress_percentage`: Progress from current to next level (0-100)

---

### GET `/stats/streaks`

Get all user streaks with quest details. **Requires Auth**.

**Response** `200 OK`:
```json
[
  {
    "quest_id": "quest-uuid-1",
    "quest_title": "ML Core (2h)",
    "quest_category": "ML",
    "current_streak": 7,
    "longest_streak": 14,
    "last_completed_date": "2025-01-16",
    "is_active": true
  },
  {
    "quest_id": "quest-uuid-2",
    "quest_title": "LeetCode Medium",
    "quest_category": "CP",
    "current_streak": 0,
    "longest_streak": 5,
    "last_completed_date": "2025-01-10",
    "is_active": false
  }
]
```

**Notes**:
- `is_active`: True if completed today or yesterday
- Only core quests have streaks

---

### GET `/stats/progress?days=30`

Get progress analytics for the last N days. **Requires Auth**.

**Query Parameters**:
- `days` (int, default=30): Number of days to analyze

**Response** `200 OK`:
```json
{
  "period_days": 30,
  "total_runs": 28,
  "completed_runs": 25,
  "total_xp_earned": 7500,
  "perfect_days": 12,
  "completion_rate": 83.33,
  "perfect_day_rate": 48.0,
  "xp_progression": [
    {
      "date": "2025-01-01",
      "xp": 300,
      "is_perfect": false,
      "is_locked": true
    },
    {
      "date": "2025-01-02",
      "xp": 450,
      "is_perfect": true,
      "is_locked": true
    }
  ],
  "category_breakdown": [
    {
      "category": "ML",
      "total_quests": 60,
      "completed_quests": 52,
      "completion_rate": 86.67
    },
    {
      "category": "CP",
      "total_quests": 60,
      "completed_quests": 48,
      "completion_rate": 80.0
    }
  ]
}
```

---

### GET `/stats/heatmap?days=90`

Get activity heatmap data. **Requires Auth**.

**Query Parameters**:
- `days` (int, default=90): Number of days to include

**Response** `200 OK`:
```json
{
  "start_date": "2024-10-18",
  "end_date": "2025-01-16",
  "total_days": 90,
  "heatmap": [
    {
      "date": "2024-10-18",
      "xp": 0,
      "level": 0,
      "is_locked": false,
      "is_perfect": false
    },
    {
      "date": "2024-10-19",
      "xp": 350,
      "level": 2,
      "is_locked": true,
      "is_perfect": false
    },
    {
      "date": "2024-10-20",
      "xp": 700,
      "level": 4,
      "is_locked": true,
      "is_perfect": true
    }
  ]
}
```

**Heatmap Levels** (for visual intensity):
- 0: 0 XP (no activity)
- 1: 1-199 XP (low)
- 2: 200-399 XP (medium)
- 3: 400-599 XP (high)
- 4: 600+ XP (very high)

---

## 🏆 Goals (Epic Quests)

### POST `/goals`

Create a long-term goal with milestones. **Requires Auth**.

**Request Body**:
```json
{
  "title": "Master Next.js",
  "description": "Become proficient in Next.js 14",
  "category": "ML",
  "target_date": "2025-06-30",
  "milestones": [
    "Complete official tutorial",
    "Build 3 projects",
    "Deploy to production"
  ]
}
```

**Response** `201 Created`:
```json
{
  "id": "goal-uuid",
  "title": "Master Next.js",
  "category": "ML",
  "target_date": "2025-06-30",
  "is_completed": false,
  "progress_percentage": 0.0,
  "milestones": [
    {
      "id": "milestone-uuid-1",
      "title": "Complete official tutorial",
      "order": 0,
      "is_completed": false
    },
    {
      "id": "milestone-uuid-2",
      "title": "Build 3 projects",
      "order": 1,
      "is_completed": false
    },
    {
      "id": "milestone-uuid-3",
      "title": "Deploy to production",
      "order": 2,
      "is_completed": false
    }
  ]
}
```

---

### GET `/goals`

Get all user goals with milestones. **Requires Auth**.

**Response** `200 OK`:
```json
[
  {
    "id": "goal-uuid",
    "title": "Master Next.js",
    "category": "ML",
    "target_date": "2025-06-30",
    "is_completed": false,
    "progress_percentage": 33.33,
    "milestones": [...]
  }
]
```

**Progress Calculation**:
```
progress_percentage = (completed_milestones / total_milestones) * 100
```

---

### POST `/goals/milestones/{milestone_id}/toggle`

Toggle a milestone's completion status. **Requires Auth**.

**Request**: Empty body

**Response** `200 OK`:
Returns the parent goal with updated milestone statuses.

**Side Effects**:
- If all milestones completed, goal is marked as complete
- User earns `xp_reward` (default 500) when goal completes

---

## ❌ Error Responses

### Standard Error Format

All errors follow this structure:

```json
{
  "detail": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, business logic violation |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Valid token but action not allowed |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error (Pydantic) |
| 500 | Internal Server Error | Server-side bug |

### Example Error Responses

**400 Bad Request**:
```json
{
  "detail": "Daily run for 2025-01-16 already exists"
}
```

**401 Unauthorized**:
```json
{
  "detail": "Could not validate credentials"
}
```

**403 Forbidden**:
```json
{
  "detail": "Can only edit today's run"
}
```

**422 Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## 🔍 Query Parameters Reference

### Pagination & Filtering

Most list endpoints support these parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | varies | Max results to return |
| `days` | int | varies | Time range for stats |
| `offset` | int | 0 | Number of results to skip (not implemented) |

---

## 📝 Request/Response Examples (cURL)

### Signup
```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Get Today's Run
```bash
curl http://localhost:8000/api/v1/daily-runs/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Toggle Quest
```bash
curl -X POST http://localhost:8000/api/v1/daily-runs/{run_id}/complete-quest/{completion_id} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Complete Run
```bash
curl -X POST http://localhost:8000/api/v1/daily-runs/{run_id}/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Testing Tips

### Using Swagger UI
1. Navigate to `http://localhost:8000/docs`
2. Click "Authorize" button
3. Enter: `Bearer YOUR_TOKEN`
4. Test endpoints interactively

### Using Postman
1. Create collection with base URL
2. Add environment variable for token
3. Set Authorization header globally
4. Import OpenAPI spec from `/openapi.json`

---

## 🚦 Rate Limiting

Currently **not implemented**. Recommended for production:
- 100 requests/minute per IP
- 1000 requests/hour per user
- Use Redis + slowapi library

---

## 🔄 API Versioning

Current version: `v1`

Future versions will use URL path versioning:
- `/api/v1/...` (current)
- `/api/v2/...` (future)

Breaking changes will increment major version.

---

**Last Updated**: January 2025  
**API Version**: 1.0.0
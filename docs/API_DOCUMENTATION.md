# API Documentation — Placement Preparation Tracker

> **Base URL:** `http://localhost:5000/api` (development)
> **Authentication:** JWT stored in HttpOnly cookie — sent automatically by browser
> **Response Format:** All responses return JSON

---

## Response Envelope

All API responses follow this structure:

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [ ... ]  // Optional: field-level validation errors
}
```

---

## Authentication Routes (`/api/auth`)

### POST /api/auth/register

**Purpose:** Create a new user account.
**Authentication Required:** No
**Rate Limit:** Shared auth limiter of 10 requests per 15 minutes per IP (login and registration)

**Request Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "MySecurePassword123",
  "agreedToTerms": true
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `name` | Required, string, 2–50 characters |
| `email` | Required, valid email format, normalised to lowercase |
| `password` | Required, minimum 8 characters |
| `agreedToTerms` | Required, must be `true` |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "createdAt": "2026-11-17T10:00:00.000Z"
    }
  },
  "message": "Account created successfully"
}
```
*Sets `token` cookie: HttpOnly, Secure, SameSite=Strict, maxAge=7 days*

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | Missing or invalid fields |
| 400 | `agreedToTerms` is false |
| 409 | Email already registered |
| 429 | Rate limit exceeded |

---

### POST /api/auth/login

**Purpose:** Authenticate an existing user.
**Authentication Required:** No
**Rate Limit:** Shared auth limiter of 10 requests per 15 minutes per IP (login and registration)

**Request Body:**
```json
{
  "email": "alex@example.com",
  "password": "MySecurePassword123"
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `email` | Required, valid email |
| `password` | Required, non-empty |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Alex Johnson",
      "email": "alex@example.com"
    }
  },
  "message": "Login successful"
}
```
*Sets `token` cookie: HttpOnly, Secure, SameSite=Strict, maxAge=7 days*

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | Missing or invalid fields |
| 401 | Invalid email or password (deliberately vague — does not reveal which) |
| 429 | Rate limit exceeded |

---

### POST /api/auth/logout

**Purpose:** Clear the authentication cookie.
**Authentication Required:** No. The endpoint clears the cookie even when there is no valid session.

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
*Clears `token` cookie by setting maxAge=0*

---

### GET /api/auth/me

**Purpose:** Return the currently authenticated user's profile.
**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "createdAt": "2026-11-17T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 401 | No token or invalid/expired token |

*This endpoint is used by the frontend on startup to check if a valid session exists.*

---

## Problem Routes (`/api/problems`)

> All problem routes require authentication. The middleware ensures `req.user` is set before any controller runs. All queries are scoped to `req.user.id`.

---

### GET /api/problems

**Purpose:** Retrieve the authenticated user's problems with optional filtering, searching and pagination.
**Authentication Required:** Yes

**Query Parameters:**
| Parameter | Type | Description | Default |
|---|---|---|---|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page (max 100) | 20 |
| `topic` | string | Filter by DSA topic | - |
| `difficulty` | string | Filter: Easy / Medium / Hard | - |
| `status` | string | Filter by status | - |
| `needsRevision` | boolean | Filter revision problems | - |
| `search` | string | Search in title (case-insensitive) | - |
| `sortBy` | string | Field to sort by | `createdAt` |
| `sortOrder` | string | `asc` or `desc` | `desc` |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "problems": [ { ... problem objects ... } ],
    "pagination": {
      "total": 47,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### POST /api/problems

**Purpose:** Create a new problem record.
**Authentication Required:** Yes

**Request Body:**
```json
{
  "title": "Two Sum",
  "platform": "LeetCode",
  "url": "https://leetcode.com/problems/two-sum/",
  "topic": "Hashing",
  "difficulty": "Easy",
  "status": "solved",
  "dateAttempted": "2026-11-10",
  "notes": "Used a hash map.",
  "approach": "HashMap: store target-current, check if current in map.",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)",
  "needsRevision": false
}
```

**Validation Rules:**
| Field | Rule |
|---|---|
| `title` | Required, 2–200 characters |
| `platform` | Required, one of: LeetCode, Codeforces, HackerRank, CodeChef, GeeksForGeeks, Other |
| `url` | Optional, valid URL if provided |
| `topic` | Required, one of the 18 DSA topic values |
| `difficulty` | Required, one of: Easy, Medium, Hard |
| `status` | Required, one of: not_attempted, attempted, solved, needs_revision |
| `dateAttempted` | Optional, valid date |
| `notes` | Optional, max 2000 characters |
| `approach` | Optional, max 2000 characters |
| `timeComplexity` | Optional, max 50 characters |
| `spaceComplexity` | Optional, max 50 characters |
| `needsRevision` | Optional, boolean, default false |

**Success Response (201):**
```json
{
  "success": true,
  "data": { "problem": { ... full problem object ... } },
  "message": "Problem added successfully"
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | Validation errors |
| 401 | Not authenticated |

---

### GET /api/problems/:id

**Purpose:** Retrieve a single problem by ID.
**Authentication Required:** Yes

**URL Parameter:** `id` — MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": { "problem": { ... full problem object ... } }
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | Invalid ObjectId format |
| 401 | Not authenticated |
| 404 | Problem not found or does not belong to the authenticated user |

---

### PUT /api/problems/:id

**Purpose:** Update an existing problem.
**Authentication Required:** Yes
**Ownership Check:** Yes — user can only update their own problems.

**Request Body:** Same fields as POST, all optional. Only provided fields are updated.

**Success Response (200):**
```json
{
  "success": true,
  "data": { "problem": { ... updated problem object ... } },
  "message": "Problem updated successfully"
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | Validation errors or invalid ID |
| 401 | Not authenticated |
| 404 | Problem not found or does not belong to the authenticated user |

---

### DELETE /api/problems/:id

**Purpose:** Permanently delete a problem record.
**Authentication Required:** Yes
**Ownership Check:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "message": "Problem deleted successfully"
}
```

**Error Responses:**
| Status | Condition |
|---|---|
| 400 | Invalid ObjectId |
| 401 | Not authenticated |
| 404 | Problem not found or does not belong to the authenticated user |

---

## Dashboard Routes (`/api/dashboard`)

---

### GET /api/dashboard/stats

**Purpose:** Return summary statistics calculated from the user's problem records.
**Authentication Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 47,
      "solved": 28,
      "attempted": 10,
      "notAttempted": 5,
      "needsRevision": 4,
      "revisionBacklog": 4,
      "byDifficulty": {
        "Easy": 15,
        "Medium": 24,
        "Hard": 8
      },
      "byTopic": {
        "Arrays": 8,
        "Hashing": 6,
        "Dynamic Programming": 5,
        "...": "..."
      },
      "recentActivity": [
        { "date": "2026-11-17", "count": 3 },
        { "date": "2026-11-16", "count": 2 }
      ]
    }
  }
}
```

*All values are calculated via MongoDB aggregation on the user's problems. No hardcoded values.*

---

### GET /api/dashboard/analytics

**Purpose:** Return data for charts — topic-wise breakdown and activity over time.
**Authentication Required:** Yes

**Query Parameters:**
| Parameter | Description | Default |
|---|---|---|
| `days` | Number of past days for activity chart | 30 |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "topicBreakdown": [
      { "topic": "Arrays", "total": 8, "solved": 5, "needsRevision": 2 }
    ],
    "difficultyBreakdown": [
      { "difficulty": "Easy", "total": 15, "solved": 12 }
    ],
    "activityOverTime": [
      { "date": "2026-11-01", "added": 2, "solved": 1 }
    ],
    "statusBreakdown": [
      { "status": "solved", "count": 28 }
    ]
  }
}
```

---

## HTTP Status Code Reference

| Code | Meaning | Usage |
|---|---|---|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Validation errors, malformed data |
| 401 | Unauthorized | No token, expired token, invalid token |
| 403 | Forbidden | Authenticated but not authorised (ownership check failed) |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g. email already registered) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server error |

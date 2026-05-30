# PM Bot API Reference

## Base URL

| Environment | Base URL |
|---|---|
| **Production (HF Spaces)** | `https://anuj6316-pm-bot-backend.hf.space/api/v1` |
| **Local (Docker Compose)** | `http://localhost:8002/api/v1` |
| **Local (Dev Server)** | `http://localhost:8000/api/v1` |

**WebSocket URLs:**

| Environment | WebSocket URL |
|---|---|
| **Production (HF Spaces)** | `wss://anuj6316-pm-bot-backend.hf.space/ws/chat/` |
| **Local** | `ws://localhost:8002/ws/chat/` |

**API Documentation:**

| Type | URL |
|---|---|
| Swagger UI | `{base_url}/docs/` |
| ReDoc | `{base_url}/redoc/` |
| OpenAPI Schema | `{base_url}/schema/` |

## Authentication

All endpoints require JWT Bearer token unless noted otherwise.

```
Authorization: Bearer <access_token>
```

---

## Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `SECRET_KEY` | Yes | Django secret key | `your-secret-key` |
| `DEBUG` | No | Debug mode (default: False) | `True` |
| `DATABASE_URL` | Yes | PostgreSQL connection URL | `postgresql://user:pass@host:5432/db` |
| `REDIS_HOST` | Yes | Redis server hostname | `localhost` |
| `REDIS_PORT` | No | Redis port (default: 6379) | `6379` |
| `CELERY_BROKER_URL` | Yes | Celery broker URL | `redis://localhost:6379/0` |
| `CELERY_RESULT_BACKEND` | Yes | Celery results backend | `django-db` |
| `PLANE_BASE_URL` | Yes | Plane API base URL | `https://plane.example.com` |
| `PLANE_API_TOKEN` | Yes | Plane API authentication token | `plane-api-token` |
| `PLANE_WORKSPACE_SLUG` | Yes | Plane workspace slug | `my-workspace` |
| `OPENAI_API_KEY` | No | OpenAI API key | `sk-...` |
| `GROQ_API_KEY` | No | Groq API key | `gsk_...` |
| `ANTHROPIC_API_KEY` | No | Anthropic API key | `sk-ant-...` |
| `GEMINI_API_KEY` | No | Google Gemini API key | `AIza...` |
| `LANGFUSE_PUBLIC_KEY` | No | Langfuse public key | `pk-...` |
| `LANGFUSE_SECRET_KEY` | No | Langfuse secret key | `sk-...` |

---

## 1. Authentication

### 1.1 Login

```
POST /auth/token/
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | User email |
| `password` | string | Yes | User password |

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "selected_project": "uuid-here"
  }
}
```

---

### 1.2 Refresh Token

```
POST /auth/token/refresh/
```

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `refresh` | string | Yes |

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 1.3 Blacklist Token (Logout)

```
POST /auth/token/blacklist/
```

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `refresh` | string | Yes |

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "msg": "Token blacklisted"
}
```

---

## 2. User Management

### 2.1 Get Current User Profile

```
GET /user/
```

**Response (200):**

```json
{
  "msg": "User profile fetched successfully",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "projects": ["uuid-1", "uuid-2"],
    "selected_project": "uuid-1",
    "date_joined": "2024-01-15T10:30:00Z"
  }
}
```

**User Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | integer | User ID |
| `username` | string | Username |
| `email` | string | Email (unique) |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `role` | string | `admin`, `developer`, or `consultant` |
| `projects` | array | List of Plane project UUIDs (developers only) |
| `selected_project` | string | Currently selected project UUID |
| `date_joined` | datetime | Account creation date |

---

### 2.2 Update User Profile

```
PUT /user/
```

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `first_name` | string | No |
| `last_name` | string | No |
| `phone_number` | string | No |

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890"
}
```

**Response (200):**

```json
{
  "msg": "User profile updated successfully",
  "data": { ... }
}
```

---

### 2.3 Change Password

```
POST /user/change-password/
```

**Request Body:**

| Field | Type | Required | Validation |
|---|---|---|---|
| `old_password` | string | Yes | Current password |
| `new_password` | string | Yes | Min 8 characters |
| `confirm_password` | string | Yes | Must match new_password |

```json
{
  "old_password": "currentpass",
  "new_password": "newpass123",
  "confirm_password": "newpass123"
}
```

**Response (200):**

```json
{
  "msg": "Password changed successfully"
}
```

**Error (400):**

```json
{
  "msg": "Failed to change password",
  "errors": {
    "old_password": ["Old password is incorrect"],
    "confirm_password": ["Passwords do not match"]
  }
}
```

---

### 2.4 List All Users

```
GET /user/list_users/
```

**Permission:** `admin` or `consultant` only

**Query Params:** None

**Response (200):**

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "admin",
    "projects": [],
    "selected_project": null,
    "date_joined": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "username": "dev1",
    "email": "dev@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "developer",
    "projects": ["uuid-1", "uuid-2"],
    "selected_project": "uuid-1",
    "date_joined": "2024-02-20T14:45:00Z"
  }
]
```

---

### 2.5 Create User

```
POST /user/create-user/
```

**Permission:** `admin` or `consultant` only

**Request Body:**

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email, unique |
| `username` | string | Yes | Unique |
| `password` | string | Yes | Min 8 characters |
| `role` | string | Yes | `admin`, `developer`, `consultant` |
| `projects` | array | No | List of Plane project UUIDs |

```json
{
  "email": "newdev@example.com",
  "username": "newdev",
  "password": "securepass123",
  "role": "developer",
  "projects": ["uuid-1", "uuid-2"]
}
```

**Response (201):**

```json
{
  "msg": "Account created successfully",
  "data": {
    "id": 3,
    "email": "newdev@example.com",
    "username": "newdev",
    "role": "developer",
    "projects": ["uuid-1", "uuid-2"],
    "date_joined": "2024-03-15T12:00:00Z"
  }
}
```

---

### 2.6 Set User Role

```
POST /user/{id}/set-role/
```

**Permission:** `admin` or `consultant` only

**Path Params:**

| Param | Type | Description |
|---|---|---|
| `id` | integer | User ID |

**Request Body:**

| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `role` | string | Yes | `admin`, `developer`, `consultant` |

```json
{
  "role": "consultant"
}
```

**Response (200):**

```json
{
  "msg": "Role updated to consultant for dev@example.com"
}
```

**Note:** Consultants cannot promote users to Admin role.

---

### 2.7 List Projects (from Plane)

```
GET /user/projects/
```

**Description:** Returns projects from Plane that the user has access to. Admins/Consultants see all projects. Developers see only assigned projects.

**Response (200):**

```json
{
  "msg": "Projects fetched successfully",
  "data": [
    {
      "id": "uuid-1",
      "identifier": "PROJ",
      "name": "My Project",
      "description": "Project description",
      "workspace": "workspace-slug",
      "members": [
        {
          "id": "member-uuid",
          "email": "user@example.com",
          "role": 15
        }
      ],
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-03-15T12:30:00Z"
    }
  ]
}
```

---

### 2.8 Set Selected Project

```
POST /user/set-selected-project/
```

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `project_id` | string | Yes |

```json
{
  "project_id": "uuid-1"
}
```

**Response (200):**

```json
{
  "msg": "Selected project updated successfully"
}
```

**Error (403):**

```json
{
  "msg": "You don't have access to this project"
}
```

---

## 3. User API Keys

### 3.1 List User API Keys

```
GET /user/api-keys/
```

**Response (200):**

```json
[
  {
    "provider": "OpenAI",
    "updated_at": "2024-03-15T12:30:00Z"
  }
]
```

**Note:** `api_key` is write-only and never returned in responses for security.

---

### 3.2 Create/Update API Key

```
POST /user/api-keys/
```

**Request Body:**

| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `provider` | string | Yes | `OpenAI`, `Groq`, `Anthropic`, `Google` |
| `api_key` | string | Yes | Provider API key |

```json
{
  "provider": "OpenAI",
  "api_key": "sk-..."
}
```

**Response (201):**

```json
{
  "provider": "OpenAI",
  "updated_at": "2024-03-15T12:30:00Z"
}
```

**Note:** If a key already exists for this provider, it will be updated.

---

### 3.3 List Available Providers

```
GET /user/api-keys/providers/
```

**Response (200):**

```json
[
  {"id": "OpenAI", "label": "OpenAI"},
  {"id": "Groq", "label": "Groq"},
  {"id": "Anthropic", "label": "Anthropic"},
  {"id": "Google", "label": "Google"}
]
```

---

## 4. Agent Sessions (Issue Triage)

### 4.1 List All Sessions

```
GET /sessions/
```

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `page_size` | integer | 20 | Results per page |

**Response (200):**

```json
{
  "count": 45,
  "next": "http://api/sessions/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "plane_issue_id": "uuid-issue-1",
      "status": "COMPLETED",
      "triage_label": "BUG",
      "is_approved": false,
      "created_by": 1,
      "thread_id": "thread-abc",
      "error_log": null,
      "created_at": "2024-03-15T10:00:00Z",
      "updated_at": "2024-03-15T10:05:00Z"
    }
  ]
}
```

**Session Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | integer | Session ID |
| `plane_issue_id` | string | Plane issue UUID |
| `status` | string | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `ARCHIVED` |
| `triage_label` | string | `BUG`, `FEATURE`, `QUESTION` |
| `is_approved` | boolean | Whether draft was approved |
| `created_by` | integer | User ID who created |
| `thread_id` | string | LangGraph thread ID |
| `error_log` | string | Error details if failed |
| `draft_response` | string | AI-generated draft (in detail view) |

---

### 4.2 Get Single Session

```
GET /sessions/{id}/
```

**Response (200):**

```json
{
  "id": 1,
  "plane_issue_id": "uuid-issue-1",
  "status": "COMPLETED",
  "triage_label": "BUG",
  "is_approved": false,
  "created_by": 1,
  "thread_id": "thread-abc",
  "error_log": null,
  "draft_response": "Thank you for reporting this issue. We've identified this as a bug in the login module...",
  "created_at": "2024-03-15T10:00:00Z",
  "updated_at": "2024-03-15T10:05:00Z"
}
```

---

### 4.3 Approve Session

```
POST /sessions/{id}/approve/
```

**Description:** Approve a completed session to trigger posting the draft response to Plane.

**Response (200):**

```json
{
  "status": "Session approved",
  "is_approved": true
}
```

**Errors:**

| Condition | Response |
|---|---|
| Session not completed | `{"error": "Only completed sessions can be approved"}` |
| Already approved | `{"error": "Session is already approved"}` |

---

### 4.4 Sync Session (Re-analyze)

```
POST /sessions/{id}/sync/
```

**Description:** Trigger manual re-analysis for a specific session.

**Response (202):**

```json
{
  "status": "Sync triggered"
}
```

---

### 4.5 Stream Session Logs (SSE)

```
GET /sessions/{id}/logs/
```

**Response:** `text/event-stream`

```
data: Initializing logs for session 1

data: Reasoning process started...

data: Status: COMPLETED

```

---

## 5. Issues (Plane Integration)

### 5.1 List All Issues (Flat)

```
GET /issues/
```

**Description:** Returns a flat list of all issues from all accessible Plane projects.

**Response (200):**

```json
[
  {
    "id": "uuid-issue-1",
    "sequence_id": 1,
    "name": "Login page not loading",
    "description": "Users report blank screen on login",
    "priority": "high",
    "state": "In Progress",
    "state_group": "started",
    "assignees": ["user-uuid-1"],
    "label_ids": ["label-uuid-1"],
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T12:00:00Z",
    "project_id": "project-uuid-1",
    "project_name": "My Project",
    "project_identifier": "PROJ"
  }
]
```

**Issue Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Plane issue UUID |
| `sequence_id` | integer | Issue number in project |
| `name` | string | Issue title |
| `description` | string | Issue description |
| `priority` | string | `urgent`, `high`, `medium`, `low`, `none` |
| `state` | string | State name (e.g., "In Progress") |
| `state_group` | string | State group (e.g., "started") |
| `assignees` | array | List of assignee UUIDs |
| `label_ids` | array | List of label UUIDs |
| `project_id` | string | Parent project UUID |
| `project_name` | string | Parent project name |
| `project_identifier` | string | Project identifier (e.g., "PROJ") |

---

### 5.2 List Issues by Project (Grouped)

```
GET /issues/by_project/
```

**Response (200):**

```json
[
  {
    "project": {
      "id": "project-uuid-1",
      "name": "My Project",
      "identifier": "PROJ",
      "issue_count": 12
    },
    "issues": [
      {
        "id": "uuid-issue-1",
        "name": "Login page not loading",
        "priority": "high",
        "state": "In Progress",
        ...
      }
    ]
  }
]
```

---

### 5.3 Create Issue

```
POST /issues/create/
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | Yes | Plane project UUID |
| `name` | string | Yes | Issue title |
| `description` | string | No | Issue description |
| `priority` | string | No | `urgent`, `high`, `medium`, `low`, `none` (default: `none`) |

```json
{
  "project_id": "project-uuid-1",
  "name": "New bug report",
  "description": "Optional description",
  "priority": "high"
}
```

**Response (201):** Plane API response with created issue data

**Error (400):**

```json
{
  "error": "project_id and name are required."
}
```

---

### 5.4 Create Sub-task

```
POST /issues/create_subtask/
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `project_id` | string | Yes | Plane project UUID |
| `parent_issue_id` | string | Yes | Parent issue UUID |
| `name` | string | Yes | Sub-task title |
| `description` | string | No | Sub-task description |
| `priority` | string | No | `urgent`, `high`, `medium`, `low`, `none` |

```json
{
  "project_id": "project-uuid-1",
  "parent_issue_id": "parent-issue-uuid",
  "name": "Sub-task title",
  "description": "Optional",
  "priority": "medium"
}
```

**Response (201):** Plane API response with created subtask

---

## 6. Chat

### 6.1 List Conversations

```
GET /chat/conversations/
```

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `page_size` | integer | 20 | Results per page |

**Response (200):**

```json
[
  {
    "id": "uuid-conv-1",
    "title": "How to fix login bug?",
    "message_count": 8,
    "last_message": {
      "role": "assistant",
      "content": "To fix the login bug, you need to...",
      "created_at": "2024-03-15T14:30:00Z"
    },
    "created_at": "2024-03-15T10:00:00Z",
    "updated_at": "2024-03-15T14:30:00Z"
  }
]
```

**Conversation Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Conversation UUID |
| `title` | string | Auto-set from first message |
| `message_count` | integer | Total messages |
| `last_message` | object | Most recent message summary |
| `created_at` | datetime | Creation time |
| `updated_at` | datetime | Last update time |

---

### 6.2 Create Conversation

```
POST /chat/conversations/
```

**Request Body:**

| Field | Type | Required |
|---|---|---|
| `title` | string | No |

```json
{
  "title": "Optional title"
}
```

**Response (201):**

```json
{
  "id": "uuid-conv-2",
  "title": "New Conversation",
  "message_count": 0,
  "last_message": null,
  "created_at": "2024-03-15T15:00:00Z",
  "updated_at": "2024-03-15T15:00:00Z"
}
```

---

### 6.3 Get Conversation with Messages

```
GET /chat/conversations/{id}/
```

**Response (200):**

```json
{
  "id": "uuid-conv-1",
  "title": "How to fix login bug?",
  "message_count": 8,
  "last_message": { ... },
  "created_at": "2024-03-15T10:00:00Z",
  "updated_at": "2024-03-15T14:30:00Z",
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "How do I fix the login bug?",
      "tool_calls": null,
      "token_count": 15,
      "created_at": "2024-03-15T10:00:00Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "To fix the login bug, follow these steps...",
      "tool_calls": [
        {
          "name": "get_issue",
          "args": {
            "project_id": "...",
            "issue_id": "..."
          }
        }
      ],
      "token_count": 250,
      "created_at": "2024-03-15T10:00:05Z"
    }
  ]
}
```

**Message Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | integer | Message ID |
| `role` | string | `user`, `assistant`, or `tool` |
| `content` | string | Message content |
| `tool_calls` | array/null | Tool calls made by assistant |
| `token_count` | integer/null | LLM token usage |

---

### 6.4 Get Conversation Messages

```
GET /chat/conversations/{id}/messages/
```

**Response (200):**

```json
[
  {
    "id": 1,
    "role": "user",
    "content": "How do I fix the login bug?",
    "tool_calls": null,
    "token_count": 15,
    "created_at": "2024-03-15T10:00:00Z"
  }
]
```

---

### 6.5 List Available Models

```
GET /chat/models/
```

**Response (200):**

```json
[
  {
    "id": "groq/llama-3.3-70b-versatile",
    "label": "Llama 3.3 70B",
    "provider": "Groq",
    "badge": "Fast · Free tier",
    "env_var": "GROQ_API_KEY",
    "available": true,
    "is_default": true
  },
  {
    "id": "groq/llama3-8b-8192",
    "label": "Llama 3 8B",
    "provider": "Groq",
    "badge": "Fastest",
    "env_var": "GROQ_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "groq/mixtral-8x7b-32768",
    "label": "Mixtral 8x7B",
    "provider": "Groq",
    "badge": "Long context",
    "env_var": "GROQ_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "openai/gpt-4o-mini",
    "label": "GPT-4o mini",
    "provider": "OpenAI",
    "badge": "Recommended",
    "env_var": "OPENAI_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "openai/gpt-4o",
    "label": "GPT-4o",
    "provider": "OpenAI",
    "badge": "Most capable",
    "env_var": "OPENAI_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "anthropic/claude-3-5-haiku-20241022",
    "label": "Claude 3.5 Haiku",
    "provider": "Anthropic",
    "badge": "Fast",
    "env_var": "ANTHROPIC_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "anthropic/claude-3-5-sonnet-20241022",
    "label": "Claude 3.5 Sonnet",
    "provider": "Anthropic",
    "badge": "Balanced",
    "env_var": "ANTHROPIC_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "gemini/gemini-1.5-flash",
    "label": "Gemini 1.5 Flash",
    "provider": "Google",
    "badge": "Fast",
    "env_var": "GEMINI_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "gemini/gemini-2.0-flash",
    "label": "Gemini 2.0 Flash",
    "provider": "Google",
    "badge": "Latest",
    "env_var": "GEMINI_API_KEY",
    "available": true,
    "is_default": false
  },
  {
    "id": "ollama/llama3.2",
    "label": "Llama 3.2",
    "provider": "Ollama",
    "badge": "Local",
    "env_var": null,
    "available": true,
    "is_default": false
  },
  {
    "id": "ollama/mistral",
    "label": "Mistral",
    "provider": "Ollama",
    "badge": "Local",
    "env_var": null,
    "available": true,
    "is_default": false
  }
]
```

**Model Fields:**

| Field | Type | Description |
|---|---|---|
| `id` | string | Model identifier |
| `label` | string | Human-readable name |
| `provider` | string | LLM provider |
| `badge` | string | Short description |
| `env_var` | string/null | Required env var (null for local) |
| `available` | boolean | Whether system or user key is configured |
| `is_default` | boolean | Whether this is the default model |

---

### 6.6 Single-Turn Query

```
POST /chat/chatquery/query/
```

**Description:** One-shot system query combining DB and Plane context.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | string | Yes | User query |
| `model` | string | No | Model ID to use |

```json
{
  "query": "What issues are assigned to me?",
  "model": "openai/gpt-4o"
}
```

**Response (200):**

```json
{
  "query": "What issues are assigned to me?",
  "answer": "You have 3 issues assigned to you across 2 projects...",
  "source": "orchestrator"
}
```

---

## 7. WebSocket (Real-Time Chat)

### 7.1 New Conversation

```
ws://{host}/ws/chat/new/?token={access_token}&model={model_id}
```

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `token` | string | Yes | JWT access token |
| `model` | string | Yes | Model ID (e.g., `openai/gpt-4o`) |

**Connection Flow:**

1. Client connects to WebSocket URL
2. Server validates JWT token
3. Returns connection established message
4. Client sends messages, server streams responses

---

### 7.2 Resume Conversation

```
ws://{host}/ws/chat/{conversation_id}/?token={access_token}&model={model_id}
```

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `token` | string | Yes | JWT access token |
| `model` | string | Yes | Model ID |

---

### 7.3 Message Formats

**Client → Server:**

```json
{
  "type": "chat_message",
  "message": {
    "role": "user",
    "content": "How do I fix this bug?"
  }
}
```

**Server → Client (Streaming):**

```json
{
  "type": "chat_response",
  "message": {
    "role": "assistant",
    "content": "To fix this bug...",
    "done": false,
    "token_count": 150
  }
}
```

**Server → Client (Complete):**

```json
{
  "type": "chat_response",
  "message": {
    "role": "assistant",
    "content": "To fix this bug, you need to...",
    "done": true,
    "token_count": 500
  }
}
```

---

## 8. Dashboard Endpoints (To Be Implemented)

### 8.1 Get Dashboard Stats

```
GET /dashboard/stats/
```

**Response (200):**

```json
{
  "total_projects": 5,
  "total_issues": 127,
  "total_users": 12,
  "total_sessions": 89,
  "pending_triage": 8,
  "completed_today": 15,
  "active_users_today": 4
}
```

**Stats Fields:**

| Field | Type | Description |
|---|---|---|
| `total_projects` | integer | Number of Plane projects |
| `total_issues` | integer | Total issues across all projects |
| `total_users` | integer | Number of registered users |
| `total_sessions` | integer | Total agent sessions |
| `pending_triage` | integer | Sessions with PENDING status |
| `completed_today` | integer | Sessions completed today |
| `active_users_today` | integer | Users active today |

---

### 8.2 Get Activity Feed

```
GET /dashboard/activity/
```

**Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 20 | Number of items to return |

**Response (200):**

```json
{
  "activities": [
    {
      "id": 1,
      "type": "session_approved",
      "description": "Issue PROJ-123 was approved and posted to Plane",
      "user": "admin@example.com",
      "timestamp": "2024-03-15T14:30:00Z",
      "metadata": {
        "issue_id": "uuid-1",
        "triage_label": "BUG"
      }
    },
    {
      "id": 2,
      "type": "user_created",
      "description": "New user dev@example.com was created",
      "user": "admin@example.com",
      "timestamp": "2024-03-15T13:00:00Z",
      "metadata": {
        "new_user_id": 3
      }
    }
  ]
}
```

**Activity Types:**

| Type | Description |
|---|---|
| `session_approved` | Triage session approved |
| `session_completed` | Triage session completed |
| `session_failed` | Triage session failed |
| `user_created` | New user created |
| `user_role_changed` | User role updated |
| `issue_created` | New issue created in Plane |

---

### 8.3 Get Issue Distribution

```
GET /dashboard/issue-distribution/
```

**Response (200):**

```json
{
  "by_triage_label": {
    "BUG": 45,
    "FEATURE": 62,
    "QUESTION": 20
  },
  "by_status": {
    "PENDING": 8,
    "PROCESSING": 3,
    "COMPLETED": 75,
    "FAILED": 3
  },
  "by_priority": {
    "urgent": 5,
    "high": 22,
    "medium": 45,
    "low": 30,
    "none": 25
  }
}
```

---

## 9. Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "detail": "Additional details (optional)",
  "errors": {
    "field_name": ["Error 1", "Error 2"]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `202` | Accepted (async operation) |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `500` | Internal Server Error |
| `502` | Bad Gateway (upstream API error) |

---

## 10. Role-Based Access Control

| Endpoint | Admin | Consultant | Developer |
|---|---|---|---|
| List Users | Yes | Yes | Own + shared projects |
| Create User | Yes | Yes | No |
| Set Role | Yes | Yes (not to admin) | No |
| List Projects | All | All | Assigned only |
| List Sessions | All | All | Own only |
| Approve Session | Yes | Yes | No |
| List Issues | All | All | Assigned projects |

---

## 11. Rate Limits

| Endpoint | Limit | Window |
|---|---|---|
| `/auth/token/` | 10 requests | 1 minute |
| `/chat/chatquery/query/` | 30 requests | 1 minute |
| WebSocket connections | 5 concurrent | Per user |
| WebSocket messages | 10 messages | 1 minute |

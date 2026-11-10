# REST API Reference

All responses use `{ "success": true, "data": ... }` or `{ "success": false, "error": { "code", "message", "details?" } }`. Mutation bodies are JSON. Private endpoints require the HTTP-only session cookie.

| Method | Route | Role | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Validate email/password and create session |
| POST | `/api/auth/logout` | Authenticated | Clear session cookie |
| GET | `/api/auth/me` | Public | Return narrow session or null |
| GET | `/api/books` | Authenticated | Author-owned books; admins may view all; search/status filters |
| GET | `/api/books/:id` | Authenticated | Ownership-safe book detail |
| GET | `/api/author/dashboard` | Author | Aggregated author metrics/activity |
| GET | `/api/tickets` | Author | Owned ticket list; `search`, `status` |
| POST | `/api/tickets` | Author | Create ticket and attempt AI triage |
| GET | `/api/tickets/:id` | Owner/Admin | Ticket plus public messages and minimized context |
| GET | `/api/tickets/:id/messages` | Owner/Admin | Chronological public messages |
| POST | `/api/tickets/:id/messages` | Owner/Admin | Add public reply; closed tickets reject replies |
| GET | `/api/admin/dashboard` | Admin | Workload metrics and distributions |
| GET | `/api/admin/tickets` | Admin | Paginated queue with search/filter/date/sort |
| PATCH | `/api/admin/tickets/:id` | Admin | Change status/category/priority; manual source recorded |
| POST | `/api/admin/tickets/:id/assign` | Admin | Assign current admin and begin progress |
| GET | `/api/admin/tickets/:id/notes` | Admin | Private notes only |
| POST | `/api/admin/tickets/:id/notes` | Admin | Add private note |
| POST | `/api/admin/tickets/:id/ai-draft` | Admin | Generate editable grounded draft |
| POST | `/api/admin/tickets/:id/reclassify` | Admin | Refresh AI triage while preserving manual overrides |

## Important bodies

```json
POST /api/tickets
{ "bookId": "optional Mongo ObjectId or null", "subject": "5-160 chars", "description": "20-5000 chars" }
```

```json
PATCH /api/admin/tickets/:id
{ "status": "Open | In Progress | Resolved | Closed", "category": "exact category", "priority": "Critical | High | Medium | Low" }
```

```json
POST /api/tickets/:id/messages
{ "content": "2-5000 chars" }
```

Typical errors: 400 validation, 401 missing session, 403 wrong role/CSRF, 404 inaccessible resource, 409 closed ticket, 429 rate limit, 500 unexpected server error, 503 AI unavailable.

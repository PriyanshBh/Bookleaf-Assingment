# Architecture

## System shape

```text
Browser (author/admin)
  -> Next.js pages + TanStack Query
  -> REST route handlers (/api)
  -> authentication, authorization, Zod validation
  -> Mongoose models -> MongoDB Atlas
  -> isolated AI service -> Gemini API
```

This is one Vercel-compatible Next.js application. There is no separate Express process. React Server Components protect page layouts; client components handle interactive filtering, mutations, polling, tours, and charts. Every API independently verifies the signed cookie.

## Data model

- `User`: author/admin identity, bcrypt hash, author source ID, contact data.
- `Book`: external book ID, author reference, publication fields, distribution, sales, and royalties.
- `Ticket`: author/book/admin references, lifecycle metadata, AI state/reason/source, timestamps.
- `TicketMessage`: public chronological author/admin conversation.
- `InternalNote`: separate admin-only collection; never joined by author endpoints.

Indexes cover unique email/source IDs, author-book and author-ticket relationships, queue fields, assignment, and chronological messages.

## Authentication and authorization

Login verifies bcrypt and writes a seven-day HS256 token to an HTTP-only SameSite cookie. `proxy.ts` rejects unauthenticated protected pages early, while page layouts and APIs re-verify role claims. Author resource queries always include `author: session.userId`; inaccessible object IDs return 404 to avoid resource enumeration.

## Ticket lifecycle

1. Author input is validated and book ownership checked.
2. Ticket persists with safe fallback metadata.
3. Gemini classification is attempted; a failure only updates AI state.
4. Author/admin messages persist separately and bump ticket activity time.
5. Admins update metadata, assignment and lifecycle timestamps.
6. Internal notes remain on the admin-only collection/endpoint.

## AI lifecycle

Classification combines category and priority in one request. Drafting selects one topical knowledge section, includes a minimized factual DTO, and returns an editable draft. Structured JSON is validated before persistence/display. Manual sources block silent AI overwrites.

## Deployment

Next route handlers use the Node.js runtime required by Mongoose and bcryptjs. The Mongo connection promise is cached on `globalThis` for serverless reuse. All persistent state is external to Vercel. Polling pauses with normal browser behavior and is disabled for resolved/closed ticket conversations.

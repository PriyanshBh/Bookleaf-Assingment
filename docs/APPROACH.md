# BookLeaf Assignment Approach

BookLeaf needs a support system that treats author context—books, production, distribution, and royalties—as part of every conversation. I built one Next.js application with two role-specific workspaces over a shared, authorization-first API and MongoDB model.

I prioritized the complete ticket lifecycle over optional infrastructure: secure demo login, author-scoped books and tickets, persistent conversations, an operational admin queue, assignment and lifecycle controls, private notes, and real Gemini assistance. Every private API independently verifies the session and role. Author resource queries include ownership in the database predicate, and internal notes use a separate model and admin-only endpoints.

AI is deliberately assistive. A ticket is persisted before Gemini runs. One structured request assigns both category and priority; failures retain safe fallback metadata and never block support. Draft generation selects only the relevant policy section plus a minimized factual ticket/book/conversation context. JSON Schema and Zod validate model output, author content is explicitly untrusted, and manual admin overrides cannot be silently replaced. Admins must review and explicitly send drafts.

The interface uses a restrained editorial green palette, compact navigation, real tables and conversation patterns, responsive card alternatives, meaningful empty/loading/error states, and guided tours. TanStack Query polls only active conversations at five seconds without clearing existing data.

The largest trade-off is demo scope: in-memory rate limiting and stateless signed sessions are appropriate for this assignment but should become distributed rate limiting and revocable sessions in production. Attachments are honestly marked unavailable rather than simulated. The referenced official PDF/sample JSON was absent, so the repository includes clearly labeled assignment-shaped data with exact required counts, ready to be replaced by the official records.

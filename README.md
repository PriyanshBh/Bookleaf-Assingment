# BookLeaf Author Support & Communication Portal

A production-oriented full-stack support workspace for BookLeaf Publishing. Authors can review books, sales and royalties, create support tickets, and follow conversations. Support admins get an operational queue, private notes, assignment and lifecycle controls, grounded Gemini classification, priority scoring, and editable response drafts.

## What is implemented

- Secure email/password login for `AUTHOR` and `ADMIN` roles
- Signed, HTTP-only, SameSite session cookies; no browser-stored JWTs
- Backend ownership checks on every author book and ticket lookup
- Author dashboard with real MongoDB aggregates and royalty visualization
- Searchable book library with production/null/zero-financial edge cases
- Complete ticket creation, listing, detail, reply, and five-second active-ticket polling
- Admin workload dashboard, category chart, responsive queue, filters, dates, sorting, and pagination
- Admin status/category/priority changes, self-assignment, replies, and private internal notes
- Real Gemini classification + priority and knowledge-grounded editable drafts
- Manual override protection: later AI reclassification cannot silently replace manual decisions
- Graceful AI fallback: ticket creation succeeds if Gemini is missing, rate-limited, malformed, or unavailable
- Responsive author/admin navigation and role-specific restartable product tours
- Strict TypeScript, ESLint, Vitest, Playwright API tests, and a verified production build

## Stack

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4
- TanStack Query, React Hook Form, Zod, Recharts, Radix primitives, Lucide, Sonner, Driver.js
- MongoDB Atlas + Mongoose with a serverless-safe cached connection
- `@google/genai` using `gemini-2.5-flash` through `v1beta`
- bcrypt password hashing and JOSE-signed cookie sessions
- Vitest and Playwright

## Architecture

The browser talks only to REST route handlers under `/api`. Route handlers validate input, authenticate the cookie, authorize the role and resource, then access MongoDB models. Gemini is isolated in `src/lib/ai`; secrets and database modules are marked server-only. Author-facing responses never query or serialize internal notes.

See [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API.md](docs/API.md), and [AI_INTEGRATION.md](docs/AI_INTEGRATION.md).

## Local setup

Prerequisites: Node.js 22.13+ recommended, npm, MongoDB Atlas access, and optionally a Gemini API key.

```bash
npm install
copy .env.example .env.local
npm run seed
npm run dev
```

Open `http://localhost:3000`.

### Environment

```env
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=at-least-32-random-characters
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_ADMIN_EMAIL=admin@bookleaf.demo
DEMO_ADMIN_PASSWORD=...
DEMO_AUTHOR_PASSWORD=...
NODE_ENV=development
```

`.env.local` is ignored. Gemini is optional at runtime; MongoDB and `JWT_SECRET` are required. Generate a strong session secret with a cryptographic random generator.

## Demo accounts

After `npm run seed`:

- Admin: `admin@bookleaf.demo`
- Author: `priya.sharma@email.com`
- Local demo password: `BookLeafDemo!2026` in the supplied development environment

Change demo passwords through environment variables before sharing a deployment.

## Seed data

`npm run seed` is idempotent, refuses production/non-demo database names, upserts 10 authors and 18 books, and creates representative tickets/messages/private notes. The official assignment PDF and sample JSON referenced by the build brief were not included in the supplied attachments, so `data/bookleaf_sample_data.json` is clearly labeled assignment-shaped demo data. It must be replaced with the official JSON without changing supplied financial values if that file becomes available.

## Commands

```bash
npm run dev
npm run seed
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm start
```

## AI design

New tickets are persisted first, then one structured Gemini call returns an exact category, priority, and reason. Draft generation receives the ticket, recent conversation, relevant book/royalty facts, and only the applicable knowledge-base section. User text is delimited as untrusted content. JSON Schema plus Zod validates every structured result. Deterministic calls disable model thinking to avoid truncated JSON and cap output tokens for predictable cost. Drafts are never sent automatically.

## Deployment to Vercel

1. Push the repository to a Git provider.
2. Import it into Vercel as a Next.js project.
3. Configure all variables from `.env.example` in Vercel.
4. Ensure Atlas Network Access permits Vercel connections and use a least-privilege database user.
5. Run `npm run seed` once against the intended demo database from a trusted environment.
6. Deploy, then verify both roles, one author ticket creation, an admin reply, and a Gemini draft.

The app uses no persistent local filesystem, Redis, background worker, or always-on server. MongoDB connections are cached per serverless instance.

## Security notes

- Passwords use bcrypt cost 12.
- Cookies are HTTP-only, SameSite=Lax, and Secure in production.
- Mutation routes check request Origin where supplied.
- Login and AI actions have basic in-memory per-instance rate limits.
- API inputs and AI output use strict Zod schemas.
- Admin/ownership authorization is repeated inside every sensitive endpoint.
- Internal notes have a separate model and admin-only route.
- Only minimal author/book fields are sent to Gemini.

For a real production rollout, add durable distributed rate limiting, session revocation/storage, audit logs, malware-scanned attachments, SSO/MFA for admins, secret rotation, monitoring, and formal penetration testing.

## Known limitations

- Attachment upload is deliberately shown as unavailable rather than simulated.
- Rate limiting is per serverless instance, suitable for a demo but not abuse-resistant at scale.
- No email/push notification service is included; near-real-time updates use focused polling.
- The supplied credentials were pasted into a chat and should be rotated before any public deployment.
- No public deployment was performed because no Vercel authorization/project was supplied.

# Testing

## Automated checks

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Vitest covers ticket validation, malformed AI output rejection, session signing/tamper failure, exact seed counts, ID/financial invariants, production-book null cases, and topical knowledge selection.

Playwright's API tests use the real local Next server and seeded Atlas database. They verify valid author login, author-only book results, author denial from admin APIs, and prevention of cross-author ticket access by object ID.

## Manual/rendered verification

Verified in Chrome on 2026-11-10:

- desktop login layout and demo credential loading
- author sign-in, protected dashboard, aggregates, chart and product tour
- three-book library with published and in-production edge states
- ticket submission, persistence, redirect and conversation rendering
- graceful fallback during an intentionally observed Gemini API-version failure
- live Gemini reclassification and editable draft via authenticated admin APIs
- author receives HTTP 403 from admin dashboard
- mobile author dashboard and admin queue render without horizontal overflow
- mobile navigation controls and both role-specific tour entry points

Mobile layouts use breakpoint-specific navigation, cards, stacked forms and a collapsible admin context panel. They were verified at a 390 × 844 viewport through headless Chrome.

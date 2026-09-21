# Frontend redesign verification

Date: 21 September 2026.

## Environment and scope

The configured network database was checked through the health endpoint and reported healthy. No test users were added to it and no business records were written to it.

Authenticated write tests used the pre-existing MySQL fixture database on 127.0.0.1. Its schema was synchronized with the current Prisma schema without accepting data loss. The test server used a process-local DATABASE_URL override; the saved .env was not edited. Existing local test credentials were used without resetting a password.

Local-only test records remain identifiable as **UI QA — TattvaTech**, **UI QA Client**, **UI QA Delivery**, and a **12.34 INR** manual payment record with an explicit QA description. One school-ERP demo request was created and stopped. No real payment or container deployment occurred.

## Automated checks

- Production build: passed.
- TypeScript: passed.
- Six UI primitive tests: passed (headings, semantic status, table accessibility/mobile labels, disabled button behavior, live feedback, currency formatting).
- Fourteen unauthenticated smoke assertions: passed in development and production modes (login, protected page redirects, protected APIs).
- Authenticated smoke: passed again against the production build; ten pages and nine list/search APIs returned expected data, dashboard metrics and database health passed, and sign-out revoked the test session.
- Git whitespace/error check: passed.

Commands: `npm run test:ui`, `npm run typecheck`, `npm run build`, `npm run smoke`. The additional `npm run smoke:authenticated` requires SMOKE_EMAIL and SMOKE_PASSWORD for a dedicated local test account; it does not create business records.

## Browser checks

Reviewed desktop views for overview, leads, clients, projects, finance, meetings, follow-ups, infrastructure, demos, search, and login.

- Lead creation: saved, displayed in table, form cleared.
- Client creation: saved and available in project/client selectors.
- Project creation: saved with linked client and decimal deal value.
- Received payment: saved with required client and decimal amount.
- Demo request: displayed as Requested; cancellation left state unchanged; confirmed stop displayed Stopped.
- Search: returned the local QA client, lead, and project.
- Filtering: non-matching input displayed a distinct empty state.
- Mobile navigation: expanded/collapsed correctly, Escape returned focus to the menu button, and route selection closed the disclosure.
- Add-record shortcut: scrolled to and focused the form panel on mobile.
- 320px and 1024px: all ten workspace routes checked for document overflow, correct active route, and primary heading.
- 390px: reviewed stacked tables, forms, search, auth, populated metrics, and mobile menu.
- 768px: reviewed overview; changed metrics to two columns to prevent currency wrapping.
- 1440px: reviewed desktop hierarchy and shared grid alignment.
- Reduced motion is implemented through CSS; assistive-technology and cross-browser certification were not performed.

Issues found and fixed during the pass: desktop menu button cascade conflict, numeric wrapping on mobile/tablet, missing client input for received payments, and inaccessible placement of create forms below long mobile lists.

## Limits

The existing forced-password-change logic was retained, but a password-change submission was not performed; no user's credentials were changed. The new fallback error/404 components compile successfully but do not substitute for a full fault-injection test suite.

These checks verify this frontend redesign, not completion or production certification of phases 0–7. Existing backend gaps—including search permission filtering, result pagination, real demo orchestration, and deferred storage—remain outside this presentation change.

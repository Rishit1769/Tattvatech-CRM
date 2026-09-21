# TattvaTech workspace design system

## Reference and interpretation

Inspected the live [TattvaTech website](https://tattvatech.co.in/) and its published stylesheet `/assets/styles-_JVFCQMA.css` on 21 September 2026. The reference uses warm ivory, cream, deep brown-black ink, orange/copper accents, Inter body typography, Instrument Serif display typography, uppercase tracked labels, numbered structures, and fine architectural borders. Its marketing pages also use gradients, oversized media, and pill-shaped CTAs.

The workspace translates that identity into a quieter operational interface: flat ink buttons, four-pixel control radii, connected metric cells, responsive records tables, and consistent form panels. Marketing gradients, animated grids, and decorative media are deliberately omitted per the redesign brief.

## Tokens

The source of truth is `src/app/globals.css`. Brand-derived values:

| Role | Value |
| --- | --- |
| Background / ivory | `oklch(98.5% .008 80)` |
| Secondary / cream | `oklch(96.5% .014 78)` |
| Hover / sand | `oklch(93% .02 72)` |
| Foreground / ink | `oklch(18% .02 40)` |
| Muted foreground | `oklch(45% .02 45)` |
| Border | `oklch(90% .015 70)` |
| Accent / orange | `oklch(72% .17 52)` |
| Deep orange | `oklch(55% .16 42)` |

Surface, stronger control borders, and muted semantic success/warning/danger tokens are workspace extensions. Small accent text uses deep orange rather than the brighter decorative orange. Status is always communicated with a text label, not color alone.

Inter (400, 500, 600) and Instrument Serif (400) are self-hosted in `public/fonts`, with SIL Open Font License notices. Pages do not make third-party font requests. Monospace is reserved for references and technical metadata.

## Component boundaries

- `ui/primitives.tsx`: PageHeader, SectionHeader, Button, Field, Input, Select, StatusBadge, DataTable, EmptyState, Notice, LoadingSkeleton, and display formatting.
- `ui/resource.tsx`: common fetch/error handling, abortable initial loads, record filtering, refresh, and guarded create forms. Loaded-record filters are explicitly not full-database search.
- `layout/workspace-shell.tsx`: server boundary; passes only display name and role name to the interactive frame.
- `layout/workspace-frame.tsx`: numbered navigation, exact active route, mobile disclosure, Escape handling, skip link, and account controls.
- `auth/auth-shell.tsx`: shared sign-in and password-change composition; existing authentication endpoints and redirects remain intact.

Use real headings, labels, native controls, and semantic tables. Do not add decorative cards where a divider or section will do. Avoid custom modals unless a task genuinely needs one; demo stopping uses an inline confirmation.

## Layout and interaction

- 1440px desktop: persistent sidebar, wide editorial header, connected three-column metrics, records beside a 320px form panel.
- Under 1200px: records and forms stack.
- Under 768px: navigation becomes a disclosure, metrics become two columns, and table cells become labeled stacked rows.
- 44px minimum control height, visible keyboard focus, restrained 180ms state transitions, reduced-motion support.
- Loading never masquerades as an empty result. Errors are live alerts; saves are status messages; pending actions disable duplicate submissions.
- Search is debounced and aborts obsolete requests.

## Scope and existing limitations

This is a presentation redesign, not completion of the entire CRM roadmap. Existing backend permissions and endpoint semantics are unchanged. Meetings and follow-ups now have read-only record views; they previously showed API placeholders. Received-payment entry now includes the client selection required by the existing API.

Demo requests are records, not actual runtime deployments. MinIO remains excluded. Existing server result limits remain; client-side filtering does not add pagination. No invented charts, trend percentages, uptime, or live-monitoring guarantees are shown. A full backend authorization and accounting audit is separate from this UI change.

## Verification

Run `npm run test:ui`, `npm run typecheck`, `npm run build`, and `npm run smoke` against a running server. UI regression checks should cover desktop/mobile, long names, empty/error/loading states, keyboard navigation, sign-in, existing create forms, and demo-stop cancellation. Use isolated local data for write tests; do not seed or modify the configured shared database merely to obtain screenshots.

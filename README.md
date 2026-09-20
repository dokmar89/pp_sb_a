# PassProve — administration portal

Next.js/TypeScript administration source for company accounts, shops, verification records, errors, transactions and settings, with Supabase client/server helpers.

**Status:** Legacy/parallel implementation. Local setup is currently blocked by malformed `package.json`.

## Scope and architecture

- `app/admin/` — administration routes and layouts.
- `components/admin/` — dashboard, tables, detail dialogs and settings UI.
- `lib/supabase/` — database clients and types.
- `supabase/migrations/` — schema and administration-security migrations.
- `middleware.ts` and `hooks/use-admin.ts` — request/UI access-control source.

## Setup blocker

The dependencies object contains a standalone `"@rc-component/color-picker"` entry without a value, so it is not valid JSON. Repair the manifest and reconcile it with the lockfile before installing dependencies. The declared scripts are `dev` (`next dev`), `build` (`next build`) and `start` (`next start`); they have not been executed in this review.

## Maintenance notes

Supabase configuration and policies must be verified in an isolated development project. The `smazat/` directory contains parallel route source; its name is not authorization to delete it. Route guards do not replace backend authorization. No route, migration or application behavior was modified by this README update.

## Portfolio relevance

Provides a reference for operational dashboards, administration workflows and typed database integration. Consolidation and a reproducible build are prerequisites for presenting it as a maintained release.

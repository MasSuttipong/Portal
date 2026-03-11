# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BVTPA Portal — a Next.js application replacing the legacy ASP.NET `ForwardIns.aspx` page. Two parts:
1. **Public Portal** (`/`) — renders insurance company listings, news, and manuals from JSON files. No auth.
2. **Admin Panel** (`/admin/*`) — web UI for editing content, protected by a single shared password.

All content is stored as JSON files in `/content/` — no database.

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **Tailwind CSS** + **shadcn/ui**
- Content stored in `/content/*.json` (read/written via `fs`)
- Admin auth: single password from `ADMIN_PASSWORD` env var, HTTP-only cookie with signed token
- Deployment: Docker or Vercel

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

## Architecture

### Content System
- All portal data lives in `/content/*.json` files: `settings.json`, `manual.json`, `news.json`, `tpacare-check.json`, `insurance-companies.json`, `self-insured.json`, `international-insurance.json`, `deductible.json`
- Portal page reads JSON via `fs.readFileSync` in Server Components (SSR with `dynamic = "force-dynamic"`)
- Admin panel reads/writes JSON via API routes (`GET/PUT /api/admin/content/[filename]`)
- Helper functions in `src/lib/content.ts`

### Auth Flow
- `POST /api/auth/login` — validates password, sets HTTP-only cookie
- `src/middleware.ts` — checks cookie on all `/admin/*` and `/api/admin/*` routes, redirects to `/admin/login` if invalid
- No user accounts — single shared password only

### iClaim Redirect Flow
Company click → confirmation modal → OPD/IPD selection → redirect to `{baseUrl}?code={code}&id={iclaimId}&type={OPD|IPD}`. Companies with `redirectUrl` skip the modal entirely.

### Key Data Model: Company
```typescript
interface Company {
  id: string;
  displayName: string;
  code: string | null;        // iClaim company code
  iclaimId: string | null;    // iClaim numeric ID
  isClickable: boolean;       // false = suspended (plain text + remark)
  isNew: boolean;             // animated "NEW" badge
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string | null;      // shown in red when company is suspended
  redirectUrl?: string;       // custom redirect (skips iClaim modal)
}
```

Self-insured section supports `CompanyGroup` — parent header with nested child companies (e.g., คาราบาวกรุ๊ป with 14 subsidiaries).

### Component Organization
- `src/components/portal/` — public-facing components (CompanyItem, CompanyGroup, IClaimModal, NewBadge, etc.)
- `src/components/admin/` — admin panel components (CompanyTable, CompanyForm, GroupManager, DragDropList, etc.)
- `src/components/ui/` — shadcn/ui primitives

### Section Headings
- "Manual" and "News" headings are **LOCKED** in the component (not editable via admin)
- All other section headings are editable and stored in their respective JSON files

## Content & Language
- Portal content is primarily in **Thai**. Admin labels use Thai (e.g., "บันทึก" for Save, "ดูตัวอย่าง" for Preview).
- The full requirements document is in `BVTPA_Portal_Requirements_Final.md` — refer to it for complete seed data specs, UI patterns, and admin feature details.

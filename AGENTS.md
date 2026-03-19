# AGENTS.md — AI Assistant Context

This file provides context for AI coding tools (Cursor, Copilot, Windsurf, Cline, etc.) working with this codebase.

## Project Overview

**BVTPA Portal** — a Next.js application replacing a legacy ASP.NET page. Two parts:

1. **Public Portal** (`/`) — displays insurance company listings, news, manuals. No auth. Supports holiday themes and bilingual search.
2. **Admin Panel** (`/admin/*`) — web UI for editing all content. Protected by single shared password. Supports Thai/English language toggle.

All content is stored as JSON files in `/content/` — no database.

## Tech Stack

- **Next.js 16.1.6** (App Router, Turbopack) with TypeScript
- **React 19** with Server Components + Client Components
- **Tailwind CSS 4** (oklch color space) + **shadcn/ui** components
- **@dnd-kit** for drag-and-drop reordering
- **Sonner** for toast notifications
- **lucide-react** for icons
- **jose** for JWT (HS256) auth tokens
- Deployment: Docker (multi-stage) or Vercel

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Single shared admin password |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (throws if missing) |
| `COOKIE_SECURE` | No | Set `true` for HTTPS. Defaults `false` (for Docker HTTP) |

## Architecture

### Content System
- JSON files in `/content/`: `settings.json`, `manual.json`, `news.json`, `tpacare-check.json`, `insurance-companies.json`, `self-insured.json`, `international-insurance.json`, `deductible.json`
- Read via `fs.readFileSync` in Server Components (`dynamic = "force-dynamic"`)
- Admin reads/writes via API routes: `GET/PUT /api/admin/content/[filename]`
- Helper: `src/lib/content.ts` (allowlist of 8 filenames, path traversal protection)

### Auth
- `POST /api/auth/login` — validates password, sets HTTP-only JWT cookie (8h expiry)
- `POST /api/auth/logout` — clears cookie
- `src/middleware.ts` — checks cookie on `/admin/*` and `/api/admin/*` routes
- No user accounts — single shared password only

### i18n System
- Admin panel supports Thai (default) and English
- Translation files: `src/lib/i18n/th.ts` (primary type source), `src/lib/i18n/en.ts`
- `LanguageContext` provider in admin layout, `useLanguage()` hook returns `{ language, setLanguage, t }`
- Language persisted in localStorage key `admin-lang`

### Theme System
- 14 built-in holiday/seasonal theme presets
- Admin selects via dropdown in Settings page
- Themes override CSS custom properties via `[data-theme="..."]` selectors in `globals.css`
- `ThemeDecorations` component renders floating emoji animations
- Stored in `settings.json` as `theme.activeTheme`
- Type: `PortalTheme` in `src/types/portal.ts`

## Key File Paths

### Types & Data
- `src/types/portal.ts` — all data interfaces (Company, PortalSettings, PortalTheme, etc.)
- `content/*.json` — content data files

### Portal (Public)
- `src/app/page.tsx` — SSR entry point, reads JSON, passes to PortalPage
- `src/components/portal/PortalPage.tsx` — main portal UI (tabs, search, themes)
- `src/components/portal/CompanyItem.tsx` — company card/list rendering
- `src/components/portal/CompanyList.tsx` — company grid with suspended section
- `src/components/portal/IClaimModal.tsx` — iClaim redirect modal
- `src/components/portal/ThemeDecorations.tsx` — floating theme decorations
- `src/components/portal/AnnouncementBanner.tsx` — configurable alert banner

### Admin
- `src/app/admin/layout.tsx` — admin layout (header, sidebar, language provider)
- `src/components/admin/AdminSidebar.tsx` — navigation with icons
- `src/components/admin/CompanySectionPage.tsx` — shared company editor (used by international, deductible)
- `src/app/admin/insurance/page.tsx` — insurance company editor
- `src/app/admin/self-insured/page.tsx` — self-insured editor (groups + standalone)
- `src/app/admin/settings/page.tsx` — system settings (announcement, logo, iClaim, themes)
- `src/components/admin/LanguageToggle.tsx` — TH/EN switcher

### Shared
- `src/lib/content.ts` — JSON read/write helpers
- `src/lib/auth.ts` — JWT sign/verify, cookie options
- `src/lib/iclaim.ts` — iClaim URL builder
- `src/lib/useAdminContent.ts` — React hook for admin CRUD
- `src/lib/i18n/` — translation system (LanguageContext.tsx, th.ts, en.ts)
- `src/components/ui/` — shadcn/ui primitives

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | No | Validate password, set JWT cookie |
| POST | `/api/auth/logout` | No | Clear session cookie |
| GET | `/api/admin/content/[filename]` | Yes | Read content JSON |
| PUT | `/api/admin/content/[filename]` | Yes | Update content JSON |
| POST | `/api/admin/upload` | Yes | Upload image (PNG/JPG/GIF/WebP, max 5MB) |

## Key Data Models

### Company
```typescript
interface Company {
  id: string;
  displayName: string;        // Shown on portal
  nameEn?: string | null;     // English name (searchable)
  nameTh?: string | null;     // Thai name (searchable)
  code: string | null;        // iClaim company code
  iclaimId: string | null;    // iClaim numeric ID
  isClickable: boolean;       // false = suspended
  isNew: boolean;             // animated "NEW" badge
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string | null;
  redirectUrl?: string;       // custom redirect (skips iClaim modal)
  logoUrl?: string | null;
  alertText?: string | null;
  alertType?: AlertType;
  alertSize?: AlertSize;
  alertBorder?: AlertBorder;
}
```

### PortalTheme
```typescript
type PortalTheme = "default" | "christmas" | "newyear" | "songkran" | "valentine" |
  "chinese-newyear" | "halloween" | "mothers-day" | "fathers-day" |
  "spring" | "summer" | "autumn" | "winter" | "party" | "pride";
```

## Coding Conventions

- Portal content is primarily in **Thai**. Admin labels support Thai and English via i18n.
- Use **shadcn/ui** components from `src/components/ui/`
- Use **Sonner** `toast()` for notifications (not the deprecated toast component)
- Use **lucide-react** for icons
- Tailwind CSS v4 with **oklch** color space
- Admin forms use `useAdminContent<T>(filename)` hook for CRUD
- Company pages use `CompanySectionPage` shared component (international, deductible) or custom pages (insurance, self-insured)
- Section headings for "Manual" and "News" are locked in components (not admin-editable)
- `CompanyGroup` supports parent header with nested child companies (self-insured section)

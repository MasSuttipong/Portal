# BVTPA Portal

A modern Next.js web application that serves as the insurance company portal for BVTPA (Bangkok Vejthani TPA). This project replaces the legacy ASP.NET `ForwardIns.aspx` page with a fast, maintainable, and mobile-friendly portal built on the Next.js App Router.

## Features

### Public Portal (`/`)

- **Insurance Company Listings** -- displays companies across four sections: Insurance Companies, Self-Insured, International Insurance, and Deductible.
- **iClaim Integration** -- clicking a company opens a confirmation modal, lets the user choose OPD or IPD, and redirects to the iClaim system with the correct parameters.
- **Company Groups** -- self-insured section supports parent/child groupings (e.g., a holding company with subsidiaries).
- **News and Manuals** -- dedicated sections for downloadable manuals and news links.
- **TPA Care Check Card** -- quick-access card linking to the TPA care check flow.
- **Announcements** -- configurable site-wide announcement banner with multiple alert styles, glow effects, and border animations.
- **Classic View Toggle** -- users can switch between default and classic list layouts.
- **Thai Language UI** -- portal content is primarily in Thai with Thai-optimized fonts (Prompt and Sarabun).

### Admin Panel (`/admin/*`)

- **Content Management** -- edit all portal sections through a web-based admin interface, no code changes required.
- **Company Management** -- add, edit, reorder, and remove companies with drag-and-drop support.
- **News and Manual Editors** -- manage news items and manual links with publish/unpublish controls.
- **Portal Settings** -- configure the site logo, iClaim base URL, confirmation text, and announcement banners.
- **Live Preview** -- preview changes before publishing.
- **Password-Protected** -- secured with a single shared password and JWT-based session tokens.

## Tech Stack

| Layer           | Technology                                         |
| --------------- | -------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org/) (App Router)     |
| Language        | TypeScript 5                                       |
| UI              | React 19, Tailwind CSS 4, shadcn/ui                |
| Icons           | lucide-react                                       |
| Drag & Drop     | @dnd-kit                                           |
| Auth            | jose (JWT), HTTP-only cookies                      |
| Notifications   | Sonner                                             |
| Data Storage    | JSON files on disk (`/content/*.json`)              |
| Deployment      | Docker (standalone output) or Vercel               |

## Prerequisites

- **Node.js** 20 or later
- **npm** (ships with Node.js)
- **Docker** and **Docker Compose** (optional, for containerized deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Portal
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable         | Description                                    | Example                            |
| ---------------- | ---------------------------------------------- | ---------------------------------- |
| `ADMIN_PASSWORD` | Password used to log into the admin panel      | `my-secure-password`               |
| `JWT_SECRET`     | Secret key for signing JWT session tokens      | `a-long-random-string-min-32-chars`|
| `COOKIE_SECURE`  | Set to `true` only when the site is served over HTTPS | `false`                     |
| `NEXT_PUBLIC_BASE_PATH` | Runtime-only in production. Leave empty for root deployment, or set a subpath like `/portal` when the public URL is mounted under that prefix | `/portal` |

`ADMIN_PASSWORD` and `JWT_SECRET` are required at runtime. The app now fails fast during server startup if either one is missing or blank.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public portal and [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin panel. To simulate the Kong deployment under `/portal`, start the app with `NEXT_PUBLIC_BASE_PATH=/portal` and browse to [http://localhost:3000/portal](http://localhost:3000/portal).

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server             |
| `npm run build`   | Create a generic production build with a base-path placeholder |
| `npm run start`   | Stage a local standalone runtime, patch it from the OS environment, and start the production server |
| `npm run lint`    | Run ESLint                               |

`npm run start` prepares a fresh runtime directory under `.next/runtime-standalone` on each launch, so the same build output can be reused with different `NEXT_PUBLIC_BASE_PATH` values between restarts. The Docker image uses the same startup script so container runtime patching matches local production behavior.

## Project Structure

```
Portal/
├── content/                    # JSON data files (the "database")
│   ├── settings.json           #   Site logo, iClaim config, announcements
│   ├── insurance-companies.json
│   ├── self-insured.json
│   ├── international-insurance.json
│   ├── deductible.json
│   ├── manual.json
│   ├── news.json
│   └── tpacare-check.json
├── public/                     # Static assets (images, logos)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Public portal (SSR, force-dynamic)
│   │   ├── layout.tsx          # Root layout (Thai fonts, Toaster)
│   │   ├── admin/              # Admin panel pages
│   │   │   ├── login/          #   Login page
│   │   │   ├── settings/       #   Portal settings editor
│   │   │   ├── insurance/      #   Insurance companies editor
│   │   │   ├── self-insured/   #   Self-insured editor
│   │   │   ├── international/  #   International insurance editor
│   │   │   ├── deductible/     #   Deductible companies editor
│   │   │   ├── news/           #   News editor
│   │   │   └── manual/         #   Manual editor
│   │   └── api/
│   │       ├── auth/           # Login and logout endpoints
│   │       └── admin/
│   │           ├── content/    #   GET/PUT /api/admin/content/[filename]
│   │           └── upload/     #   File upload endpoint
│   ├── components/
│   │   ├── portal/             # Public-facing components
│   │   ├── admin/              # Admin panel components
│   │   └── ui/                 # shadcn/ui primitives
│   ├── lib/
│   │   ├── content.ts          # JSON read/write helpers
│   │   ├── auth.ts             # JWT sign/verify, cookie config
│   │   └── useAdminContent.ts  # React hook for admin CRUD operations
│   ├── types/
│   │   └── portal.ts           # TypeScript interfaces
│   └── middleware.ts           # Auth guard for /admin/* routes
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── CLAUDE.md                   # AI assistant project context
└── package.json
```

## Docker Deployment

The project ships with a multi-stage Dockerfile that produces a minimal standalone image.

The production image is now environment-agnostic. `npm run build` always embeds a placeholder base path, and container startup replaces that placeholder using the OS environment variable `NEXT_PUBLIC_BASE_PATH` inside the same staged standalone runtime used by local `npm run start`.

### Build and run with Docker Compose

```bash
docker compose up -d --build
```

The portal will be available at [http://localhost:3000](http://localhost:3000).

### Environment variables

Set `ADMIN_PASSWORD`, `JWT_SECRET`, and optionally `COOKIE_SECURE` / `NEXT_PUBLIC_BASE_PATH` in `docker-compose.yml` or pass them at container runtime. `NEXT_PUBLIC_BASE_PATH` is not read during image build, and the public URL must include the same prefix:

```yaml
services:
  portal:
    environment:
      ADMIN_PASSWORD: my-secure-password
      JWT_SECRET: my-random-secret
      COOKIE_SECURE: "false"
      NEXT_PUBLIC_BASE_PATH: /portal
```

Leave `COOKIE_SECURE` unset or set it to `false` when you access the app over plain HTTP, such as the current NodePort deployment. Set it to `true` only after the app is fronted by HTTPS. For the current dev deployment, `NEXT_PUBLIC_BASE_PATH=/portal` means users should access `https://devnewcore.blueventuretpa.com/portal/...`.

### Persistent content

The `docker-compose.yml` mounts `./content` from the host into the container so that changes made through the admin panel survive container restarts:

```yaml
volumes:
  - ./content:/app/content
```

On first run, if you do not have a local `content/` directory, copy the seed data out of the container:

```bash
docker cp <container-name>:/app/content ./content
```

## Content Management

All portal data is stored as JSON files in the `/content/` directory. There is no database -- the application reads and writes files directly.

### How it works

1. **Server-side rendering** -- the public portal page reads JSON files synchronously with `fs.readFileSync` inside a Server Component marked `force-dynamic`, so visitors always see the latest data.
2. **Admin API** -- the admin panel reads and writes content through `GET` and `PUT` requests to `/api/admin/content/[filename]`.
3. **File-based persistence** -- edits made through the admin panel are written back to disk immediately.

### Content files

| File                          | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| `settings.json`              | Site logo, iClaim configuration, announcements    |
| `insurance-companies.json`   | Insurance company listings                        |
| `self-insured.json`          | Self-insured company listings and groups          |
| `international-insurance.json`| International insurance company listings         |
| `deductible.json`            | Deductible company listings                       |
| `manual.json`                | Downloadable manual links                         |
| `news.json`                  | News items                                        |
| `tpacare-check.json`         | TPA care check card configuration                 |

## Authentication

The admin panel uses a simple shared-password authentication model -- there are no individual user accounts.

### Auth flow

1. A user navigates to `/admin` and is redirected to `/admin/login`.
2. The user enters the password configured in the `ADMIN_PASSWORD` environment variable.
3. On success, `POST /api/auth/login` creates a signed JWT and stores it in an HTTP-only cookie.
4. The Next.js middleware (`src/middleware.ts`) checks the cookie on every request to `/admin/*` and `/api/admin/*`.
5. Invalid or missing tokens redirect page requests to the login page and return `401` for API requests.
6. Logging out clears the cookie via `POST /api/auth/logout`.

`COOKIE_SECURE` controls whether the browser sends the admin session cookie only over HTTPS. Keep it `false` for the current HTTP NodePort URL and switch it to `true` only when the deployment is served behind TLS.

## Key Data Models

### Company

Represents an insurance company in any of the four listing sections.

```typescript
interface Company {
  id: string;
  displayName: string;
  code: string | null;        // iClaim company code
  iclaimId: string | null;    // iClaim numeric ID
  isClickable: boolean;       // false = suspended (shows remark instead)
  isNew: boolean;             // displays an animated "NEW" badge
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string | null;      // shown in red when suspended
  redirectUrl?: string;       // custom redirect URL (skips iClaim modal)
  logoUrl?: string | null;
  alertText?: string | null;  // inline alert badge text
  alertType?: AlertType;      // "warning" | "error" | "info" | "success" | "promo" | "urgent"
  alertSize?: AlertSize;
  alertGlow?: boolean;
  alertBorder?: AlertBorder;  // "none" | "glow" | "pulse" | "shimmer" | ...
}
```

### CompanyGroup

A parent header with nested child companies, used in the self-insured section.

```typescript
interface CompanyGroup {
  id: string;
  headerName: string;
  headerIconUrl: string | null;
  companies: Company[];
  alertText?: string | null;
  alertType?: AlertType;
  alertSize?: AlertSize;
  alertGlow?: boolean;
  alertBorder?: AlertBorder;
}
```

### iClaim Redirect Flow

When a user clicks a clickable company:

1. A confirmation modal appears with the company name.
2. The user selects a claim type (OPD, IPD, or both, depending on the company's `claimType`).
3. The browser redirects to `{iClaim.baseUrl}?code={company.code}&id={company.iclaimId}&type={OPD|IPD}`.

Companies with a `redirectUrl` skip the modal entirely and navigate directly to that URL.

## License

This project is proprietary software. All rights reserved.

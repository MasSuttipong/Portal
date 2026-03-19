# BVTPA Portal Setup — Claude Code Requirements

**Replacing:** https://tpacare.thirdpartyadmin.co.th/app/ForwardIns.aspx
**Approach:** JSON-driven portal + lightweight admin panel — no database
**Version:** 3.0 — March 2026

---

## 1. Project Overview

### 1.1 What We Are Replacing

The current BVTPA Portal is a single ASP.NET page (`ForwardIns.aspx`) with all content **hardcoded in HTML**. Every change (adding an insurer, posting news, updating a company name) requires a developer to edit source code and redeploy.

### 1.2 Goal

Build a **Next.js application** with two parts:

1. **Public Portal Page** (`/`) — Replaces ForwardIns.aspx. Renders all content from JSON files. No login required.
2. **Admin Panel** (`/admin`) — Simple web UI for editing content. Protected by a single shared password. Edits save directly to JSON files on the server, then the portal re-renders with updated content.

### 1.3 Architecture

```
┌──────────────────────────────────────────────────┐
│                   Next.js App                     │
│                                                   │
│  Public Portal (/)          Admin Panel (/admin)  │
│  ┌─────────────────┐       ┌──────────────────┐  │
│  │ Reads JSON files │       │ Reads/Writes     │  │
│  │ Renders portal   │       │ JSON files       │  │
│  │ No auth needed   │       │ Password protect │  │
│  └────────┬─────────┘       └────────┬─────────┘  │
│           │                          │             │
│           └──────────┬───────────────┘             │
│                      ▼                             │
│              /content/*.json                       │
│              (all portal data)                     │
└──────────────────────────────────────────────────┘
```

### 1.4 Why This Approach

- **No database** — zero infrastructure cost, no PostgreSQL to manage
- **No complex auth** — single password stored in environment variable
- **Content = JSON files** — version-controllable, easy to backup, easy to understand
- **Admin panel** — non-technical staff can update content via a web form
- **Fast** — portal page can be statically generated or server-rendered from JSON
- **Migratable** — JSON structure maps directly to DB tables if you ever want to upgrade

---

## 2. Current Portal Structure

The current `ForwardIns.aspx` page has these sections top-to-bottom:

### 2.1 Company Logo
- BVTPA / TPA Care logo at the top
- Admin can replace the logo image

### 2.2 Manual (คู่มือ)
- **Main heading:** "Manual" — **LOCKED** (cannot be changed)
- **Sub-heading:** "คู่มือ TPA" — editable
- **Content:** List of PDF download links (title + URL). Currently 2 items.

### 2.3 News (ข่าวสาร)
- **Main heading:** "News" — **LOCKED**
- **Content:** List of announcement links (title + PDF URL + optional "NEW" badge). Currently 13+ items.

### 2.4 TPACare Mobile App Check
- **Main heading:** "ตรวจสอบการใช้บัตรผ่าน TPACare Mobile App" — **EDITABLE**
- Large clickable card/button
- Click → confirmation dialog → OPD/IPD selection → redirect to iClaim

### 2.5 Insurance Companies (บริษัทประกันภัยและประกันชีวิต)
- **Main heading:** editable
- **35+ insurance companies**, each with: display name, company code, iClaim ID, clickable/suspended status, "NEW" badge, optional remark, claim type (OPD/IPD)
- Click → iClaim redirect with OPD/IPD selection

### 2.6 Self Insured (สวัสดิการพนักงาน)
- **Main heading:** editable
- **30+ companies** — some standalone, some **grouped under parent companies**:
  - **คาราบาวกรุ๊ป และบริษัทในเครือ** → 14 subsidiaries
  - **บลูเวนเจอร์ กรุ๊ป** → 5 subsidiaries
- Groups can have warning icons
- Same iClaim redirect behavior

### 2.7 International Insurance (บริษัทประกันต่างประเทศ)
- **Main heading:** editable
- Currently 4 companies. Same iClaim redirect behavior.

### 2.8 Deductible Check (ตรวจสอบ Deductible)
- **Main heading:** editable
- Currently 1 item (Prudential) with a custom redirect URL

### 2.9 Key UI Patterns

- **iClaim Redirect Flow:** Click company → confirm modal → OPD/IPD selection → redirect
- **"NEW" Badge:** Animated GIF beside recent items, toggleable per item
- **OPD-Only Warning:** Red icon + `[OPD Only]` text for companies that only allow OPD
- **Company Groups:** Parent header + indented children underneath
- **Suspended Companies:** Plain text (not clickable) + remark note explaining why

---

## 3. Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14+** (App Router) with TypeScript |
| Styling | **Tailwind CSS** + **shadcn/ui** components |
| Content Storage | **JSON files** in `/content/` directory |
| Admin Auth | **Single shared password** via environment variable `ADMIN_PASSWORD` |
| Admin State | Server-side JSON read/write via Next.js API routes |
| Icons/Badges | Static assets in `/public/` |
| Deployment | **Docker** or **Vercel** |

**No database. No user accounts. No complex auth.**

---

## 4. Authentication (Admin Only)

### 4.1 How It Works

- Portal page (`/`) — **no authentication**, fully public
- Admin panel (`/admin/*`) — protected by a **single shared password**
- Password is stored in environment variable: `ADMIN_PASSWORD`
- On first visit to `/admin`, user sees a password prompt
- Correct password sets an **HTTP-only cookie** (e.g., `admin_token`) containing a signed JWT or HMAC token
- Cookie expires after a configurable duration (default: 8 hours)
- All `/admin` pages and `/api/admin/*` routes check for valid cookie
- Wrong password shows error, no lockout needed (simple setup)

### 4.2 Implementation

```typescript
// Environment variable
ADMIN_PASSWORD=your-secret-password-here

// POST /api/auth/login
// Body: { password: "..." }
// If password matches ADMIN_PASSWORD → set HTTP-only cookie → return success
// If wrong → return 401

// Proxy: check cookie on all /admin routes and /api/admin/* routes
// If no valid cookie → redirect to /admin/login
```

### 4.3 Login Page (`/admin/login`)

- Simple centered card with:
  - Password input field
  - "เข้าสู่ระบบ" (Login) button
  - Error message if wrong password
- No username field — just password
- After successful login → redirect to `/admin`

---

## 5. JSON Content File Structure

All portal content lives in JSON files under `/content/`. The admin panel reads and writes these files.

### 5.1 `/content/settings.json`

```json
{
  "logo": {
    "url": "/images/bvtpa-logo.png",
    "alt": "BVTPA TPA Care"
  },
  "iclaim": {
    "baseUrl": "https://tpacare.thirdpartyadmin.co.th/app/EClaim.aspx",
    "confirmText": "ระบบกำลังพาท่านไปสู่ระบบ iClaim",
    "confirmOk": "ตกลง",
    "confirmCancel": "ยกเลิก",
    "claimTypePrompt": "เลือก Claim Type ที่ต้องการ"
  }
}
```

### 5.2 `/content/manual.json`

```json
{
  "subHeading": "คู่มือ TPA",
  "items": [
    {
      "id": "m1",
      "title": "คู่มือการใช้งาน TPA Care mobile app (PDF)",
      "url": "https://tpacare.thirdpartyadmin.co.th/app/Download/TPA_Care_Manual_New_Version_TH_r.pdf",
      "isPublished": true
    },
    {
      "id": "m2",
      "title": "บริษัทที่อยู่ภายใต้การดูแลของ THRES (TPA)",
      "url": "https://tpacare.thirdpartyadmin.co.th/app/Download/CompanyTHRES_TakeCareof.pdf",
      "isPublished": true
    }
  ]
}
```

### 5.3 `/content/news.json`

```json
{
  "items": [
    {
      "id": "n1",
      "title": "จดหมายแจ้งระงับการใช้เครดิตของบมจ.เคดับบลิวไอประกันภัย",
      "url": "https://tpacare.thirdpartyadmin.co.th/app/Download/BVTPA_014052025_20250529.pdf",
      "isNew": true,
      "isPublished": true
    },
    {
      "id": "n2",
      "title": "จดหมายแจ้งระงับการใช้เครดิตของบมจ.เคดับบลิวไอประกันชีวิต",
      "url": "https://tpacare.thirdpartyadmin.co.th/app/Download/BVTPA_013052025_20250529.pdf",
      "isNew": true,
      "isPublished": true
    }
  ]
}
```

> ⚠️ Seed ALL 13+ current news items from the live portal.

### 5.4 `/content/tpacare-check.json`

```json
{
  "heading": "ตรวจสอบการใช้บัตรผ่าน TPACare Mobile App",
  "description": "",
  "imageUrl": null,
  "redirectCode": "",
  "redirectId": "0"
}
```

### 5.5 `/content/insurance-companies.json`

```json
{
  "heading": "บริษัทประกันภัยและประกันชีวิต",
  "companies": [
    {
      "id": "ins-1",
      "displayName": "U.S.Mission / U.S. Embassy (บมจ.ทิพยประกันภัย)",
      "code": "USDHIP",
      "iclaimId": "140",
      "isClickable": true,
      "isNew": true,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "ins-2",
      "displayName": "บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)",
      "code": "BKI",
      "iclaimId": "23",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "ins-3",
      "displayName": "บริษัท กรุงเทพประกันสุขภาพ จำกัด (มหาชน)",
      "code": null,
      "iclaimId": null,
      "isClickable": false,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "ins-5",
      "displayName": "บริษัท เคดับบลิวไอ ประกันภัย จำกัด (มหาชน)",
      "code": null,
      "iclaimId": null,
      "isClickable": false,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": "ระงับการใช้เครดิต กรุณาสำรองจ่ายทุกกรณี ตั้งแต่ 29.05.2025 เป็นต้นไป"
    }
  ]
}
```

> ⚠️ Seed ALL 35+ insurance companies. Above is a partial example.

### 5.6 `/content/self-insured.json`

Supports **company groups** via a `groups` array alongside standalone `companies`.

```json
{
  "heading": "สวัสดิการพนักงาน (Self Insured)",
  "companies": [
    {
      "id": "si-1",
      "displayName": "Baker Hughes Operations (Thailand) Ltd.",
      "code": "BHOT",
      "iclaimId": "118",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "si-2",
      "displayName": "Coffee Concepts (Starbucks) [OPD Only]",
      "code": "STBT",
      "iclaimId": "88",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_ONLY",
      "remark": null
    }
  ],
  "groups": [
    {
      "id": "grp-carabao",
      "headerName": "คาราบาวกรุ๊ป และบริษัทในเครือ",
      "headerIconUrl": "/icons/opd-warning.png",
      "companies": [
        {
          "id": "si-grp-cb1",
          "displayName": "บริษัท คาราบาวกรุ๊ป จำกัด (มหาชน)",
          "code": "CBG",
          "iclaimId": "71",
          "isClickable": true,
          "isNew": false,
          "claimType": "OPD_IPD",
          "remark": null
        },
        {
          "id": "si-grp-cb2",
          "displayName": "บริษัท คาราบาวตะวันแดง จำกัด (สำนักงานใหญ่)",
          "code": "CBD",
          "iclaimId": "76",
          "isClickable": true,
          "isNew": false,
          "claimType": "OPD_IPD",
          "remark": null
        }
      ]
    },
    {
      "id": "grp-blueventure",
      "headerName": "บลูเวนเจอร์ กรุ๊ป",
      "headerIconUrl": null,
      "companies": [
        {
          "id": "si-grp-bv1",
          "displayName": "บริษัท บลูเวนเจอร์ กรุ๊ป จำกัด (มหาชน)",
          "code": "BVG",
          "iclaimId": "99",
          "isClickable": true,
          "isNew": false,
          "claimType": "OPD_IPD",
          "remark": null
        }
      ]
    }
  ]
}
```

> ⚠️ Seed ALL 30+ companies + คาราบาว (14) + บลูเวนเจอร์ (5) groups fully.

### 5.7 `/content/international-insurance.json`

```json
{
  "heading": "บริษัทประกันต่างประเทศ",
  "companies": [
    {
      "id": "intl-1",
      "displayName": "CIGNA EUROPE INSURANCE COMPANY S.A.-N.V. SINGAPORE BRANCH",
      "code": "CIGNASG",
      "iclaimId": "90",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "intl-2",
      "displayName": "Indochina Insurance Co., Ltd.",
      "code": "ICI",
      "iclaimId": "147",
      "isClickable": true,
      "isNew": true,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "intl-3",
      "displayName": "MSIG SOKXAY INSURANCE COMPANY LIMITED",
      "code": "SOKXAY",
      "iclaimId": "38",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "intl-4",
      "displayName": "SOKXAY LIFE INSURANCE SOLE COMPANY LIMITED",
      "code": "SLIS",
      "iclaimId": "141",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    }
  ]
}
```

### 5.8 `/content/deductible.json`

```json
{
  "heading": "ตรวจสอบ Deductible",
  "companies": [
    {
      "id": "ded-1",
      "displayName": "พรูเด็นเซียล : ตรวจสอบ Deductible ของผลิตภัณฑ์ Health As Charged",
      "code": null,
      "iclaimId": null,
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null,
      "redirectUrl": "https://tpacare.thirdpartyadmin.co.th/app/DeductPlt.aspx"
    }
  ]
}
```

---

## 6. TypeScript Interfaces

```typescript
// types/portal.ts

interface Company {
  id: string;
  displayName: string;
  code: string | null;
  iclaimId: string | null;
  isClickable: boolean;
  isNew: boolean;
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";
  remark: string | null;
  redirectUrl?: string;
}

interface CompanyGroup {
  id: string;
  headerName: string;
  headerIconUrl: string | null;
  companies: Company[];
}

interface CompanySection {
  heading: string;
  companies: Company[];
  groups?: CompanyGroup[];
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  isNew: boolean;
  isPublished: boolean;
}

interface ManualItem {
  id: string;
  title: string;
  url: string;
  isPublished: boolean;
}

interface PortalSettings {
  logo: { url: string; alt: string };
  iclaim: {
    baseUrl: string;
    confirmText: string;
    confirmOk: string;
    confirmCancel: string;
    claimTypePrompt: string;
  };
}
```

---

## 7. Portal Page (Public)

### 7.1 Page Layout

Single scrollable page, sections rendered top-to-bottom:

```
┌─────────────────────────────────────────┐
│              [Company Logo]              │  ← from settings.json
├─────────────────────────────────────────┤
│  Manual                                 │  ← heading LOCKED in component
│    คู่มือ TPA                            │  ← sub-heading from manual.json
│    • PDF link 1                         │
│    • PDF link 2                         │
├─────────────────────────────────────────┤
│  News                                   │  ← heading LOCKED in component
│    • News item 1            🆕          │
│    • News item 2            🆕          │
│    • ...13+ items                       │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ ตรวจสอบการใช้บัตรผ่าน TPACare    │  │  ← clickable card
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  บริษัทประกันภัยและประกันชีวิต          │  ← from JSON
│    Company (link)              🆕       │
│    Company (plain text + remark)        │  ← suspended
│    ...35+ companies                     │
├─────────────────────────────────────────┤
│  สวัสดิการพนักงาน (Self Insured)        │
│    Standalone company (link)            │
│    ┌─ คาราบาวกรุ๊ป ⚠️ ──────────────┐  │  ← GROUP
│    │  Subsidiary 1 (link)            │  │
│    │  Subsidiary 2 (link)            │  │
│    │  ...14 companies                │  │
│    └─────────────────────────────────┘  │
│    ┌─ บลูเวนเจอร์ กรุ๊ป ────────────┐  │
│    │  ...5 companies                 │  │
│    └─────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  บริษัทประกันต่างประเทศ                 │
│    ...4 companies                       │
├─────────────────────────────────────────┤
│  ตรวจสอบ Deductible                     │
│    Prudential (link → custom URL)       │
└─────────────────────────────────────────┘
```

### 7.2 Company Click → iClaim Redirect Flow

```
Click company link
    ↓
Modal: "ระบบกำลังพาท่านไปสู่ระบบ iClaim"
       [ตกลง]  [ยกเลิก]
    ↓ (click ตกลง)
Modal: "เลือก Claim Type ที่ต้องการ"
       [OPD]  [IPD]              ← show based on claimType
    ↓ (click OPD or IPD)
Redirect to: {settings.iclaim.baseUrl}?code={code}&id={iclaimId}&type={OPD|IPD}
```

If company has `redirectUrl` → skip modal, go directly to that URL.

### 7.3 Rendering Rules

| Condition | Rendering |
|-----------|-----------|
| `isClickable: true` | Blue link text, cursor pointer, triggers iClaim modal on click |
| `isClickable: false` | Plain gray/black text, not clickable |
| `isNew: true` | Show animated "NEW" badge GIF beside the name |
| `remark` exists | Append remark text in red/orange after company name |
| `claimType: "OPD_ONLY"` | Show only OPD button in modal |
| `claimType: "IPD_ONLY"` | Show only IPD button in modal |
| `redirectUrl` exists | Click goes directly to this URL (no modal) |
| Company inside a `group` | Indented under the group header |
| Group has `headerIconUrl` | Icon shown next to group header name |
| `isPublished: false` | Item hidden from portal (admin can still see it in admin panel) |

---

## 8. Admin Panel

### 8.1 Overview

The admin panel is a set of pages under `/admin` that let non-technical staff manage all portal content through web forms. All changes save directly to JSON files on the server.

### 8.2 Admin Layout

```
┌──────────────────────────────────────────────┐
│  🔧 BVTPA Portal Admin          [ออกจากระบบ] │
├──────────┬───────────────────────────────────┤
│          │                                    │
│  📋 News │  [Active section content area]     │
│  📖 Manual│                                    │
│  🏢 Insurance│                                │
│  🏭 Self Insured│                             │
│  🌏 International│                            │
│  ✅ Deductible│                               │
│  ⚙️ Settings│                                 │
│          │                                    │
└──────────┴───────────────────────────────────┘
```

### 8.3 Admin Login Page (`/admin/login`)

- Centered card with password field + login button
- No username — just password
- On success: set HTTP-only cookie, redirect to `/admin`
- On failure: show "รหัสผ่านไม่ถูกต้อง" (incorrect password) error

### 8.4 News Management (`/admin/news`)

| Feature | Detail |
|---------|--------|
| View | List all news items in a table: title (truncated), URL, "NEW" badge status, published status |
| Add | Button opens a form: title (textarea), URL (text input), isNew toggle, isPublished toggle |
| Edit | Click any item to edit in-place or in a modal form |
| Delete | Delete button with confirmation dialog: "ยืนยันการลบ?" |
| Reorder | Drag-and-drop to change display order |
| Save | "บันทึก" (Save) button writes changes to `/content/news.json` |

### 8.5 Manual Management (`/admin/manual`)

| Feature | Detail |
|---------|--------|
| Edit sub-heading | Text input for "คู่มือ TPA" sub-heading |
| View items | Table of manual download items |
| Add/Edit/Delete | Same pattern as News — title + URL + isPublished |
| Save | Writes to `/content/manual.json` |

### 8.6 Insurance Companies (`/admin/insurance`)

| Feature | Detail |
|---------|--------|
| View | Table: display name, code, iClaim ID, clickable, "NEW", claim type, remark |
| Add | Form with all Company fields: displayName, code, iclaimId, isClickable, isNew, claimType, remark |
| Edit | Click row to edit |
| Delete | With confirmation |
| Toggle shortcuts | One-click toggles for: isNew badge, isClickable (suspend/unsuspend) |
| Reorder | Drag-and-drop |
| Edit heading | Text input for section heading at the top |
| Save | Writes to `/content/insurance-companies.json` |

### 8.7 Self Insured (`/admin/self-insured`)

Same as Insurance Companies, plus:

| Feature | Detail |
|---------|--------|
| View groups | Each group shown as a collapsible section with header name + children |
| Add group | Create a new group: header name, optional icon URL |
| Add company to group | Dropdown or drag to assign a company to a group |
| Remove from group | Move company back to standalone list |
| Edit group header | Edit header name and icon URL |
| Delete group | Moves all children back to standalone, deletes header |
| Save | Writes to `/content/self-insured.json` |

### 8.8 International Insurance (`/admin/international`)

Same as Insurance Companies but for international insurers.
- Save writes to `/content/international-insurance.json`

### 8.9 Deductible Check (`/admin/deductible`)

Same as Insurance Companies with one extra field:
- `redirectUrl` — custom URL instead of iClaim pattern
- Save writes to `/content/deductible.json`

### 8.10 Settings (`/admin/settings`)

| Feature | Detail |
|---------|--------|
| Logo | Image preview + file upload (saves to `/public/images/`) + alt text input |
| iClaim base URL | Text input |
| Confirm dialog text | Text inputs for confirmText, confirmOk, confirmCancel, claimTypePrompt |
| Change password | Current password + new password fields. Updates `ADMIN_PASSWORD` in `.env` or a local password hash file. |
| Save | Writes to `/content/settings.json` |

### 8.11 Preview Button

Every admin page should have a **"ดูตัวอย่าง" (Preview)** button that opens the public portal page in a new tab so the admin can see the live result after saving.

---

## 9. API Routes (Internal)

These API routes are used by the admin panel only. All routes under `/api/admin/*` require valid admin cookie.

### 9.1 Auth

| Route | Method | Description |
|-------|--------|-------------|
| `POST /api/auth/login` | POST | Body: `{ password }`. Validates against `ADMIN_PASSWORD`. Sets HTTP-only cookie. |
| `POST /api/auth/logout` | POST | Clears admin cookie. |

### 9.2 Content CRUD

| Route | Method | Description |
|-------|--------|-------------|
| `GET /api/admin/content/:filename` | GET | Reads and returns a JSON content file (e.g., `news`, `manual`, `insurance-companies`) |
| `PUT /api/admin/content/:filename` | PUT | Writes the full JSON body to the content file. Overwrites entire file. |

The `:filename` parameter maps to files in `/content/`:
- `news` → `/content/news.json`
- `manual` → `/content/manual.json`
- `insurance-companies` → `/content/insurance-companies.json`
- `self-insured` → `/content/self-insured.json`
- `international-insurance` → `/content/international-insurance.json`
- `deductible` → `/content/deductible.json`
- `tpacare-check` → `/content/tpacare-check.json`
- `settings` → `/content/settings.json`

### 9.3 File Upload

| Route | Method | Description |
|-------|--------|-------------|
| `POST /api/admin/upload` | POST | Multipart file upload. Saves to `/public/images/` or `/public/icons/`. Returns the public URL path. |

### 9.4 How JSON File Writing Works

```typescript
// Example: PUT /api/admin/content/news
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

export async function PUT(req: Request) {
  // 1. Verify admin cookie
  // 2. Parse JSON body
  const data = await req.json();
  // 3. Write to file
  const filePath = join(process.cwd(), "content", "news.json");
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  // 4. Optionally: trigger Next.js revalidation so portal page updates
  // revalidatePath("/");
  // 5. Return success
  return Response.json({ success: true });
}
```

### 9.5 Portal Page Data Loading

The portal page reads JSON at request time (SSR) or build time (SSG):

```typescript
// src/app/page.tsx — Server Component
import { readFileSync } from "fs";
import { join } from "path";

function loadContent(filename: string) {
  const filePath = join(process.cwd(), "content", `${filename}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export default function PortalPage() {
  const settings = loadContent("settings");
  const news = loadContent("news");
  const manual = loadContent("manual");
  const insuranceCompanies = loadContent("insurance-companies");
  const selfInsured = loadContent("self-insured");
  const internationalInsurance = loadContent("international-insurance");
  const deductible = loadContent("deductible");
  const tpacareCheck = loadContent("tpacare-check");

  return <PortalRenderer ... />;
}
```

Use `{ revalidate: 0 }` or `dynamic = "force-dynamic"` so the page always reads fresh JSON after admin saves.

---

## 10. Project Structure

```
bvtpa-portal/
├── content/                              # ⭐ ALL PORTAL DATA
│   ├── settings.json
│   ├── manual.json
│   ├── news.json
│   ├── tpacare-check.json
│   ├── insurance-companies.json
│   ├── self-insured.json
│   ├── international-insurance.json
│   └── deductible.json
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Public portal page
│   │   ├── layout.tsx                    # Root layout
│   │   ├── admin/
│   │   │   ├── login/page.tsx            # Password login page
│   │   │   ├── layout.tsx                # Admin layout (sidebar + auth check)
│   │   │   ├── page.tsx                  # Admin dashboard / redirect to news
│   │   │   ├── news/page.tsx             # News management
│   │   │   ├── manual/page.tsx           # Manual management
│   │   │   ├── insurance/page.tsx        # Insurance companies management
│   │   │   ├── self-insured/page.tsx     # Self insured management (with groups)
│   │   │   ├── international/page.tsx    # International insurance management
│   │   │   ├── deductible/page.tsx       # Deductible management
│   │   │   └── settings/page.tsx         # Logo, iClaim URL, password change
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts        # POST: validate password, set cookie
│   │       │   └── logout/route.ts       # POST: clear cookie
│   │       └── admin/
│   │           ├── content/
│   │           │   └── [filename]/route.ts  # GET + PUT: read/write JSON files
│   │           └── upload/route.ts       # POST: file upload to /public/
│   ├── components/
│   │   ├── portal/                       # Public portal components
│   │   │   ├── PortalPage.tsx
│   │   │   ├── LogoHeader.tsx
│   │   │   ├── ManualSection.tsx
│   │   │   ├── NewsSection.tsx
│   │   │   ├── TpaCareCheckCard.tsx
│   │   │   ├── CompanySection.tsx
│   │   │   ├── CompanyList.tsx
│   │   │   ├── CompanyItem.tsx
│   │   │   ├── CompanyGroup.tsx
│   │   │   ├── NewBadge.tsx
│   │   │   ├── IClaimModal.tsx
│   │   │   └── RemarkText.tsx
│   │   ├── admin/                        # Admin panel components
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── CompanyTable.tsx          # Reusable table for all company sections
│   │   │   ├── CompanyForm.tsx           # Add/Edit company modal/form
│   │   │   ├── GroupManager.tsx          # Create/edit/delete company groups
│   │   │   ├── NewsTable.tsx
│   │   │   ├── NewsForm.tsx
│   │   │   ├── ManualEditor.tsx
│   │   │   ├── SettingsForm.tsx
│   │   │   ├── DragDropList.tsx          # Reusable drag-and-drop reorder
│   │   │   ├── ToggleSwitch.tsx          # Quick toggle for isNew, isClickable
│   │   │   ├── PasswordPrompt.tsx
│   │   │   └── PreviewButton.tsx
│   │   └── ui/                           # shadcn/ui (Dialog, Button, Card, Table, etc.)
│   ├── proxy.ts                          # Check admin cookie on /admin/* routes
│   ├── types/
│   │   └── portal.ts                    # All TypeScript interfaces
│   └── lib/
│       ├── content.ts                   # Read/write JSON file helpers
│       ├── auth.ts                      # Cookie sign/verify helpers
│       └── iclaim.ts                    # iClaim URL builder
├── public/
│   ├── images/
│   │   └── bvtpa-logo.png
│   └── icons/
│       ├── icon-new.gif
│       └── opd-warning.png
├── .env.example                          # ADMIN_PASSWORD=change-me
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 11. Styling Requirements

### 11.1 Portal Page

- Match the current ForwardIns.aspx visual style
- Single-column centered layout, max-width ~900px
- White background, professional typography
- Thai text with proper line-height and font rendering

| Element | Style |
|---------|-------|
| Section headings | Bold, large, dark. H2 style. Clear separator. |
| Manual/News | Bulleted list, blue links, hover underline |
| TPACare card | Large card/button, background color, centered, prominent |
| Company links | Blue text, hover underline, one per line |
| Plain text companies | Dark gray, no hover |
| "NEW" badge | Small animated GIF inline after name |
| Remark text | Smaller, red/orange, inline after name |
| Company groups | Bold header + icon. Children indented ~20px. Subtle border/bg. |
| iClaim modal | Centered overlay, semi-transparent backdrop, large OPD/IPD buttons |

### 11.2 Admin Panel

- Clean, professional admin layout
- Sidebar navigation with active state highlighting
- Data tables with sort, filter capabilities
- Form inputs with Thai labels
- Toast notifications on save success/failure
- Drag-and-drop reorder with visual feedback
- Mobile-friendly (tablet minimum)

### 11.3 Responsive (Portal)

- Desktop (≥1024px): Centered column
- Tablet (768–1023px): Full width + padding
- Mobile (<768px): Full width, larger touch targets

---

## 12. Seed Data Requirement

⚠️ All JSON files must be pre-populated with **complete data from the current live portal**.

### Checklist

- [ ] `insurance-companies.json` — ALL 35+ companies with exact codes and IDs
- [ ] `self-insured.json` — ALL 30+ companies + คาราบาว group (14) + บลูเวนเจอร์ group (5)
- [ ] `international-insurance.json` — All 4 companies
- [ ] `deductible.json` — Prudential deductible check
- [ ] `news.json` — ALL 13+ news items with exact Thai text and PDF URLs
- [ ] `manual.json` — Both manual download items
- [ ] `tpacare-check.json` — TPACare check card config
- [ ] `settings.json` — Logo, iClaim base URL, dialog text
- [ ] All "NEW" badges match live portal
- [ ] All suspended companies have correct remark text
- [ ] All company codes and iClaim IDs are correct

---

## 13. Development Phases

### Phase 1: Setup + Data (Day 1–2)

- Next.js 14 + TypeScript + Tailwind + shadcn/ui scaffold
- TypeScript interfaces
- Create ALL JSON content files with complete live portal data
- Content read/write helper functions
- Verify JSON data accuracy

### Phase 2: Portal Components (Day 3–5)

- `PortalPage`, `LogoHeader`, `ManualSection`, `NewsSection`
- `CompanySection`, `CompanyList`, `CompanyItem`, `NewBadge`, `RemarkText`
- `CompanyGroup` (parent-child with indentation)
- `TpaCareCheckCard`
- `IClaimModal` (confirmation + OPD/IPD selection + redirect)

### Phase 3: Admin — Auth + CRUD API (Day 6–7)

- Password login page + cookie-based auth proxy
- API routes: `GET/PUT /api/admin/content/:filename`
- File upload endpoint
- Test JSON read/write round-trip

### Phase 4: Admin — UI Screens (Day 8–11)

- Admin layout with sidebar navigation
- News management (table + form + drag-drop + toggles)
- Manual management
- Insurance companies management (table + form + toggles)
- Self Insured management (companies + group manager)
- International + Deductible management
- Settings page (logo upload + iClaim config)
- Preview button on every page

### Phase 5: Polish + Deploy (Day 12–14)

- Match portal styling to current ForwardIns.aspx
- Responsive design
- Toast notifications, loading states, error handling
- Test all iClaim redirects
- Docker setup
- README with admin guide
- Deploy

---

## 14. Content Update Quick Reference (for README)

### Via Admin Panel (Recommended)

1. Go to `/admin` → enter password
2. Navigate to the section you want to edit
3. Add/edit/delete items using the form
4. Click "บันทึก" (Save)
5. Click "ดูตัวอย่าง" (Preview) to verify
6. Done — changes are live immediately

### Via JSON Files (Developer)

1. Edit the relevant file in `/content/`
2. `git commit` + `git push`
3. Wait for auto-deploy
4. Verify on live site

### Common Tasks

| Task | Where | Time |
|------|-------|------|
| Add a new insurance company | `/admin/insurance` → Add | ~1 min |
| Post a news announcement | `/admin/news` → Add | ~30 sec |
| Suspend a company | `/admin/insurance` → toggle isClickable off + add remark | ~30 sec |
| Toggle "NEW" badge | Any company/news list → click toggle | 1 click |
| Change company logo | `/admin/settings` → upload new image | ~30 sec |
| Create a company group | `/admin/self-insured` → Add Group | ~2 min |
| Change iClaim redirect URL | `/admin/settings` → edit base URL | ~30 sec |

---

*End of Requirements Document*

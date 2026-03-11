# BVTPA Portal API Documentation

## Overview

The BVTPA Portal API is a simple, file-based REST API built with Next.js that powers the BVTPA Portal web application. The API manages authentication, content administration, and image uploads for a health insurance provider portal.

The API uses HTTP-only JWT cookies for session management and stores all portal content as JSON files on the server. There is no database—only file-based data storage with straightforward read/write operations.

**Base URL**: `/api`

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Content Files](#content-files)
5. [Error Handling](#error-handling)

---

## Authentication

The BVTPA Portal uses a **single-password authentication system** with JWT tokens stored in HTTP-only cookies. This approach is suitable for administrative access by a limited number of trusted users.

### Login Flow

1. User submits password to `/api/auth/login`
2. Server validates password against `ADMIN_PASSWORD` environment variable
3. On success, server issues a signed JWT token and sets it in an HTTP-only, secure cookie
4. Subsequent requests to `/api/admin/*` routes are automatically protected by middleware
5. Token expires after 8 hours; user must log in again

### Cookie Details

- **Name**: `admin_token`
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 8 hours
- **Properties**:
  - `httpOnly: true` — JavaScript cannot access the cookie
  - `secure: true` — Only transmitted over HTTPS (in production)
  - `sameSite: lax` — Protection against CSRF attacks
  - `path: /` — Available to all routes

### Middleware Protection

All routes matching `/admin/*` and `/api/admin/*` are protected by middleware (`src/middleware.ts`):

- **API Routes** (`/api/admin/*`): Return `401 Unauthorized` as JSON if token is invalid
- **Page Routes** (`/admin/*`): Redirect to `/admin/login` if token is invalid
- **Login Page** (`/admin/login`): Accessible without authentication

### Environment Variables

```bash
ADMIN_PASSWORD=your-secure-password-here
JWT_SECRET=your-jwt-secret-key-change-in-production
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Authenticate with the admin password and obtain a session token.

**Method**: `POST`

**Authentication Required**: No

**Request Body**:

```json
{
  "password": "admin123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Yes | The admin password. Must match `ADMIN_PASSWORD` env variable. |

**Response (Success - 200)**:

```json
{
  "success": true
}
```

The response includes a Set-Cookie header with the `admin_token` JWT token.

**Response (Error - 400)**:

```json
{
  "error": "Invalid request body"
}
```

Returned when the request body is not valid JSON.

**Response (Error - 401)**:

```json
{
  "error": "รหัสผ่านไม่ถูกต้อง"
}
```

Returned when the password is incorrect or missing. The error message is in Thai: "Incorrect password".

**Example cURL**:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}' \
  -v
```

**Example JavaScript**:

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'admin123' }),
  credentials: 'include', // Include cookies
});

if (response.ok) {
  const data = await response.json();
  console.log('Logged in successfully:', data);
} else {
  const error = await response.json();
  console.error('Login failed:', error.error);
}
```

---

#### POST /api/auth/logout

End the admin session and clear the authentication cookie.

**Method**: `POST`

**Authentication Required**: No (but typically called after login)

**Request Body**: Empty

**Response (Success - 200)**:

```json
{
  "success": true
}
```

The response includes a Set-Cookie header that clears the `admin_token` cookie.

**Example cURL**:

```bash
curl -X POST http://localhost:3000/api/auth/logout -v
```

**Example JavaScript**:

```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});

const data = await response.json();
console.log('Logged out:', data);
```

---

### Content Management Endpoints

#### GET /api/admin/content/[filename]

Retrieve the contents of a specific content JSON file.

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | string | Yes | Name of the content file (without `.json`). Allowed values: `settings`, `manual`, `news`, `tpacare-check`, `insurance-companies`, `self-insured`, `international-insurance`, `deductible`. |

**Response (Success - 200)**:

Returns the parsed JSON content of the requested file. Response structure depends on the filename (see [Content Files](#content-files) section for details).

Example for `GET /api/admin/content/news`:

```json
{
  "items": [
    {
      "id": "n1",
      "title": "Sample News Item",
      "url": "https://example.com/news1.pdf",
      "isNew": true,
      "isPublished": true
    }
  ]
}
```

**Response (Error - 400)**:

```json
{
  "error": "Invalid filename: \"badfile\""
}
```

Returned when the filename is not in the allowed list.

**Response (Error - 401)**:

```json
{
  "error": "Unauthorized"
}
```

Returned when the request lacks a valid JWT token.

**Response (Error - 500)**:

```json
{
  "error": "Failed to read content file"
}
```

Returned when the server cannot read the content file (e.g., file doesn't exist or is corrupted).

**Example cURL**:

```bash
curl http://localhost:3000/api/admin/content/settings \
  -H "Cookie: admin_token=<jwt-token>"
```

**Example JavaScript**:

```javascript
const response = await fetch('/api/admin/content/news', {
  method: 'GET',
  credentials: 'include', // Include auth cookie
});

if (response.ok) {
  const newsData = await response.json();
  console.log('News items:', newsData.items);
} else if (response.status === 401) {
  console.error('Not authenticated');
  // Redirect to login
  window.location.href = '/admin/login';
} else {
  const error = await response.json();
  console.error('Error:', error.error);
}
```

---

#### PUT /api/admin/content/[filename]

Update the contents of a specific content JSON file. This endpoint replaces the entire file with the provided JSON data.

**Method**: `PUT`

**Authentication Required**: Yes

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | string | Yes | Name of the content file (without `.json`). Allowed values: `settings`, `manual`, `news`, `tpacare-check`, `insurance-companies`, `self-insured`, `international-insurance`, `deductible`. |

**Request Body**:

The complete JSON structure for the content file. The structure depends on the file type (see [Content Files](#content-files) section for details).

Example for `PUT /api/admin/content/news`:

```json
{
  "items": [
    {
      "id": "n1",
      "title": "Updated News Title",
      "url": "https://example.com/news-updated.pdf",
      "isNew": false,
      "isPublished": true
    },
    {
      "id": "n2",
      "title": "New News Item",
      "url": "https://example.com/news-new.pdf",
      "isNew": true,
      "isPublished": true
    }
  ]
}
```

**Response (Success - 200)**:

```json
{
  "success": true
}
```

**Response (Error - 400)**:

```json
{
  "error": "Invalid filename: \"badfile\""
}
```

or

```json
{
  "error": "Invalid JSON body"
}
```

Returned when the filename is invalid or the request body is not valid JSON.

**Response (Error - 401)**:

```json
{
  "error": "Unauthorized"
}
```

Returned when the request lacks a valid JWT token.

**Response (Error - 500)**:

```json
{
  "error": "Failed to write content file"
}
```

Returned when the server cannot write to the content file (e.g., disk full, permission denied).

**Example cURL**:

```bash
curl -X PUT http://localhost:3000/api/admin/content/news \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_token=<jwt-token>" \
  -d '{
    "items": [
      {
        "id": "n1",
        "title": "Updated News",
        "url": "https://example.com/news.pdf",
        "isNew": true,
        "isPublished": true
      }
    ]
  }'
```

**Example JavaScript**:

```javascript
const newsData = {
  items: [
    {
      id: 'n1',
      title: 'Breaking News',
      url: 'https://example.com/news.pdf',
      isNew: true,
      isPublished: true,
    },
  ],
};

const response = await fetch('/api/admin/content/news', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newsData),
  credentials: 'include',
});

if (response.ok) {
  const result = await response.json();
  console.log('Content updated:', result);
} else if (response.status === 401) {
  console.error('Not authenticated');
  window.location.href = '/admin/login';
} else {
  const error = await response.json();
  console.error('Update failed:', error.error);
}
```

---

#### POST /api/admin/upload

Upload an image file to the server. The file is stored in `/public/images/` and a public URL is returned.

**Method**: `POST`

**Authentication Required**: Yes

**Request Format**: `multipart/form-data`

**Form Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The image file to upload. Accepted formats: PNG, JPG, JPEG, GIF, WebP, SVG. Max size: no hard limit (browser/server dependent). |

**Response (Success - 200)**:

```json
{
  "url": "/images/1234567890-image-name.png"
}
```

The returned URL can be used in content files (e.g., as a `logoUrl` or `imageUrl`).

**Response (Error - 400)**:

```json
{
  "error": "No file provided. Expected a form field named 'file'."
}
```

or

```json
{
  "error": "Invalid file type. Allowed types: png, jpg, jpeg, gif, webp, svg"
}
```

Returned when no file is provided or the file type is not allowed.

**Response (Error - 401)**:

```json
{
  "error": "Unauthorized"
}
```

Returned when the request lacks a valid JWT token.

**Response (Error - 500)**:

```json
{
  "error": "Server error: could not create upload directory"
}
```

or

```json
{
  "error": "Server error: could not save file"
}
```

Returned when the server cannot create the upload directory or save the file.

**Filename Generation**:

Uploaded files are renamed with a timestamp and sanitized name to prevent conflicts:

- Pattern: `{timestamp}-{sanitized-name}.{extension}`
- Example: `1734567890123-invoice.png`
- Non-alphanumeric characters in the original filename are replaced with underscores
- The base name is limited to 64 characters

**Example cURL**:

```bash
curl -X POST http://localhost:3000/api/admin/upload \
  -H "Cookie: admin_token=<jwt-token>" \
  -F "file=@/path/to/image.png"
```

**Example JavaScript**:

```javascript
const formData = new FormData();
formData.append('file', fileInputElement.files[0]);

const response = await fetch('/api/admin/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include',
});

if (response.ok) {
  const result = await response.json();
  console.log('Image uploaded:', result.url);
  // Use result.url in content
} else if (response.status === 401) {
  console.error('Not authenticated');
} else {
  const error = await response.json();
  console.error('Upload failed:', error.error);
}
```

---

## Data Models

### AlertType

A string enum representing alert styling types used in badges and alerts.

```typescript
type AlertType = "warning" | "error" | "info" | "success" | "promo" | "urgent";
```

### AlertSize

A string enum representing the size of alerts.

```typescript
type AlertSize = "xs" | "sm" | "md" | "lg" | "xl";
```

### AlertBorder

A string enum representing border animation styles for alerts.

```typescript
type AlertBorder = "none" | "glow" | "pulse" | "shimmer" | "bounce" | "shake" | "rainbow" | "blink";
```

### Company

Represents an insurance company or self-insured organization.

```typescript
interface Company {
  id: string;                                        // Unique identifier
  displayName: string;                              // Company name displayed to users
  code: string | null;                              // iClaim company code (for system integration)
  iclaimId: string | null;                          // iClaim numeric ID (for claim redirection)
  isClickable: boolean;                             // Whether the company is active/clickable
  isNew: boolean;                                   // If true, displays "NEW" badge
  claimType: "OPD_IPD" | "OPD_ONLY" | "IPD_ONLY";  // Types of claims supported
  remark: string | null;                            // Remark shown in red when company is suspended
  redirectUrl?: string;                             // Custom redirect URL (skips iClaim modal)
  logoUrl?: string | null;                          // URL to company logo image
  alertText?: string | null;                        // Alert message (e.g., "OPD self-pay")
  alertType?: AlertType;                            // Alert style type
  alertSize?: AlertSize;                            // Alert size
  alertGlow?: boolean;                              // Add glow effect to alert
  alertBorder?: AlertBorder;                        // Border animation style
}
```

**Example**:

```json
{
  "id": "ins-1",
  "displayName": "บมจ.ประกันชีวิต ABC",
  "code": "ABC123",
  "iclaimId": "42",
  "isClickable": true,
  "isNew": false,
  "claimType": "OPD_IPD",
  "remark": null,
  "logoUrl": "/logos/abc-insurance.png"
}
```

### CompanyGroup

Represents a grouped set of companies (used in self-insured section for parent companies with subsidiaries).

```typescript
interface CompanyGroup {
  id: string;                    // Unique identifier
  headerName: string;            // Parent company/group name
  headerIconUrl: string | null;  // Logo URL for the group header
  companies: Company[];          // Array of child companies
  alertText?: string | null;     // Alert message for the group
  alertType?: AlertType;         // Alert style type
  alertSize?: AlertSize;         // Alert size
  alertGlow?: boolean;           // Add glow effect
  alertBorder?: AlertBorder;     // Border animation style
}
```

**Example**:

```json
{
  "id": "group-1",
  "headerName": "คาราบาวกรุ๊ป",
  "headerIconUrl": "/logos/karabao-group.png",
  "companies": [
    {
      "id": "sub-1",
      "displayName": "Subsidiary Company 1",
      "code": "SUB1",
      "iclaimId": "100",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    },
    {
      "id": "sub-2",
      "displayName": "Subsidiary Company 2",
      "code": "SUB2",
      "iclaimId": "101",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null
    }
  ]
}
```

### CompanySection

Represents a section of companies (e.g., "Insurance Companies" or "Self-Insured").

```typescript
interface CompanySection {
  heading: string;                // Section heading (e.g., "บริษัทประกันภัย")
  companies: Company[];           // Flat array of companies
  groups?: CompanyGroup[];        // Optional: grouped companies
  alertText?: string | null;      // Alert message for the entire section
  alertType?: AlertType;          // Alert style type
  alertSize?: AlertSize;          // Alert size
  alertGlow?: boolean;            // Add glow effect
  alertBorder?: AlertBorder;      // Border animation style
}
```

### NewsItem

Represents a news or announcement entry.

```typescript
interface NewsItem {
  id: string;           // Unique identifier
  title: string;        // News title
  url: string;          // URL to news document (typically PDF)
  isNew: boolean;       // If true, displays "NEW" badge
  isPublished: boolean; // If false, item is hidden from portal
}
```

### NewsData

Container for all news items.

```typescript
interface NewsData {
  items: NewsItem[]; // Array of news items
}
```

### ManualItem

Represents a manual or guide entry.

```typescript
interface ManualItem {
  id: string;           // Unique identifier
  title: string;        // Manual title
  url: string;          // URL to manual document (typically PDF)
  isPublished: boolean; // If false, item is hidden from portal
}
```

### ManualData

Container for manual items with a subheading.

```typescript
interface ManualData {
  subHeading: string;  // Sub-heading displayed under "Manual" (e.g., "คู่มือ TPA")
  items: ManualItem[]; // Array of manual items
}
```

### AnnouncementConfig

Configuration for a site-wide announcement banner.

```typescript
interface AnnouncementConfig {
  enabled: boolean;      // Whether the announcement is shown
  text: string;          // Announcement text
  type: AlertType;       // Alert style type
  size: AlertSize;       // Alert size
  glow?: boolean;        // Add glow effect
  border: AlertBorder;   // Border animation style
  link: string | null;   // Optional URL for the announcement
  dismissible: boolean;  // Whether users can dismiss the announcement
}
```

### PortalSettings

Top-level configuration for the portal.

```typescript
interface PortalSettings {
  logo: {
    url: string;       // Logo image URL
    alt: string;       // Alt text for accessibility
  };
  iclaim: {
    baseUrl: string;           // iClaim system base URL
    confirmText: string;       // Confirmation dialog message
    confirmOk: string;         // OK button text
    confirmCancel: string;     // Cancel button text
    claimTypePrompt: string;   // Prompt for claim type selection
  };
  announcement?: AnnouncementConfig; // Optional: site-wide announcement
}
```

**Example**:

```json
{
  "logo": {
    "url": "/images/bvtpa-logo.png",
    "alt": "BVTPA Logo"
  },
  "iclaim": {
    "baseUrl": "https://tpacare.example.com/app/EClaim.aspx",
    "confirmText": "ระบบกำลังพาท่านไปสู่ระบบ Claim",
    "confirmOk": "ตกลง",
    "confirmCancel": "ยกเลิก",
    "claimTypePrompt": "เลือก Claim Type ที่ต้องการ"
  },
  "announcement": {
    "enabled": true,
    "text": "ระบบอยู่ระหว่างการบำรุงรักษา",
    "type": "warning",
    "size": "md",
    "border": "glow",
    "link": null,
    "dismissible": true
  }
}
```

### TpaCareCheck

Configuration for the TPA Care Check section.

```typescript
interface TpaCareCheck {
  heading: string;      // Section heading
  description: string;  // Description text
  imageUrl: string | null; // Optional image
  redirectCode: string; // iClaim code for redirect
  redirectId: string;   // iClaim ID for redirect
}
```

---

## Content Files

All portal content is stored in JSON files in the `/content/` directory. These files can be read and updated via the API.

### List of Content Files

| Filename | Content Type | Description |
|----------|--------------|-------------|
| `settings` | PortalSettings | Portal branding, iClaim config, and announcements |
| `manual` | ManualData | User manuals and guides |
| `news` | NewsData | News and announcements |
| `tpacare-check` | TpaCareCheck | TPA Care Check section config |
| `insurance-companies` | CompanySection | Insurance companies and life insurance companies |
| `self-insured` | CompanySection | Self-insured employee benefit organizations |
| `international-insurance` | CompanySection | International insurance companies |
| `deductible` | CompanySection | Deductible-based insurance options |

### File Structure Reference

#### settings.json

```json
{
  "logo": {
    "url": "/images/bvtpa-logo.png",
    "alt": "BVTPA TPA Care"
  },
  "iclaim": {
    "baseUrl": "https://tpacare.thirdpartyadmin.co.th/app/EClaim.aspx",
    "confirmText": "ระบบกำลังพาท่านไปสู่ระบบ Claim",
    "confirmOk": "ตกลง",
    "confirmCancel": "ยกเลิก",
    "claimTypePrompt": "เลือก Claim Type ที่ต้องการ"
  },
  "announcement": {
    "enabled": false,
    "text": "",
    "type": "warning",
    "size": "lg",
    "border": "glow",
    "link": null,
    "dismissible": false
  }
}
```

#### manual.json

```json
{
  "subHeading": "คู่มือ TPA",
  "items": [
    {
      "id": "m1",
      "title": "คู่มือการใช้งาน TPA Care mobile app (PDF)",
      "url": "https://tpacare.thirdpartyadmin.co.th/app/Download/TPA_Care_Manual.pdf",
      "isPublished": true
    },
    {
      "id": "m2",
      "title": "บริษัทที่อยู่ภายใต้การดูแลของ THRES (TPA)",
      "url": "https://tpacare.thirdpartyadmin.co.th/app/Download/CompanyTHRES.pdf",
      "isPublished": true
    }
  ]
}
```

#### news.json

```json
{
  "items": [
    {
      "id": "n1",
      "title": "Important Announcement Title",
      "url": "https://example.com/announcement.pdf",
      "isNew": true,
      "isPublished": true
    },
    {
      "id": "n2",
      "title": "Previous Announcement",
      "url": "https://example.com/previous.pdf",
      "isNew": false,
      "isPublished": true
    }
  ]
}
```

#### tpacare-check.json

```json
{
  "heading": "ตรวจสอบการใช้บัตรผ่าน TPACare Mobile App",
  "description": "Description text here",
  "imageUrl": null,
  "redirectCode": "TPACARE",
  "redirectId": "0"
}
```

#### insurance-companies.json

```json
{
  "heading": "บริษัทประกันภัยและประกันชีวิต",
  "companies": [
    {
      "id": "ins-1",
      "displayName": "บมจ.ประกันชีวิต ABC",
      "code": "ABC",
      "iclaimId": "1",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null,
      "logoUrl": "/logos/abc.png"
    }
  ]
}
```

#### self-insured.json

```json
{
  "heading": "สวัสดิการพนักงาน (Self Insured)",
  "companies": [
    {
      "id": "si-1",
      "displayName": "Company Name Ltd.",
      "code": "CNAME",
      "iclaimId": "100",
      "isClickable": true,
      "isNew": false,
      "claimType": "OPD_IPD",
      "remark": null,
      "logoUrl": "/logos/company.png"
    }
  ],
  "groups": [
    {
      "id": "group-1",
      "headerName": "Parent Company Group",
      "headerIconUrl": "/logos/parent.png",
      "companies": [
        {
          "id": "sub-1",
          "displayName": "Subsidiary 1",
          "code": "SUB1",
          "iclaimId": "101",
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

#### international-insurance.json

Similar structure to `insurance-companies.json`:

```json
{
  "heading": "บริษัทประกันภัยระหว่างประเทศ",
  "companies": [
    // ... Company array
  ]
}
```

#### deductible.json

Similar structure to `insurance-companies.json`:

```json
{
  "heading": "ประกันแบบมีเบี้ยประกัน",
  "companies": [
    // ... Company array
  ]
}
```

---

## Error Handling

### Common Error Responses

All error responses use appropriate HTTP status codes and return JSON with an `error` field.

#### 400 Bad Request

Returned when the request format is invalid.

```json
{
  "error": "Invalid filename: \"badfile\""
}
```

or

```json
{
  "error": "Invalid JSON body"
}
```

or

```json
{
  "error": "Invalid request body"
}
```

**When it occurs**:
- Invalid filename in URL
- Malformed JSON in request body
- Missing required fields

**How to fix**:
- Verify the filename is in the allowed list
- Validate JSON syntax
- Check required fields are present

#### 401 Unauthorized

Returned when authentication fails.

```json
{
  "error": "Unauthorized"
}
```

or (on login endpoint)

```json
{
  "error": "รหัสผ่านไม่ถูกต้อง"
}
```

**When it occurs**:
- No valid JWT token in cookie
- Expired JWT token
- Invalid password on login

**How to fix**:
- Log in again at `/admin/login`
- Ensure cookies are enabled in your browser
- Check the password is correct
- Verify clock synchronization if JWT validation fails

#### 500 Internal Server Error

Returned when the server encounters an unexpected error.

```json
{
  "error": "Failed to read content file"
}
```

or

```json
{
  "error": "Failed to write content file"
}
```

or

```json
{
  "error": "Server error: could not save file"
}
```

**When it occurs**:
- File system permission errors
- Disk space issues
- Corrupted JSON files
- Directory creation failures

**How to fix**:
- Check server logs for details
- Verify file permissions on `/content/` directory
- Ensure adequate disk space
- Verify JSON file integrity
- Contact system administrator if needed

### HTTP Status Code Reference

| Status Code | Meaning | Typical Response |
|------------|---------|------------------|
| 200 OK | Request succeeded | JSON response with data or `{ "success": true }` |
| 400 Bad Request | Invalid request format | `{ "error": "..." }` |
| 401 Unauthorized | Authentication failed | `{ "error": "Unauthorized" }` or `{ "error": "รหัสผ่านไม่ถูกต้อง" }` |
| 500 Internal Server Error | Server error | `{ "error": "..." }` |

---

## Best Practices

### Authentication

- **Store credentials securely**: Never hardcode passwords. Use environment variables.
- **Use HTTPS in production**: Ensure the `secure` flag works by using HTTPS.
- **Change the JWT secret**: Update `JWT_SECRET` in production.
- **Monitor token expiration**: Users will need to log in again after 8 hours.

### Content Updates

- **Validate before sending**: Ensure your JSON is valid before making PUT requests.
- **Preserve structure**: When updating a file, maintain the expected schema (use GET first if unsure).
- **Batch updates**: If updating multiple files, consider doing them in sequence.
- **Error handling**: Always check response status and handle errors gracefully.

### Image Uploads

- **Optimize images**: Compress images before uploading to save storage.
- **Use appropriate formats**: PNG for logos, JPEG for photos, SVG for icons.
- **Store URLs**: After uploading, store the returned URL in content files (e.g., as `logoUrl`).
- **Cleanup old images**: The server keeps all uploaded images; periodically remove unused files from `/public/images/`.

### Rate Limiting

Currently, there is no built-in rate limiting. If deploying at scale, consider adding rate limiting middleware to prevent abuse.

---

## Integration Examples

### Complete Authentication Flow

```javascript
// 1. Log in
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'admin123' }),
  credentials: 'include',
});

if (!loginResponse.ok) {
  console.error('Login failed');
  process.exit(1);
}

// 2. Fetch content
const contentResponse = await fetch('/api/admin/content/news', {
  credentials: 'include',
});

const news = await contentResponse.json();
console.log('Current news:', news.items);

// 3. Update content
const updatedNews = {
  items: [
    ...news.items,
    {
      id: 'n-new',
      title: 'New Announcement',
      url: 'https://example.com/new.pdf',
      isNew: true,
      isPublished: true,
    },
  ],
};

const updateResponse = await fetch('/api/admin/content/news', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedNews),
  credentials: 'include',
});

if (updateResponse.ok) {
  console.log('News updated successfully');
}

// 4. Log out
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});

console.log('Logged out');
```

### Upload an Image and Use It

```javascript
// 1. Upload image
const formData = new FormData();
formData.append('file', imageFile);

const uploadResponse = await fetch('/api/admin/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include',
});

const { url } = await uploadResponse.json();
console.log('Image URL:', url); // e.g., "/images/1234567890-logo.png"

// 2. Use the URL in content
const companiesResponse = await fetch('/api/admin/content/insurance-companies', {
  credentials: 'include',
});

const companies = await companiesResponse.json();

// Add a new company with the uploaded logo
companies.companies.push({
  id: 'ins-new',
  displayName: 'New Insurance Co.',
  code: 'NEWINC',
  iclaimId: '999',
  isClickable: true,
  isNew: true,
  claimType: 'OPD_IPD',
  remark: null,
  logoUrl: url, // Use the uploaded image
});

// 3. Save updated companies
const saveResponse = await fetch('/api/admin/content/insurance-companies', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(companies),
  credentials: 'include',
});

if (saveResponse.ok) {
  console.log('Company added with logo');
}
```

### Check Authentication Status

```javascript
// Attempt to fetch protected content
const response = await fetch('/api/admin/content/settings', {
  credentials: 'include',
});

if (response.status === 401) {
  console.log('Not authenticated - redirecting to login');
  window.location.href = '/admin/login';
} else if (response.ok) {
  const settings = await response.json();
  console.log('Authenticated, settings:', settings);
}
```

---

## Troubleshooting

### "Unauthorized" Error on API Calls

**Issue**: API returns 401 even after logging in.

**Solutions**:
- Ensure cookies are enabled in your browser
- Check that the login response set a cookie (inspect browser DevTools > Application > Cookies)
- Verify `credentials: 'include'` is in your fetch options
- Log in again—your token may have expired
- Check server logs for JWT validation errors

### "Invalid filename" Error

**Issue**: PUT/GET request returns "Invalid filename".

**Solution**: Verify the filename matches one of the allowed files:
- `settings`
- `manual`
- `news`
- `tpacare-check`
- `insurance-companies`
- `self-insured`
- `international-insurance`
- `deductible`

### Image Upload Returns "Server error"

**Issue**: File upload fails with "could not save file".

**Solutions**:
- Check disk space on the server
- Verify `/public/images/` directory exists and is writable
- Ensure file size is reasonable
- Check file type is allowed (PNG, JPG, JPEG, GIF, WebP, SVG)
- Check server logs for detailed error messages

### Content Not Updating

**Issue**: PUT request succeeds but content doesn't change.

**Solutions**:
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R) to clear cache
- Verify the PUT request body is valid JSON
- Check the response from the PUT request confirms `"success": true`
- Verify no concurrent updates are overwriting your changes
- Check server logs for write errors

---

## API Versioning

The current API has no explicit versioning. All endpoints are stable. If breaking changes are needed in the future, a version prefix (e.g., `/api/v2/`) will be introduced.

---

## Security Considerations

1. **Single Password**: The API uses a single shared password. Implement IP allowlisting or additional authentication layers if deploying in untrusted networks.

2. **HTTPS Required**: Always use HTTPS in production to protect the password and JWT tokens in transit.

3. **JWT Secret**: Change the `JWT_SECRET` environment variable in production to a strong, random value.

4. **File Uploads**: Uploaded files are not validated beyond file extension. Implement additional validation if user-generated files are a concern.

5. **CORS**: The API does not restrict Cross-Origin requests by default. Add CORS middleware if deploying the admin panel separately from the API.

6. **Audit Logging**: Consider adding audit logs for sensitive operations (login, content updates).

---

## Support

For issues or questions about the API:

1. Check the error message and consult the [Error Handling](#error-handling) section
2. Review the [Troubleshooting](#troubleshooting) section
3. Examine server logs for additional context
4. Contact the system administrator with the request details and error message


# MiraTymz Programming Academy

## Python Programming: Foundations & Practical Development
**Tagline:** *Learn Today, Stay Ahead!*

A secure, high-performance web platform for university students to register, make direct bank transfers, upload verification documents and transaction receipts, and track their admission status for the 8-Week Python Training Programme.

---

### Features & Workflow

1. **High-Converting Landing Page (`/`):**
   - 8-Week curriculum breakdown
   - Start Date: **Monday, 23 November 2026**
   - Live promotional pricing engine with automated countdown timer
   - Interactive course guide modal preview and secure download
   - Code snippet showcase, student benefits, and dynamic FAQ

2. **Student Enrollment Portal (`/register`):**
   - Step 1: Personal & academic details (Name, Email, WhatsApp Phone, Department, Level) with instant real-time field validation
   - Step 2: UNIBEN Student Verification (Upload Admission Letter / ID card)
   - Step 3: Secure bank transfer instructions (Dynamic Account Number with one-click copy, live payment amount calculation)
   - Step 4: Transaction receipt upload with automated tracking code generation (e.g. `MTZ-XXXXX`) and instant status review

3. **Status Check & Classroom Access (`/status`):**
   - Real-time status lookup using Tracking Reference
   - `Pending`: Awaiting transfer and receipt upload
   - `Under Review`: Receipt and Admission Letter submitted, audited by Admissions Desk
   - `Approved`: Instant access to download the Comprehensive Course Guide PDF + direct connection to the Official Paid Members WhatsApp Group
   - `Declined`: Actionable feedback with instant re-upload capability

4. **Hardened Administrative Management Portal:**
   - Multi-layered security with HMAC-SHA256 cryptographically signed session tokens
   - Rate limiting and anti-brute-force defense with automated 15-minute security lockouts
   - Dynamic bank configuration: Bank Name, Account Number, Account Name
   - Promotional Engine: Live discount toggles, fee customizers, seat counters, and expiration deadlines
   - Curriculum File Manager: Upload and update course guide PDFs with immediate public synchronization
   - Admissions Desk: Search, filter, inspect full-resolution receipts and admission letters, with single-click approvals, declines, or VIP status updates

---

### Security & Environment Variables

All sensitive administrative credentials and database keys are managed strictly via server-side environment variables and are never exposed in public repositories or client-side bundles:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous client key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase backend service role key
- `ADMIN_SECRET_KEY`: Cryptographic signing secret for HMAC-SHA256 tokens
- `ADMIN_USERNAME`: Configurable staff administrative username (defaults to server configuration)
- `ADMIN_PASSWORD`: Configurable staff administrative password (defaults to server configuration)

---

### Tech Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (Emerald & Gold Brand Theme)
- **Database & Storage:** Supabase PostgreSQL & Supabase Storage
- **Hosting & CI/CD:** Vercel

---
© MiraTymz Programming Academy. All rights reserved.

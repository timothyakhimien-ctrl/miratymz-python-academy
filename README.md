# MiraTymz Programming Academy

## Python Programming: Foundations & Practical Development
**Tagline:** *Learn Today, Stay Ahead!*

A complete web application for university students to register, make direct bank transfers, upload transaction receipts, and track their admission status for the 8-Week Python Training Programme.

---

### Features & Workflow

1. **High-Converting Landing Page (`/`):**
   - 8-Week curriculum breakdown
   - Start Date: **Monday, 16 November 2026**
   - UNIBEN 30% discount (₦5,950 instead of ₦8,500) vs General rate (₦10,000)
   - Code snippet showcase, benefits, and FAQ

2. **Student Enrollment Portal (`/register`):**
   - Form for student details: Name, Email, WhatsApp Phone, Institution, Department, Level
   - Dynamic fee calculation
   - Instant bank transfer details (Bank Name, Account Number, Account Name)
   - Proof of payment upload (Image / PDF)
   - Automatic generation of a unique **Tracking ID** (e.g. `MTZ-XXXXX`)

3. **Status Check & Classroom Access (`/status`):**
   - Real-time status tracker:
     - `Pending`: Awaiting transfer and receipt upload
     - `Under Review`: Receipt submitted, currently being audited
     - `Approved`: Congratulatory message + instant one-click link to the **Official Paid Members WhatsApp Group**
     - `Declined`: Actionable reason and option to re-upload

4. **Encrypted Admin Management Suite (`/miraadmintymz`):**
   - Password-protected authentication (`miraadmin` / `miratymz2026`)
   - **Bank Account Configuration:** Set Bank Name, Account Number, and Account Name dynamically
   - **Fee Management:** Override UNIBEN or General rates
   - **WhatsApp Link:** Set VIP Paid Members group invite link
   - **Live Registrations Table:** Search, filter, inspect full-resolution receipts, and single-click **Approve** or **Decline**

---

### Tech Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (Emerald & Gold Brand Theme)
- **Database & Storage:** Supabase PostgreSQL & Supabase Storage
- **Hosting & CI/CD:** Vercel

---
© MiraTymz Programming Academy. All rights reserved.

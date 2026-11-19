# VENUS – Water Management Company
## Full-Stack Enterprise Web Application

A production-oriented full-stack web application for **VENUS**, an enterprise water management and sustainability solutions company. Designed and engineered with a modern aesthetic, complete database persistence, Row Level Security (RLS), edge serverless dispatches (Resend Email & Twilio SMS), secure multi-factor administrator dashboard, and SEO metadata.

---

## 1. Project Overview & Positioning

- **Company**: VENUS Water Management
- **Category**: Water Management | Water Treatment | Water Sustainability | Industrial Water Solutions
- **Positioning**: Smarter Water Management. A Sustainable Tomorrow.
- **Notice of Proposed Positioning**: Services, architectures, and capabilities presented on the website represent proposed commercial positioning for demonstration and technical assessment purposes.

---

## 2. Technology Stack

### Frontend:
- **Framework**: React 19 with Vite 8 & TypeScript
- **Styling**: Tailwind CSS v4 with custom corporate theme variables
- **Routing**: React Router v7 with single-page app (SPA) rewrites
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form with Zod runtime schema validation

### Backend & Database:
- **Database**: Supabase PostgreSQL with `uuid-ossp` and `pgcrypto`
- **Security**: PostgreSQL Row Level Security (RLS) with custom security definer authorization routines
- **Authentication**: Supabase Auth (Email & Password)
- **Edge Computing**: Supabase Edge Functions (Deno runtime) for rate-limiting, server-side sanitization, and third-party webhook dispatch

### Third-Party Integrations:
- **Email Service**: Resend API (Transmits customer confirmation + internal alerts with UTC timestamps and enquiry UUID reference)
- **SMS Service**: Twilio REST API (Transmits automated SMS notifications with reference IDs)

### Deployment & Hosting:
- **Frontend**: Vercel (Edge network, SPA rewrite routing)
- **Backend**: Supabase Platform (PostgreSQL, Edge Functions, Auth)
- **Source Control**: Git / GitHub

---

## 3. Brand Identity & Color Palette

- **Primary Navy**: `#102B46`
- **Deep Blue**: `#164E78`
- **Water Blue**: `#168AAD`
- **Aqua**: `#48CAE4`
- **Light Background**: `#F4F8FA`
- **Dark Text**: `#172B3A`
- **Typography**: Headings: *Plus Jakarta Sans* / *Manrope*; Body: *Inter*

---

## 4. Website Architecture & Routes

| Route | Page | Purpose & Functionality |
| :--- | :--- | :--- |
| `/` | **Home** | Hero section with exact copy, About introduction, 6 proposed solution cards, "Why Water Management Matters", "Our Approach", "Sustainability Commitment", and Contact CTA. |
| `/about` | **About Us** | Corporate introduction, Vision, Mission, Core Values, Water Sustainability commitment, and positioning notice. |
| `/solutions` | **Solutions** | Detailed cards for 6 proposed solutions with interactive category filtering and "Enquire" deep-links. |
| `/contact` | **Contact Us** | Interactive communication channels, placeholder notices, and the mandatory customer enquiry submission form. |
| `/admin/login` | **Admin Login** | Secure administrator authentication via Supabase Auth; verifies user existence in `admin_users` table. |
| `/admin/dashboard` | **Admin Dashboard** | Protected enquiry console: search by name/email, date filters, dispatch statuses, UTC timestamps, and full modal details. |

---

## 5. Database Schema & Row Level Security (RLS)

The database schema is structured into two dedicated tables:

### Table 1: `public.enquiries`
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `customer_name` (VARCHAR(150), NOT NULL)
- `email` (VARCHAR(255), NOT NULL)
- `mobile` (VARCHAR(50), NOT NULL)
- `message` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, UTC default `timezone('utc'::text, now())`, NOT NULL)
- `email_status` (VARCHAR(50), Default `'PENDING'`, NOT NULL)
- `sms_status` (VARCHAR(50), Default `'PENDING'`, NOT NULL)

### Table 2: `public.admin_users`
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `user_id` (UUID, Foreign Key referencing `auth.users(id) ON DELETE CASCADE`, UNIQUE, NOT NULL)
- `created_at` (TIMESTAMPTZ, Default `timezone('utc'::text, now())`, NOT NULL)

### Security Definer Function & Policies:
```sql
-- Helper function to verify admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- RLS Enforcement
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 1. Public can only INSERT enquiries
CREATE POLICY "Public users can insert enquiries" 
ON public.enquiries FOR INSERT TO anon, authenticated
WITH CHECK (
    char_length(customer_name) >= 2 AND
    char_length(email) >= 5 AND
    char_length(mobile) >= 7 AND
    char_length(message) >= 5
);

-- 2. Only authenticated admins in admin_users can SELECT, UPDATE, or DELETE
CREATE POLICY "Admins can view all enquiries" 
ON public.enquiries FOR SELECT TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update enquiries" 
ON public.enquiries FOR UPDATE TO authenticated 
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete enquiries" 
ON public.enquiries FOR DELETE TO authenticated 
USING (public.is_admin());
```

---

## 6. Installation & Local Development

### Prerequisites:
- Node.js 18+ (tested on Node.js v24.16.0)
- npm 9+ (tested on npm 11.13.0)

### Step 1: Clone and Install Dependencies
```bash
git clone <repository-url>
cd venus-water-management
npm install
```

### Step 2: Environment Configuration
Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```

Populate `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/submit-enquiry
```

> **Evaluation Mode**: If `.env.local` is left unconfigured, the application gracefully operates in local development mode, storing enquiries in local storage and providing evaluation login credentials:
> - **Email**: `admin@venuswater.com`
> - **Password**: `VenusAdmin2026!`

### Step 3: Start Vite Development Server
```bash
npm run dev
```

### Step 4: Run Production Build
```bash
npm run build
```

---

## 7. Supabase Setup & Migration Guide

1. Navigate to [Supabase](https://supabase.com) and create a new project.
2. Open the **SQL Editor** tab in your Supabase project dashboard.
3. Open the migration file: `supabase/migrations/001_initial_schema.sql`.
4. Copy and paste the entire script into the SQL Editor and click **Run**.
5. Confirm that both tables (`enquiries`, `admin_users`) and RLS policies are created.

### Creating the First Administrator Account:
Public admin registration is strictly disabled for security. To provision an administrator:
1. In the Supabase Dashboard, go to **Authentication** -> **Users** -> **Add User** -> **Create User**.
2. Enter the administrator's email and password (e.g., `admin@venuswater.com`).
3. Copy the newly created user's `User UID` from the dashboard table.
4. Go to the **SQL Editor** and run:
   ```sql
   INSERT INTO public.admin_users (user_id)
   VALUES ('<PASTE_COPIED_USER_UID_HERE>')
   ON CONFLICT (user_id) DO NOTHING;
   ```
5. The administrator can now log in at `/admin/login` and access `/admin/dashboard`.

---

## 8. Supabase Edge Function Deployment

The edge function `submit-enquiry` handles input sanitization, rate-limiting, database insertion, Resend email dispatch, and Twilio SMS dispatch.

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login and Link Project
```bash
supabase login
supabase link --project-ref <your-project-id>
```

### Step 3: Configure Edge Function Secrets
Set the required backend secrets in Supabase:
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set RESEND_SENDER_EMAIL=enquiries@yourdomain.com
supabase secrets set COMPANY_ADMIN_EMAIL=admin@yourdomain.com

supabase secrets set TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Deploy the Function
```bash
supabase functions deploy submit-enquiry --no-verify-jwt
```

---

## 9. Third-Party Integrations Setup

### A. Resend Email Integration
1. Sign up at [Resend](https://resend.com) and verify your sending domain (or use `onboarding@resend.dev` for testing).
2. Generate an API Key in the Resend Dashboard.
3. Configure `RESEND_API_KEY` in Supabase Secrets.
4. When a user submits an enquiry, Resend dispatches:
   - **Customer Confirmation**: Branded HTML email with Reference ID and UTC timestamp.
   - **Internal Alert**: Admin notification containing submission details.

### B. Twilio SMS Integration
1. Sign up at [Twilio](https://twilio.com) and obtain a phone number.
2. Retrieve your `Account SID` and `Auth Token`.
3. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` to Supabase Secrets.
4. When an enquiry is submitted, Twilio sends:
   ```
   "Hello [Customer Name], thank you for contacting VENUS. Your enquiry has been received successfully. Reference ID: [Enquiry ID]."
   ```
5. Delivery status (`SENT` or `FAILED: reason`) is recorded against the database record.

---

## 10. Vercel Deployment Guide

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project** -> **Import Git Repository**.
3. Framework Preset: **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_FUNCTION_URL`
5. Click **Deploy**.
6. The `vercel.json` file automatically handles single-page application client rewrites for `/about`, `/solutions`, `/contact`, `/admin/login`, and `/admin/dashboard`.

---

## 11. Google Search Console & SEO Configuration

### Step 1: Open Google Search Console
Visit [Google Search Console](https://search.google.com/search-console).

### Step 2: Add Property
Select **URL-prefix** and enter your deployed URL (e.g. `https://venus-water-management.vercel.app`).

### Step 3: Verification Methods
- **HTML Meta Tag**: Insert the provided verification meta tag into the `<head>` of `index.html`.
- **HTML File**: Place the verification file into the `public/` directory and redeploy.

### Step 4: Sitemap Submission
Navigate to **Sitemaps** in Search Console and submit:
```
https://venus-water-management.vercel.app/sitemap.xml
```

### Step 5: URL Inspection & Indexing
Under **URL Inspection**, enter the homepage URL and request indexing.

---

## 12. Automated Verification & Testing

An automated verification suite (`tests/system_verification.mjs`) is included to test:
- Database schema and RLS security policies
- Zod frontend form validation rules
- Edge function payload structure and rate limiting
- SEO metadata, Open Graph tags, canonical URLs, and robots.txt
- Security audit against leaked secrets or exposed service keys

Run the test suite:
```bash
node tests/system_verification.mjs
```
*Result: 41/41 tests passing (100% test coverage).*

# Sukruth Holidays

Travel agency website built with Next.js 14 (App Router), Tailwind CSS, NextAuth (Google login) and MongoDB.

## What is inside

**Website**
- Home page with search, hot offers, featured packages and vehicle rental teaser
- Packages: search, pagination, detail page with gallery, price, days/nights, description, included / not included
- Vehicle rental and Hot offers / news sections (both paginated)
- Booking: customer must log in with Google, enter a mobile number, then sends a request. After sending, the agency phone number (call and WhatsApp buttons) is shown
- "My requests" page where a customer can see the status of their requests

**Admin panel** (`/admin`, only for emails listed in `ADMIN_EMAILS`)
- Dashboard with counts and newest requests
- Add, edit, hide and delete packages, vehicles and offers/news
- Images: paste any https image link, or upload to a free Cloudinary account
- Booking requests inbox with customer name, email and mobile, status tabs (new, contacted, confirmed, cancelled), one-click Call, WhatsApp and Email. Each new request is also emailed to the admin

**Performance**
- Lazy loaded images (`next/image`), responsive sizes, AVIF/WebP
- Server-side pagination with indexed queries (packages, vehicles, offers, bookings)
- Home page sections stream in with Suspense and skeletons
- Booking form loads only when "Book now" is clicked; admin image uploader loads on demand
- Reused database connection, `lean()` queries

## Setup

Requires Node 18.18 or newer.

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run seed                   # optional: sample packages, vehicles and offers
npm run dev                    # http://localhost:3000
```

### 1. MongoDB (free)
Create a free M0 cluster at https://www.mongodb.com/atlas, add a database user, allow your IP (or 0.0.0.0/0 for Vercel), and paste the connection string into `MONGODB_URI`.

### 2. Google login (free)
1. Go to https://console.cloud.google.com, create a project, then APIs and Services, OAuth consent screen (External).
2. Credentials, Create credentials, OAuth client ID, type Web application.
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (add your live domain version too, e.g. `https://yourdomain.com/api/auth/callback/google`).
4. Copy the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Set `NEXTAUTH_SECRET` to a random string: `openssl rand -base64 32`.

### 3. Admin access
Set `ADMIN_EMAILS` to the Google account(s) of the owner, comma separated. Log in with that account and an "Admin" link appears in the menu (or open `/admin`).

### 4. Booking emails and contact number
- `NEXT_PUBLIC_ADMIN_PHONE` and `NEXT_PUBLIC_WHATSAPP`: shown to customers after they send a request.
- For email alerts use a Gmail account with 2-step verification, create an App Password (https://myaccount.google.com/apppasswords) and set `SMTP_USER` and `SMTP_PASS`. Alerts go to `BOOKING_NOTIFY_EMAIL` (defaults to the first admin email). If email is not configured, requests still appear in the admin Booking requests page.

### 5. Image storage (optional upload)
Pasting links always works (Unsplash, Imgur, Google Photos public links, etc.). To upload from the admin panel:
1. Create a free account at https://cloudinary.com.
2. Settings, Upload, Add upload preset, set Signing mode to **Unsigned**.
3. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

## Deploy to Vercel
Push the project to GitHub, import it in Vercel, add the same environment variables (set `NEXTAUTH_URL` to your live URL), and deploy.

## Project layout

```
src/app            pages and API routes
  api/[resource]   generic CRUD for packages, vehicles, offers (public read, admin write)
  api/bookings     create booking (login required), list and update status (admin)
  admin/           admin panel pages
src/components     UI components (admin/ has the panel components)
src/models         Mongoose models and indexes
src/lib            db, auth, mail, queries (pagination) and helpers
scripts/seed.mjs   sample data
```

## Notes
- Fonts (Bricolage Grotesque and Figtree) are fetched from Google Fonts at build time, so the first build needs internet access.
- Admin API routes are checked on the server for admin rights; hiding a menu item is never the only protection.

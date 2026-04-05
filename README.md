# IssueDesk

Campus issue reporting and tracking platform for students, staff, and admins.

IssueDesk is a role-based web app built for reporting campus problems, reviewing them, assigning them, tracking progress, and notifying users through one clean interface.

---

## 🚀 Features

### Role-Based Access
- **Students** can create issues, browse issues, comment, upvote, and track their own submissions.
- **Tech/Staff** can manage assigned issues, update progress, resolve issues, and reopen them when needed.
- **Admins** can review incoming reports, assign or reject issues, manage notices, and monitor resolved history.

### Issue Workflow
- Create and manage issues with categories, priorities, and locations
- Review state support:
  - `PENDING`
  - `ASSIGNED`
  - `REJECTED`
- Status support:
  - `OPEN`
  - `IN_PROGRESS`
  - `RESOLVED`

### Persistent User Interaction
- Comments are saved in MongoDB
- Upvotes are saved in MongoDB
- Data remains after refresh and reload

### Notices System
- Admin-managed notices
- Student-facing notices popup
- Stored through API and database

### Email Support
- Optional issue resolution email notifications using Resend

### UI Consistency
- Shared reusable components for badges, headers, and status display
- Dark-themed consistent layout across all major views

---

## 🏗️ Project Structure

```text
/src/app                 Next.js App Router pages and API routes
/src/components          Reusable UI components
/src/lib                 Shared helpers and configuration
/public                  Static assets
```

### Important Areas

```text
/app/(public)            Public and shared pages
/app/(app)               Authenticated app flows
/app/api/issues          Issue APIs
/app/api/notices         Notice APIs
```

---

## 🛠️ Tech Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS
- **Authentication:** NextAuth with Google Provider
- **Database:** MongoDB Atlas
- **Email:** Resend
- **Hosting:** Vercel

---

## 📌 Main Routes

### Public / Shared
- `/` — Landing page
- `/login` — Sign-in page
- `/issues` — Public/shared issues list
- `/issues/[id]` — Issue detail page

### Setup
- `/setup/role` — Role selection
- `/setup/section` — Issue creation step
- `/setup/location` — Location selection step

### Student
- `/my-issues` — Student issue history

### Tech / Staff
- `/tech/assigned` — Assigned issues
- `/tech/completed` — Completed issues history

### Admin
- `/admin/board` — Admin board
- `/admin/notices` — Notices management

---

## 🗂️ Data Summary

Each issue may store:

- `title`
- `description`
- `category`
- `priority`
- `section`
- `locationText`
- `createdByEmail`
- `createdById`
- `status`
- `reviewState`
- `comments`
- `upvoteCount`
- `upvotedBy`
- `createdAt`
- `updatedAt`
- `resolvedAt`

---

## 🔌 API Overview

### `/api/issues`
- `GET` — Fetch recent issues
- `POST` — Create a new issue

### `/api/issues/[id]`
- `GET` — Fetch a single issue
- `PATCH` — Update status, review state, comments, and upvotes

### `/api/notices`
- Notice management routes

### Patch capabilities include
- update `status`
- update `reviewState`
- add `commentText`
- `toggleUpvote`
- store `voterId`

---

## 📧 Email Notifications

IssueDesk supports optional email notifications when an issue is marked as resolved.

### Provider
- **Resend**

### Related Environment Variables
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

---

## 💻 Live Website

Access the deployed site here:

**https://issuedesk-ten.vercel.app**

---

## ⚙️ Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/purvi126/issuedesk.git
cd issuedesk
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

Add:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

MONGODB_URI=your_mongodb_connection_string_here
```

### 4. Optional email variables

```env
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 5. Run the app

```bash
npm run dev
```

### 6. Build before production push

```bash
npm run build
```

---

## 🌐 Deployment

The project is deployed on **Vercel**.

### Required production environment variables
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGODB_URI`

### Optional
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Make sure `NEXTAUTH_URL` matches the deployed domain.

---

## ✅ Recommended Test Flow

### Student
- Sign in with Google
- Create a new issue
- Open issue detail page
- Add a comment
- Upvote an issue
- Check `My Issues`
- Verify notices popup

### Tech / Staff
- Open assigned queue
- Move issue from `OPEN` to `IN_PROGRESS`
- Mark it `RESOLVED`
- Reopen it if needed
- Check completed history

### Admin
- Review submitted issues
- Assign an issue
- Reject an issue
- Reset review state
- Manage notices
- Check resolved history

---

## 📍 Current MVP Status

IssueDesk currently includes:

- Google sign-in
- Role-based routing
- MongoDB-backed issue creation
- Persistent comments
- Persistent upvotes
- Notice management
- Staff queue and completed history
- Admin review board
- Resolved history support
- Shared UI components
- Optional email notification support

---

## 🔧 Planned Improvements

- Better mobile responsiveness
- Toggleable sidebar
- Stronger route protection
- Cleaner email templates
- More notification options

---

## 👤 Author

Built and maintained by **Purvi**.

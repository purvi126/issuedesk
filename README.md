# IssueDesk

A role-based campus issue reporting and tracking platform built for students, staff, and administrators.

IssueDesk helps users report campus problems, review them, assign them, track their progress, and manage notices through one clean web interface.

**Live Demo:** https://issuedesk-ten.vercel.app  
**Repository:** https://github.com/purvi126/issuedesk

---

## Overview

IssueDesk is designed as a campus issue management system with separate workflows for different user roles.

### Student
Students can:
- create issues
- browse reported issues
- comment on issues
- upvote issues
- track their own submissions
- view active notices

### Tech / Staff
Tech and staff users can:
- access assigned issues
- update issue progress
- mark issues as resolved
- reopen issues when needed
- review completed work history

### Admin
Administrators can:
- review incoming issues
- assign issues to staff
- reject issues
- reset review state when needed
- manage notices
- monitor resolved issue history

---

## Highlights

- Role-based access for Student, Tech/Staff, and Admin
- Google sign-in with NextAuth
- MongoDB-backed issue creation and persistence
- Persistent comments and upvotes
- Admin-managed notices system
- Resolved issue tracking with workflow support
- Shared UI components for a consistent interface
- Optional email notifications using Resend
- Deployed on Vercel

---

## Features

### Authentication
- Google sign-in
- role-based redirects after login
- role selection setup flow

### Issue Management
- create new issues
- browse issues in list and board layouts
- view detailed issue pages
- manage issue lifecycle through status updates

### Comments and Upvotes
- comments are saved in MongoDB
- upvotes are saved in MongoDB
- both remain after refresh and reload

### Review and Status Workflow

#### Status values
- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`

#### Review state values
- `PENDING`
- `ASSIGNED`
- `REJECTED`

### Notices
- notices are created and managed by admins
- notices are shown to students through the UI
- notices are stored through API and database support

### Email Notifications
- optional issue resolution email notifications
- powered by Resend

---

## Tech Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS
- **Authentication:** NextAuth with Google Provider
- **Database:** MongoDB Atlas
- **Email:** Resend
- **Hosting:** Vercel

---

## Project Structure

```text
src/
  app/
    (public)/              Public and shared pages
    (app)/                 Authenticated flows
    api/
      issues/              Issue APIs
      notices/             Notice APIs
  components/              Reusable UI components
  lib/                     Shared utilities and configuration

public/                    Static assets
```

---

## Main Routes

### Public / Shared
- `/` — landing page
- `/login` — sign-in page
- `/issues` — shared issues page
- `/issues/[id]` — issue detail page

### Setup Flow
- `/setup/role` — role selection
- `/setup/section` — issue creation setup
- `/setup/location` — location setup

### Student
- `/my-issues` — personal issue history

### Tech / Staff
- `/tech/assigned` — assigned issues queue
- `/tech/completed` — completed issues history

### Admin
- `/admin/board` — admin board
- `/admin/notices` — notices management

---

## Data Model Summary

Each issue can include fields such as:

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

## API Overview

### `/api/issues`
- `GET` — fetch recent issues
- `POST` — create a new issue

### `/api/issues/[id]`
- `GET` — fetch a single issue
- `PATCH` — update issue data

### `/api/notices`
- notice creation and management routes

### Supported patch actions
- update `status`
- update `reviewState`
- add `commentText`
- `toggleUpvote`
- store `voterId`

### Behavior
- `resolvedAt` is set when an issue becomes `RESOLVED`
- `resolvedAt` is cleared when an issue is reopened
- comments and upvotes are stored persistently

---

## Shared UI Components

To keep the app visually consistent, IssueDesk uses shared components such as:

- `StatusBadge`
- `ReviewStateBadge`
- `PageHeader`

These components help maintain:
- consistent issue status display
- consistent review state display
- cleaner page headers and subtitles
- a more uniform interface across roles

---

## Local Development Setup

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

Add the following values:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

MONGODB_URI=your_mongodb_connection_string_here
```

### 4. Optional email support

```env
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 5. Run locally

```bash
npm run dev
```

### 6. Build before production push

```bash
npm run build
```

---

## Environment Variables

### Required
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGODB_URI`

### Optional
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

---

## Deployment

IssueDesk is deployed on **Vercel**.

**Production URL:** https://issuedesk-ten.vercel.app

### Production environment variables
Set these in Vercel before deploying:

#### Required
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGODB_URI`

#### Optional
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Make sure `NEXTAUTH_URL` matches the deployed domain.

---

## Recommended Test Flow

### Student Flow
- sign in with Google
- create a new issue
- open the issue detail page
- add a comment
- upvote an issue
- check `My Issues`
- verify notices popup

### Tech / Staff Flow
- sign in
- open assigned queue
- move an issue from `OPEN` to `IN_PROGRESS`
- mark it as `RESOLVED`
- reopen it if needed
- check completed history

### Admin Flow
- sign in
- review issues in admin board
- assign an issue
- reject an issue
- reset review state
- manage notices
- review resolved history

---

## Current MVP Status

IssueDesk currently includes:

- Google sign-in
- role-based routing
- MongoDB-backed issue creation
- persistent comments
- persistent upvotes
- MongoDB-backed notices
- staff assigned queue and completed history
- admin review board and notice management
- resolved issue history support
- shared UI components
- optional email notification support

The project is currently focused on stable MVP functionality with targeted improvements and UI cleanup.

---

## Planned Improvements

- better mobile responsiveness
- toggleable sidebar
- stronger route protection
- improved email and notification flow
---

## Author

Built and maintained by **Purvi**.

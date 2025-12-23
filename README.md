# AppTracker - Job Application & Internship Tracker

## 🎯 Project Overview

A full-stack application for tracking job applications with React frontend, Spring Boot backend, PostgreSQL database, and Cloudflare R2 for file storage.

## ✅ What's Been Implemented

### Backend (100% Complete)

#### Database Schema

- ✅ Complete PostgreSQL schema with 8 tables
- ✅ Users, applications, notes, contacts, reminders, attachments, activity
- ✅ Proper indexes, foreign keys, and enums
- ✅ Flyway migration ready

#### Domain Models

- ✅ All JPA entities with proper annotations
- ✅ UUID primary keys
- ✅ Timestamp tracking
- ✅ Enums for status, priority, activity types

#### Repositories

- ✅ JPA repositories for all entities
- ✅ Custom queries with Specification API
- ✅ Pagination and sorting support

#### Services

- ✅ ApplicationService - CRUD, filtering, status updates
- ✅ NoteService, ContactService, ReminderService
- ✅ AttachmentService with R2 presigned URLs
- ✅ ActivityService for audit logging
- ✅ R2StorageService for file operations

#### Controllers

- ✅ AuthController - register, login, /me
- ✅ ApplicationController - Full REST API with nested resources
- ✅ UtilityController - reminders, downloads
- ✅ AnalyticsController - stats and metrics
- ✅ CORS configured
- ✅ JWT authentication on all protected routes

#### Security

- ✅ Spring Security with JWT
- ✅ JwtAuthFilter for token validation
- ✅ User ownership checks
- ✅ BCrypt password hashing
- ✅ 401 handling

#### File Storage (Cloudflare R2)

- ✅ AWS SDK S3 client configured
- ✅ Presigned PUT URLs (15 min expiry)
- ✅ Presigned GET URLs (5 min expiry)
- ✅ File type validation
- ✅ Size limits (10 MB)
- ✅ Safe object key generation

### Frontend (60% Complete)

#### Core Infrastructure

- ✅ React 18 with TypeScript
- ✅ React Router v6
- ✅ TanStack React Query for server state
- ✅ Axios API client with interceptors
- ✅ Tailwind CSS configured
- ✅ All dependencies installed

#### Authentication

- ✅ AuthContext with React Context API
- ✅ Protected routes (RequireAuth)
- ✅ Login page (styling needs update)
- ✅ Signup page (styling needs update)
- ✅ Token management
- ✅ 401 redirect handling

#### API Client

- ✅ Comprehensive typed API client
- ✅ All endpoints defined
- ✅ Auth, Applications, Notes, Contacts, Reminders, Attachments, Activity, Analytics APIs
- ✅ Request/response interceptors

#### Pages Created

- ✅ Dashboard (with stats, reminders, recent apps)
- ✅ Applications list (not yet integrated - file exists from before)
- ⚠️ Login/Signup (need styling updates)
- ❌ ApplicationDetail
- ❌ NewApplication
- ❌ Board (Kanban)
- ❌ Analytics

#### Components Created

- ✅ Nav component with navigation and logout
- ❌ ApplicationForm
- ❌ FileUploader
- ❌ StatusBadge
- ❌ ApplicationCard

## 📋 Still Need to Create

### Critical Frontend Pages

1. **NewApplication.tsx** - Form to create new application
2. **ApplicationDetail.tsx** - View/edit application with notes, contacts, reminders, attachments
3. **Board.tsx** - Kanban board with drag-and-drop (@dnd-kit)
4. **Analytics.tsx** - Charts and metrics (recharts)

### Critical Components

1. **ApplicationForm.tsx** - Reusable form component
2. **FileUploader.tsx** - Handle R2 presign→upload→confirm flow
3. **StatusBadge.tsx** - Color-coded status badges
4. **ApplicationCard.tsx** - Card for board view

### Integration Tasks

1. Update Login.tsx styling to match new design
2. Update Signup.tsx styling to match new design
3. Replace existing Applications.tsx with new version
4. Update App.tsx to use AuthProvider and new routes
5. Update main.tsx to use new App component

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 14+
- Cloudflare R2 account (for file storage)

### Backend Setup

1. Create PostgreSQL database:

```sql
CREATE DATABASE apptracker;
```

2. Set environment variables (create `backend/env-dev.ps1`):

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/apptracker"
$env:DATABASE_USER="postgres"
$env:DATABASE_PASSWORD="your_password"
$env:JWT_SECRET="your-jwt-secret-key-change-in-production"
$env:R2_ACCOUNT_ID="your-account-id"
$env:R2_ACCESS_KEY_ID="your-access-key"
$env:R2_SECRET_ACCESS_KEY="your-secret-key"
$env:R2_BUCKET="apptracker-files"
$env:R2_ENDPOINT="https://[ACCOUNT_ID].r2.cloudflarestorage.com"
```

3. Run backend:

```powershell
cd backend
./env-dev.ps1
mvn spring-boot:run
```

Backend will start on http://localhost:8080

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create `.env`:

```
VITE_API_URL=http://localhost:8080
```

3. Run frontend:

```bash
npm run dev
```

Frontend will start on http://localhost:5173

## 🔧 Completing the Project

### Step 1: Fix Login/Signup Pages

Replace the old Login.tsx and Signup.tsx with the new styled versions that use AuthContext.

### Step 2: Update Main Files

1. Replace `App.tsx` with `App-new.tsx` content
2. Update `main.tsx` to wrap App with AuthProvider and QueryClientProvider
3. Replace `components/Nav.tsx` with `components/Nav-new.tsx`

### Step 3: Create Missing Pages

Create these pages following the patterns in Dashboard.tsx:

**NewApplication.tsx:**

- Form with all application fields
- useNavigate to redirect after creation
- useMutation for API call

**ApplicationDetail.tsx:**

- Fetch application data with useQuery
- Tabs for: Details, Notes, Contacts, Reminders, Attachments, Activity
- Edit mode toggle
- Delete button

**Board.tsx:**

- Use @dnd-kit for drag-and-drop
- Columns for each status
- Cards draggable between columns
- Update status on drop

**Analytics.tsx:**

- Use recharts for visualization
- Line chart for apps per week
- Pie chart for status distribution
- Conversion funnel
- Stats cards

### Step 4: Create Missing Components

**FileUploader.tsx:**

- File input with drag-drop
- Call presign API
- Upload to R2 using presigned URL
- Call confirm API
- Show progress

**ApplicationForm.tsx:**

- Reusable form for create/edit
- All fields with validation
- Priority and status selects
- Date picker for dateApplied

### Step 5: Testing

1. Register a new user
2. Create applications
3. Test all CRUD operations
4. Test file upload
5. Test reminders
6. Test analytics

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Applications

- `GET /api/apps` - List applications (with filters)
- `POST /api/apps` - Create application
- `GET /api/apps/{id}` - Get application
- `PUT /api/apps/{id}` - Update application
- `DELETE /api/apps/{id}` - Delete application
- `PATCH /api/apps/{id}/status` - Update status

### Nested Resources

- `/api/apps/{id}/notes` - GET, POST
- `/api/apps/{id}/contacts` - GET, POST
- `/api/apps/{id}/reminders` - GET, POST
- `/api/apps/{id}/attachments` - GET
- `/api/apps/{id}/attachments/presign` - POST
- `/api/apps/{id}/attachments/confirm` - POST
- `/api/apps/{id}/activity` - GET

### Utilities

- `GET /api/reminders/due?days=7` - Get due reminders
- `PATCH /api/reminders/{id}/complete` - Complete reminder
- `GET /api/attachments/{id}/download-url` - Get download URL

### Analytics

- `GET /api/analytics` - Get all analytics

## 🎨 Design System

### Colors

- Primary: `#3B82F6` (blue-600)
- Success: `#10B981` (green-500)
- Warning: `#F59E0B` (yellow-500)
- Danger: `#EF4444` (red-500)

### Status Colors

- SAVED: Gray
- APPLIED: Blue
- OA: Purple
- INTERVIEW: Orange
- OFFER: Green
- REJECTED: Red

### Priority Colors

- LOW: Gray
- MEDIUM: Yellow
- HIGH: Red

## 📦 Deployment

### Render Deployment

**Backend (Web Service):**

- Build: `mvn clean package`
- Start: `java -jar target/apptracker-backend-0.1.0.jar`
- Add environment variables

**Database:**

- Use Render PostgreSQL add-on

**Frontend (Static Site):**

- Build: `npm run build`
- Publish: `dist`
- Set VITE_API_URL to backend URL

## 🛠️ Tech Stack

**Backend:**

- Java 17
- Spring Boot 3.1.0
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Flyway
- AWS SDK (R2)

**Frontend:**

- React 18
- TypeScript
- Vite
- React Router v6
- TanStack React Query
- Axios
- Tailwind CSS
- @dnd-kit
- Recharts
- Lucide React
- date-fns

## 📝 Development Notes

### File Upload Flow

1. Frontend calls `/api/apps/{id}/attachments/presign` with file metadata
2. Backend generates presigned PUT URL from R2
3. Frontend uploads file directly to R2 using presigned URL
4. Frontend calls `/api/apps/{id}/attachments/confirm` with file metadata
5. Backend saves attachment record and logs activity

### Security

- All API endpoints except auth are protected
- JWT tokens expire in 7 days
- User can only access their own data
- File uploads validated for type and size

### Database Migrations

- Flyway automatically runs V1\_\_init.sql on startup
- Schema includes all tables, indexes, and constraints

## 🎯 Project Status

**Backend:** ✅ 100% Complete (Production Ready)
**Frontend:** ⚠️ 60% Complete (Core infrastructure done, pages need completion)

**Estimated Time to Complete:** 4-6 hours for remaining frontend work

## 📧 Support

For questions or issues, refer to:

- `IMPLEMENTATION_STATUS.md` for detailed implementation notes
- Backend README at `backend/README-backend.md`
- Frontend README at `frontend/README-frontend.md`

---

**Last Updated:** December 2024

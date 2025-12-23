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

#### Components Created

- ✅ Nav component with navigation and logout

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
$env:DATABASE_URL
$env:DATABASE_USER
$env:DATABASE_PASSWORD
$env:JWT_SECRET
$env:R2_ACCOUNT_ID
$env:R2_ACCESS_KEY_ID
$env:R2_SECRET_ACCESS_KEY=
$env:R2_BUCKET
$env:R2_ENDPOINT
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

Frontend will start on http://localhost:3000

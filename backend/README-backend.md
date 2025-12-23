# AppTracker Backend

This is a starter Spring Boot backend for AppTracker.

Quick start (with Maven)

- Ensure Java 17 is installed.
- Provide environment variables (for dev you can use H2 in-memory):
  - `JWT_SECRET` - required for JWT signing
  - `DATABASE_URL` (optional) - Postgres JDBC URL, otherwise H2 in-memory is used

Run locally:

```powershell
cd C:\Users\abhih\AppTracker\backend
mvn spring-boot:run
```

Endpoints implemented in this scaffold:

- `POST /api/auth/register` -> {name,email,password}
- `POST /api/auth/login` -> {email,password}
- `GET /api/me` (not implemented yet)
- `GET /api/apps` (list user's apps)
- `POST /api/apps` (create app)

Next steps:

- Add notes/contacts/reminders/attachments entities and controllers
- Implement R2 presign/storage service
- Add tests

# OAuth2 Quick Reference

## 🚀 Quick Start

1. **Register Apps** (Get Client IDs & Secrets)

   - Google: https://console.cloud.google.com/
   - GitHub: https://github.com/settings/developers

2. **Set Environment Variables**

   ```powershell
   $env:GOOGLE_CLIENT_ID = "xxx.apps.googleusercontent.com"
   $env:GOOGLE_CLIENT_SECRET = "xxx"
   $env:GITHUB_CLIENT_ID = "xxx"
   $env:GITHUB_CLIENT_SECRET = "xxx"
   ```

3. **Run Migration**

   ```bash
   mvn flyway:migrate
   ```

4. **Start App**
   ```bash
   cd backend && mvn spring-boot:run
   cd frontend && npm run dev
   ```

## 📍 Important URLs

### Development

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Google OAuth**: http://localhost:8080/oauth2/authorization/google
- **GitHub OAuth**: http://localhost:8080/oauth2/authorization/github

### Redirect URIs (Configure in Provider)

- **Google**: `http://localhost:8080/login/oauth2/code/google`
- **GitHub**: `http://localhost:8080/login/oauth2/code/github`

## 🔑 Key Concepts

### OAuth2 Flow

```
Frontend → Backend → Provider → Backend → Frontend
  (1)       (2)        (3)        (4)       (5)
```

1. User clicks OAuth button
2. Backend redirects to provider
3. User logs in at provider
4. Provider redirects back with code
5. Backend exchanges code → creates user → generates JWT → redirects to frontend

### User Types

- **Email/Password User**: Has `password_hash`, no `oauth_provider`
- **OAuth2 User**: No `password_hash`, has `oauth_provider` (google/github)
- **Hybrid User**: Has both (linked accounts)

## 📁 Files Modified

### Backend

```
src/main/
├── java/com/apptracker/
│   ├── service/OAuth2Service.java          [NEW]
│   ├── security/OAuth2SuccessHandler.java  [NEW]
│   ├── config/SecurityConfig.java          [MODIFIED]
│   └── model/User.java                     [MODIFIED]
└── resources/
    ├── application.yml                     [MODIFIED]
    └── db/migration/
        └── V2__add_oauth2_support.sql      [NEW]
```

### Frontend

```
src/
├── pages/
│   ├── OAuth2Redirect.tsx                  [NEW]
│   └── Login.tsx                           [MODIFIED]
└── App.tsx                                 [MODIFIED]
```

## 🧪 Testing Checklist

- [ ] Google Login works
- [ ] GitHub Login works
- [ ] JWT token stored in localStorage
- [ ] User redirected to dashboard
- [ ] Database shows `oauth_provider` = 'google' or 'github'
- [ ] Existing users can link OAuth accounts
- [ ] Email/password login still works

## 🔧 Troubleshooting

| Error                   | Solution                                         |
| ----------------------- | ------------------------------------------------ |
| `redirect_uri_mismatch` | Check redirect URI in provider settings          |
| `CORS error`            | Verify `corsConfigurationSource()` allows origin |
| `Invalid credentials`   | Check environment variables                      |
| `User not found`        | Check `OAuth2Service.findOrCreateUser()`         |

## 📊 Database Schema

```sql
-- User table with OAuth2 support
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),        -- NULL for OAuth2 users
    oauth_provider VARCHAR(50),        -- 'google', 'github', etc.
    oauth_id VARCHAR(255),             -- Provider's user ID
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## 💡 Pro Tips

1. **Production Setup**: Change redirect URIs to production URLs
2. **Security**: Keep client secrets in environment variables (never commit)
3. **Testing**: Use incognito mode to test different OAuth accounts
4. **Debugging**: Check browser Network tab for OAuth redirects
5. **Mixed Auth**: Users can have BOTH email/password AND OAuth2

---

For full details, see [OAUTH2_IMPLEMENTATION_GUIDE.md](OAUTH2_IMPLEMENTATION_GUIDE.md)

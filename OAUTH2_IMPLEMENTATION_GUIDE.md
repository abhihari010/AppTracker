# OAuth2 Implementation Guide (Google & GitHub)

## 🎯 Overview

This guide explains how OAuth2 authentication works in AppTracker and how to set it up.

## 🔄 OAuth2 Flow Explained

```
1. User clicks "Sign in with Google/GitHub"
   ↓
2. Frontend redirects to: http://localhost:8080/oauth2/authorization/{provider}
   ↓
3. Backend redirects to provider's login page (Google/GitHub)
   ↓
4. User enters credentials and approves
   ↓
5. Provider redirects to: http://localhost:8080/login/oauth2/code/{provider}
   ↓
6. Backend exchanges authorization code for access token
   ↓
7. Backend calls OAuth2Service.loadUser() to get user info
   ↓
8. Backend creates/finds user in database
   ↓
9. OAuth2SuccessHandler generates JWT token
   ↓
10. Backend redirects to: http://localhost:3000/oauth2/redirect?token=xxx
   ↓
11. Frontend stores JWT and redirects to dashboard
```

## 📋 Setup Steps

### 1. Register OAuth2 Applications

#### **Google Cloud Console**

1. Visit: https://console.cloud.google.com/
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:8080/login/oauth2/code/google`
5. Save Client ID and Client Secret

#### **GitHub Developer Settings**

1. Visit: https://github.com/settings/developers
2. New OAuth App
3. Homepage: `http://localhost:3000`
4. Callback: `http://localhost:8080/login/oauth2/code/github`
5. Save Client ID and Client Secret

### 2. Set Environment Variables

Add to your `env-dev.ps1` or `.env` file:

```powershell
# Google OAuth2
$env:GOOGLE_CLIENT_ID = "your-google-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"

# GitHub OAuth2
$env:GITHUB_CLIENT_ID = "your-github-client-id"
$env:GITHUB_CLIENT_SECRET = "your-github-client-secret"
```

### 3. Run Database Migration

The migration file `V2__add_oauth2_support.sql` has been created. Run:

```bash
mvn flyway:migrate
```

This adds:

- `oauth_provider` column (VARCHAR)
- `oauth_id` column (VARCHAR)
- Makes `password_hash` optional
- Adds index for faster lookups

### 4. Start Backend

```powershell
cd backend
.\env-dev.ps1  # Load environment variables
mvn spring-boot:run
```

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

## 🏗️ Architecture

### Backend Components

**1. OAuth2Service.java**

- Extends `DefaultOAuth2UserService`
- Called after successful OAuth2 authentication
- Extracts user info from Google/GitHub
- Creates or finds user in database
- Returns OAuth2User for Spring Security

**2. OAuth2SuccessHandler.java**

- Handles successful OAuth2 login
- Generates JWT token for user
- Redirects to frontend with token in URL

**3. SecurityConfig.java**

- Configures OAuth2 login endpoints
- Permits `/oauth2/**` and `/login/oauth2/**`
- Registers custom OAuth2Service and SuccessHandler
- Maintains stateless JWT authentication

**4. Database (V2 Migration)**

- Adds OAuth provider tracking
- Makes password optional
- Supports mixed auth (email/password + OAuth2)

### Frontend Components

**1. Login.tsx**

- Added OAuth2 buttons (Google & GitHub)
- `handleOAuth2Login()` redirects to backend
- Shows beautiful branded buttons

**2. OAuth2Redirect.tsx**

- Receives JWT token from backend
- Stores token in AuthContext
- Redirects to dashboard

**3. App.tsx**

- Added route: `/oauth2/redirect`
- Handles OAuth2 callback

## 🔐 Security Features

1. **CSRF Protection**: Disabled for stateless JWT
2. **CORS**: Configured to allow frontend origin
3. **JWT Tokens**: Secure, signed, 24-hour expiry
4. **Email Verification**: OAuth2 users auto-verified
5. **Password Optional**: OAuth2 users don't need passwords

## 📝 Key Files Created/Modified

### Backend

- ✅ `OAuth2Service.java` - User loading from providers
- ✅ `OAuth2SuccessHandler.java` - JWT generation
- ✅ `SecurityConfig.java` - OAuth2 configuration
- ✅ `application.yml` - Provider credentials
- ✅ `V2__add_oauth2_support.sql` - Database schema

### Frontend

- ✅ `OAuth2Redirect.tsx` - Token handler
- ✅ `Login.tsx` - OAuth2 buttons
- ✅ `App.tsx` - OAuth2 route

## 🧪 Testing

### Test Google Login

1. Click "Sign in with Google"
2. Select Google account
3. Approve permissions
4. Should redirect to dashboard with JWT

### Test GitHub Login

1. Click "Sign in with GitHub"
2. Enter GitHub credentials
3. Authorize app
4. Should redirect to dashboard with JWT

### Check Database

```sql
SELECT id, email, name, oauth_provider, oauth_id
FROM users
WHERE oauth_provider IS NOT NULL;
```

## 🚨 Common Issues

**1. "redirect_uri_mismatch"**

- Solution: Ensure redirect URIs match exactly in provider settings
- Google: `http://localhost:8080/login/oauth2/code/google`
- GitHub: `http://localhost:8080/login/oauth2/code/github`

**2. "CORS Error"**

- Solution: Check `corsConfigurationSource()` allows `http://localhost:3000`

**3. "User already exists"**

- Solution: Normal! OAuth2 finds existing user by email

**4. "Invalid client credentials"**

- Solution: Double-check `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.

## 🔄 Mixing Authentication Methods

Users can have BOTH:

- Email/password login
- OAuth2 login (Google/GitHub)

Same email = same account. User table tracks:

- `email` - Unique identifier
- `password_hash` - NULL for OAuth2-only users
- `oauth_provider` - "google" or "github" or NULL
- `oauth_id` - Provider's user ID

## 🎨 Customization

### Add More Providers

1. Add to `application.yml`:

```yaml
microsoft:
  client-id: ${MICROSOFT_CLIENT_ID}
  client-secret: ${MICROSOFT_CLIENT_SECRET}
```

2. Update `OAuth2Service.java` to handle provider-specific attributes

3. Add button to `Login.tsx`

### Change JWT Expiry

In `OAuth2SuccessHandler.java`:

```java
Date expiryDate = new Date(now.getTime() + 604800000); // 7 days
```

### Customize Redirect URL

In `OAuth2SuccessHandler.java`:

```java
String redirectUrl = UriComponentsBuilder
    .fromUriString(frontendUrl + "/custom-redirect")
    .queryParam("token", token)
    .build()
    .toUriString();
```

## 📚 Additional Resources

- [Spring Security OAuth2 Docs](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html)
- [Google OAuth2 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth2 Guide](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

## ✅ Summary

You now have:

- ✅ Google OAuth2 login
- ✅ GitHub OAuth2 login
- ✅ JWT token generation
- ✅ User auto-registration
- ✅ Mixed authentication support
- ✅ Beautiful UI with branded buttons
- ✅ Secure, production-ready implementation

Happy coding! 🚀

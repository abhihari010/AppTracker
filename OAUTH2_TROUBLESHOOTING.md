# OAuth2 Troubleshooting Guide

## Common Issues and Solutions

### 500 Internal Server Error when signing in with GitHub

#### 1. Check GitHub OAuth App Configuration

Make sure you've created a GitHub OAuth App and configured it correctly:

1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in the details:
   - **Application name**: Your app name (e.g., "AppTracker")
   - **Homepage URL**: `http://localhost:3000` (for development)
   - **Authorization callback URL**: `http://localhost:8080/login/oauth2/code/github`
3. After creating the app, copy the **Client ID** and generate a **Client Secret**

#### 2. Set Environment Variables

Make sure your `.env` file (in the `backend/` directory) has:

```env
# GitHub OAuth2
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Google OAuth2 (if using)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### 3. Load Environment Variables

Before running the backend, load the environment variables:

```powershell
cd backend
.\env-dev.ps1
mvn spring-boot:run
```

#### 4. Check Backend Logs

With the updated logging, you should see detailed logs like:

```
OAuth2 login attempt - Provider: github, Email: null, Name: YourName
GitHub user has private email. Using fallback: username@users.noreply.github.com
Finding or creating user with email: username@users.noreply.github.com
```

If you see errors, they will be more descriptive now.

### GitHub Email Privacy Issue

If you have "Keep my email addresses private" enabled in GitHub:

- GitHub will **not** provide your email in the OAuth2 response
- The app now automatically creates a fallback email: `username@users.noreply.github.com`
- This is a **normal behavior** and fully supported

### Google OAuth Setup

For Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure OAuth consent screen if prompted
6. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Authorized redirect URIs**: `http://localhost:8080/login/oauth2/code/google`
7. Copy the Client ID and Client Secret to your `.env` file

### Testing OAuth2 Login

1. Make sure backend is running: `mvn spring-boot:run`
2. Make sure frontend is running: `npm run dev`
3. Go to `http://localhost:3000/login`
4. Click "Sign in with GitHub" or "Sign in with Google"
5. You should be redirected to the provider's authorization page
6. After authorizing, you'll be redirected back to your app with a JWT token

### Still Getting Errors?

Check the backend console output. With the enhanced logging, you should see:

- What provider was used (google/github)
- What email was extracted (or fallback email used)
- Whether the user was found or created
- Any errors during the process

Common errors and solutions:

- **"User not found after OAuth2 login"**: The OAuth2Service didn't create the user properly. Check database connectivity.
- **"Invalid redirect URI"**: The callback URL in your OAuth app settings doesn't match `{baseUrl}/login/oauth2/code/{registrationId}`
- **"Application error"**: Missing or invalid client ID/secret. Check your `.env` file.

### Database Check

Make sure your database has the OAuth2 fields:

```sql
-- Check if the oauth_provider and oauth_id columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('oauth_provider', 'oauth_id');
```

If they don't exist, run the Flyway migration:

```powershell
mvn flyway:migrate
```

## Quick Checklist

- [ ] Created GitHub OAuth App with correct callback URL
- [ ] Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`
- [ ] Ran `.\env-dev.ps1` to load environment variables
- [ ] Backend is running (`mvn spring-boot:run`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database has OAuth2 columns (run `mvn flyway:migrate` if needed)
- [ ] Checked backend console for detailed error logs

# Forgot Password Implementation Guide

## Overview

Complete forgot password functionality with secure token-based password reset.

## Backend Components

### 1. Database Migration (V3\_\_add_password_reset_tokens.sql)

- New `password_reset_tokens` table with:
  - Unique secure tokens
  - 24-hour expiration
  - Used flag to prevent token reuse
  - Indexed for performance

### 2. Models & Repositories

- **PasswordResetToken**: JPA entity for password reset tokens
- **PasswordResetTokenRepository**: Query methods for token management

### 3. DTOs

- **ForgotPasswordRequest**: Email input for password reset request
- **ResetPasswordRequest**: Token and new password for reset

### 4. ForgotPasswordController

Three endpoints:

#### POST /api/forgot-password/request

```json
Request: { "email": "user@example.com" }
Response: { "message": "If an account exists..." }
```

- Generates secure 32-byte token
- Stores token with 24-hour expiration
- Sends HTML email with reset link
- Returns generic response (doesn't reveal if email exists)

#### POST /api/forgot-password/reset

```json
Request: { "token": "...", "newPassword": "..." }
Response: { "message": "Password reset successfully" }
```

- Validates token exists and isn't expired
- Checks token hasn't been used
- Updates user password (hashed)
- Marks token as used

#### GET /api/forgot-password/validate/{token}

```json
Response: { "valid": true/false, "message": "..." }
```

- Used by frontend to validate token before showing form
- Checks expiration and usage status

### 5. EmailNotificationService Updates

- New `sendEmail(to, subject, htmlContent)` method
- Supports HTML emails with MIME messages
- Integrated password reset email template
- Consistent styling with reminder emails

## Frontend Components

### 1. ForgotPassword Page (/forgot-password)

- Email input form
- Sends POST request to initiate reset
- Success screen confirming email sent
- Link back to login

### 2. ResetPassword Page (/reset-password)

- URL token parameter: `?token=...`
- Auto-validates token on load
- Password input with live validation:
  - Minimum 8 characters
  - Password match confirmation
- Real-time feedback
- Success confirmation with redirect to login

### 3. Login Page Updates

- Added "Forgot password?" link
- Styled consistently with existing design

### 4. App Routes

- `/forgot-password` - Request password reset
- `/reset-password?token=...` - Reset password

## Security Features

✅ **Secure Token Generation**: 32-byte random tokens with Base64 URL encoding
✅ **Token Expiration**: 24-hour expiration window
✅ **One-Time Use**: Tokens marked as used after successful reset
✅ **Password Hashing**: BCrypt for new passwords
✅ **No Email Leakage**: Generic success messages (don't reveal if email exists)
✅ **HTTPS Ready**: Frontend uses secure links (update domain in ForgotPasswordController)
✅ **Email Validation**: Reset link includes token verification

## Email Template

- Professional HTML formatting
- User personalization
- Clear expiration notice
- Fallback text link
- Brand consistent styling

## Configuration Required

In `application.yml`, ensure mail is configured:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${SUPPORT_EMAIL}
    password: ${SUPPORT_EMAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

## Frontend URL Configuration

Update in ForgotPasswordController.java (line ~123):

```java
String resetLink = String.format("http://localhost:5173/reset-password?token=%s", token);
```

For production, change to your actual frontend URL:

```java
String resetLink = String.format("https://yourdomain.com/reset-password?token=%s", token);
```

## Testing Flow

1. **Request Reset**

   - Go to `/forgot-password`
   - Enter registered email
   - Check email for reset link (or console if using mock SMTP)

2. **Validate Token**

   - Click reset link
   - Page validates token automatically
   - Shows form if valid

3. **Reset Password**

   - Enter new password (8+ chars)
   - Confirm password
   - Submit
   - Redirected to login

4. **Login with New Password**
   - Use new credentials to log in

## Error Handling

- Invalid/expired tokens: Clear error message
- Reused tokens: Prevent reset with already-used token
- Password validation: Client + server validation
- Email not found: Generic response for security

## Future Enhancements

- Rate limiting on password reset requests
- Resend reset email functionality
- Password reset history/audit log
- Security questions as optional 2FA
- Recent activity notifications

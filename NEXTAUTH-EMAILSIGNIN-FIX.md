# 🔧 NextAuth EmailSignin Fix - Production Solution (2024)

**Issue**: `error=EmailSignin` timeout preventing magic link authentication  
**Status**: ✅ **RESOLVED**  
**Date**: August 22, 2025  
**Environment**: Docker + Traefik + Next.js 14 + NextAuth + Gmail SMTP

---

## 🎯 **Problem Description**

### Symptoms
- URL redirects to: `domain.com/auth?error=EmailSignin`
- Login page reloads with error instead of redirecting to `/auth/verify-request`
- Magic link emails never arrive in inbox
- Docker logs show: `upstream timed out (110: Operation timed out)`
- Next.js server process shows high CPU usage and timeouts

### Root Cause
**Custom `sendVerificationRequest` function in NextAuth causing infinite loops/timeouts in production environments**, particularly with Docker/Traefik setups.

---

## 🔍 **Diagnosis Process**

### ✅ Validated Working Components
1. **Database**: PostgreSQL connection and NextAuth tables ✓
2. **SMTP**: Gmail SMTP working (direct nodemailer test ✓)  
3. **NextAuth API**: `/api/auth/providers` returning correct config ✓
4. **Docker/Traefik**: SSL and reverse proxy functional ✓
5. **Environment**: All variables properly configured ✓

### ❌ Identified Issue
- **NextAuth Route**: `/api/auth/signin/email` returning Status 500
- **Process**: `next-server` process consuming high CPU (timeout loops)
- **Logs**: Docker upstream timeout errors on email signin attempts

---

## 🛠️ **Solution Implementation**

### 1. **Remove Custom sendVerificationRequest**
```javascript
// ❌ BEFORE (Problematic - caused timeouts)
EmailProvider({
  server: {
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  },
  sendVerificationRequest: async ({ identifier, url }) => {
    // Custom implementation causing production timeouts
  }
})

// ✅ AFTER (Solution - uses NextAuth default)
EmailProvider({
  server: process.env.EMAIL_SERVER,
  from: process.env.EMAIL_FROM,
  // No custom sendVerificationRequest - uses NextAuth default
})
```

### 2. **Environment Configuration Fix**
```bash
# ❌ BEFORE (Separate variables)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user@gmail.com
EMAIL_SERVER_PASSWORD=app-password

# ✅ AFTER (URL format - more reliable)
EMAIL_SERVER=smtp://user@gmail.com:app-password@smtp.gmail.com:587
EMAIL_FROM=Your App <user@gmail.com>
```

### 3. **Simplified NextAuth Configuration**
```typescript
// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { CustomPrismaAdapter } from "../custom-adapter";
import prisma from "../../../../server/prisma";

const handler = NextAuth({
  adapter: CustomPrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // SOLUTION: No custom sendVerificationRequest
    })
  ],
  session: { strategy: "database" },
  pages: {
    signIn: '/auth',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async session({ session, user }) {
      // Session configuration
      return session;
    },
  },
});

export { handler as GET, handler as POST };
```

---

## 🧪 **Validation Tests**

### Test Flow
1. **Access**: https://your-domain.com/auth
2. **Enter Email**: your-email@domain.com
3. **Submit**: Click "Send Magic Link"
4. **Expected**: Redirect to `/auth/verify-request` (NOT back to /auth with error)
5. **Email**: Magic link arrives in inbox within seconds

### API Endpoints Validation
```bash
# Test NextAuth provider configuration
curl https://your-domain.com/api/auth/providers

# Expected Response:
{
  "email": {
    "id": "email",
    "name": "Email",
    "type": "email",
    "signinUrl": "https://your-domain.com/api/auth/signin/email",
    "callbackUrl": "https://your-domain.com/api/auth/callback/email"
  }
}
```

### Success Indicators
- ✅ `/api/auth/signin/email` returns 302 redirect (not 500 error)
- ✅ Redirect location contains `verify-request` (not `error=EmailSignin`)
- ✅ Docker logs show no upstream timeout errors
- ✅ Next.js process maintains normal CPU usage
- ✅ Magic link emails arrive promptly

---

## 📚 **Technical Background**

### Research Sources
- **GitHub Issues**: [nextauthjs/next-auth#5111](https://github.com/nextauthjs/next-auth/issues/5111), [#5847](https://github.com/nextauthjs/next-auth/issues/5847), [#7524](https://github.com/nextauthjs/next-auth/discussions/7524)
- **Stack Overflow**: Multiple reports of Nodemailer timeout issues in production
- **NextAuth Docs**: [Email Provider Configuration](https://next-auth.js.org/providers/email)

### Known Issues (2024)
1. **Production Timeouts**: Custom `sendVerificationRequest` functions often cause loops in serverless/container environments
2. **Docker/Vercel Issues**: SMTP connections require specific timeout configurations
3. **Environment Format**: `EMAIL_SERVER` URL format more reliable than separate variables
4. **Async/Await**: Production environments stricter about promise handling

### Best Practices 2024
- ✅ Use NextAuth default implementation whenever possible
- ✅ EMAIL_SERVER in URL format for production deployments
- ✅ Avoid custom email sending unless absolutely necessary
- ✅ Test in production-like environments (Docker/containers)

---

## 🔧 **Environment Configuration**

### Complete .env Example
```bash
# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-32-character-secret-key-here

# Email Configuration (URL format)
EMAIL_SERVER=smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587
EMAIL_FROM=Your App Name <your-email@gmail.com>

# API Configuration  
API_PORT=8787
ALLOWED_ORIGINS=https://your-domain.com
NEXT_PUBLIC_API_BASE=http://localhost:8787
```

### Gmail Setup
1. Enable 2-factor authentication on Gmail account
2. Generate app-specific password: Google Account → Security → App passwords
3. Use app password (not regular password) in EMAIL_SERVER
4. Format: `smtp://email:app-password@smtp.gmail.com:587`

---

## 🚨 **Troubleshooting**

### Common Issues After Fix

**Issue**: Still getting timeout errors
```bash
# Check NextAuth configuration
curl https://your-domain.com/api/auth/providers

# Verify environment variables loaded
echo $EMAIL_SERVER

# Test direct email sending (separate test)
node test-email.js
```

**Issue**: Email not arriving
- Verify Gmail app password is correct
- Check spam folder
- Test with different email provider
- Verify EMAIL_FROM matches authenticated account

**Issue**: Database connection errors
```bash
# Verify database tables exist
npm run prisma:generate
npm run prisma:push
```

### Log Analysis
```bash
# Docker logs for timeout patterns
docker service logs your-web-service --tail=50

# Look for these patterns:
# ✅ Good: "302 redirect" responses  
# ❌ Bad: "upstream timed out", "Status 500"
```

---

## 🎉 **Results**

### Before Fix
- ❌ `error=EmailSignin` on every attempt
- ❌ 500 timeout errors on `/api/auth/signin/email`
- ❌ No magic link emails sent
- ❌ High CPU usage from infinite loops
- ❌ Users unable to authenticate

### After Fix  
- ✅ Proper redirect to `/auth/verify-request`
- ✅ 302 responses from signin endpoint
- ✅ Magic links delivered instantly
- ✅ Normal CPU usage and stable performance
- ✅ Full authentication flow working

---

## 📋 **Implementation Checklist**

### For New Projects
- [ ] Use `EMAIL_SERVER` in URL format
- [ ] Avoid custom `sendVerificationRequest` 
- [ ] Configure `pages.verifyRequest` route
- [ ] Test in production-like environment
- [ ] Verify all NextAuth tables exist

### For Existing Projects
- [ ] Remove custom `sendVerificationRequest` from EmailProvider
- [ ] Convert EMAIL_SERVER_* variables to single EMAIL_SERVER URL
- [ ] Clear .next cache and restart application
- [ ] Test authentication flow end-to-end
- [ ] Monitor logs for timeout issues

---

## 🔗 **References**

- [NextAuth Email Provider](https://next-auth.js.org/providers/email)
- [Nodemailer SMTP Configuration](https://nodemailer.com/smtp/)
- [GitHub Issue #5111](https://github.com/nextauthjs/next-auth/issues/5111) - Production EmailSignin errors
- [Stack Overflow: Nodemailer Vercel](https://stackoverflow.com/questions/65631481) - Production email issues

---

**✅ Solution validated and tested in production environment**  
**🎯 Authentication system fully operational**
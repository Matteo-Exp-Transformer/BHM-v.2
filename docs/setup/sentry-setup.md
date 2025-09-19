# 🔍 Sentry Setup Guide

This guide will help you set up Sentry error monitoring for the HACCP Business Manager project.

## 📋 Prerequisites

- A Sentry account (free tier available)
- Access to the project repository
- Environment variables configured

## 🚀 Setup Steps

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and create an account
2. Create a new project:
   - Platform: **React**
   - Project Name: `haccp-business-manager`
   - Team: Choose your team or create one

### 2. Get Your DSN

1. In your Sentry project dashboard, go to **Settings** → **Projects** → **Your Project** → **Client Keys (DSN)**
2. Copy the DSN (it looks like: `https://abc123@o123456.ingest.sentry.io/123456`)

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Sentry Error Monitoring
VITE_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id

# Sentry Build Configuration (for source maps)
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 4. Get Build Configuration (Optional)

For source maps and better error tracking:

1. Go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Create a new token with `project:releases` scope
3. Get your organization slug from **Settings** → **General** → **Organization Slug**
4. Your project slug is in the URL: `sentry.io/organizations/ORG/projects/PROJECT/`

### 5. Test the Integration

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. Check the browser console for Sentry initialization messages
4. Go to your Sentry project dashboard to see if events are being received

## 🔧 Configuration Details

### Features Enabled

- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Track page load times and API calls
- **Session Replay**: Record user sessions for debugging (10% sample rate)
- **Source Maps**: Better stack traces in production builds

### Environment-Specific Settings

- **Development**: Full error tracking and replay
- **Production**: 10% sampling for performance, 1% for replay
- **Staging**: 50% sampling for testing

## 📊 Monitoring Features

### Error Tracking

- Automatic JavaScript error capture
- Unhandled promise rejections
- Network request failures
- Custom error reporting

### Performance Monitoring

- Page load performance
- API call timing
- User interaction tracking
- Core Web Vitals monitoring

### Session Replay

- User session recordings
- Console logs and network requests
- Privacy-focused (no sensitive data capture)

## 🛠️ Usage in Code

### Basic Error Reporting

```typescript
import { Sentry } from '@/lib/sentry'

// Report an error
Sentry.captureException(new Error('Something went wrong'))

// Add context
Sentry.setContext('user', { id: '123', role: 'admin' })

// Add breadcrumb
Sentry.addBreadcrumb({
  message: 'User performed action',
  level: 'info',
  category: 'user-action',
})
```

### React Error Boundaries

```typescript
import { ErrorBoundary } from '@sentry/react'

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <YourComponent />
    </ErrorBoundary>
  )
}
```

## 🔒 Privacy & Security

### Data Protection

- No sensitive data is captured by default
- User input is masked in session replays
- PII (Personally Identifiable Information) is filtered out

### GDPR Compliance

- Users can opt out of tracking
- Data retention policies are configurable
- Right to deletion is supported

## 📈 Dashboard & Alerts

### Key Metrics to Monitor

- Error rate and frequency
- Performance metrics (LCP, FID, CLS)
- User session health
- API response times

### Setting Up Alerts

1. Go to **Alerts** → **Create Alert Rule**
2. Set conditions (e.g., error rate > 5%)
3. Configure notification channels (email, Slack, etc.)
4. Set up escalation policies

## 🚨 Troubleshooting

### Common Issues

**Sentry not initializing:**

- Check that `VITE_SENTRY_DSN` is set correctly
- Verify the DSN format is valid
- Check browser console for initialization errors

**No events appearing:**

- Ensure the DSN is correct
- Check network connectivity
- Verify the project is active in Sentry

**Source maps not working:**

- Verify `SENTRY_AUTH_TOKEN` has correct permissions
- Check that `SENTRY_ORG` and `SENTRY_PROJECT` are correct
- Ensure the build process completes successfully

### Debug Mode

Enable debug mode by adding to your `.env.local`:

```env
VITE_SENTRY_DEBUG=true
```

This will log Sentry operations to the console.

## 📚 Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Session Replay](https://docs.sentry.io/product/session-replay/)
- [Sentry Privacy Policy](https://sentry.io/privacy/)

## ✅ Verification Checklist

- [ ] Sentry account created
- [ ] Project created in Sentry
- [ ] DSN added to environment variables
- [ ] App initializes without errors
- [ ] Test error appears in Sentry dashboard
- [ ] Performance monitoring is active
- [ ] Alerts configured (optional)
- [ ] Team members have access (optional)

---

**Note:** Sentry is essential for production monitoring and debugging. Make sure to set it up before deploying to production environments.

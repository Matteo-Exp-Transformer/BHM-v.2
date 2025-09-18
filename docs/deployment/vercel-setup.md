# Vercel Deployment Setup Guide

This guide will help you set up Vercel for the HACCP Business Manager PWA.

## Prerequisites

- GitHub repository with the project code
- Vercel account (free tier available)
- Required service accounts (Clerk, Supabase)

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Verify your email address

## Step 2: Connect GitHub Repository

1. In Vercel dashboard, click "New Project"
2. Import your GitHub repository
3. Select the repository: `BHM-v.2`
4. Choose the root directory (leave as default)
5. Framework Preset: Select "Vite"

## Step 3: Configure Build Settings

Vercel should auto-detect the Vite configuration, but verify:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 20.x

## Step 4: Set Up Environment Variables

In the Vercel project settings, add these environment variables:

### Required Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
```

### Optional Variables

```
VITE_SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
VITE_POSTHOG_KEY=phc_your_posthog_key
VITE_PUBLIC_URL=https://your-app-domain.vercel.app
VITE_APP_ENV=production
```

## Step 5: Configure Domains

1. Go to Project Settings > Domains
2. Add your custom domain (optional)
3. Configure SSL (automatic with Vercel)

## Step 6: Set Up Environments

### Development Environment

- **Branch**: `develop` or `dev`
- **Domain**: `your-app-dev.vercel.app`
- **Environment Variables**: Use development keys

### Staging Environment

- **Branch**: `staging`
- **Domain**: `your-app-staging.vercel.app`
- **Environment Variables**: Use staging keys

### Production Environment

- **Branch**: `main`
- **Domain**: `your-app.com` (custom domain)
- **Environment Variables**: Use production keys

## Step 7: Configure Branch Protection

1. Go to Project Settings > Git
2. Enable "Production Branch Protection"
3. Set up branch protection rules:
   - Require status checks to pass
   - Require branches to be up to date
   - Restrict pushes to main branch

## Step 8: Set Up Webhooks (Optional)

For real-time updates and notifications:

1. Go to Project Settings > Functions
2. Add webhook endpoints for:
   - Clerk user events
   - Supabase real-time updates
   - Payment processing (if applicable)

## Step 9: Configure Headers

Add these headers in `vercel.json` for security:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Step 10: Test Deployment

1. Push changes to main branch
2. Verify automatic deployment
3. Test all functionality:
   - Authentication flow
   - Database connections
   - PWA features
   - Mobile responsiveness

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (should be 20.x)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables Not Working**
   - Ensure variables are prefixed with `VITE_`
   - Check for typos in variable names
   - Redeploy after adding new variables

3. **PWA Not Working**
   - Verify `vercel.json` configuration
   - Check Service Worker registration
   - Test on HTTPS (required for PWA)

### Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Community: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps

After successful deployment:

1. Set up monitoring (Sentry)
2. Configure analytics (PostHog)
3. Set up CI/CD pipeline
4. Configure custom domain
5. Set up staging environment

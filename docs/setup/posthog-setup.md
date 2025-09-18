# PostHog Analytics Setup Guide

This guide will help you set up PostHog analytics for the HACCP Business Manager PWA.

## Prerequisites

- PostHog account (free tier available)
- Vercel project deployed
- Environment variables configured

## Step 1: Create PostHog Account

1. Go to [posthog.com](https://posthog.com)
2. Sign up for a free account
3. Create a new project: "HACCP Business Manager"
4. Choose "Web" as the platform

## Step 2: Get API Keys

1. In PostHog dashboard, go to Project Settings
2. Copy the following values:
   - **Project API Key**: `phc_...`
   - **Instance URL**: Usually `https://app.posthog.com`

## Step 3: Configure Environment Variables

Add these to your Vercel environment variables:

```
VITE_POSTHOG_KEY=phc_your_project_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

## Step 4: Install PostHog SDK

```bash
npm install posthog-js
```

## Step 5: Initialize PostHog

Create `src/lib/analytics.ts`:

```typescript
import posthog from 'posthog-js'

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
    })
  }
}

export const trackEvent = (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

export const identifyUser = (
  userId: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties)
  }
}
```

## Step 6: Track Key Events

Track important HACCP-related events:

```typescript
// Temperature logging
trackEvent('temperature_logged', {
  conservation_point: 'fridge_1',
  temperature: 4.2,
  department: 'kitchen',
})

// Task completion
trackEvent('task_completed', {
  task_type: 'maintenance',
  department: 'kitchen',
  user_role: 'manager',
})

// Compliance events
trackEvent('compliance_alert', {
  alert_type: 'temperature_violation',
  severity: 'high',
  department: 'kitchen',
})
```

## Step 7: Set Up Dashboards

Create dashboards for:

- User engagement
- Task completion rates
- Temperature compliance
- Error tracking
- Performance metrics

## Step 8: Configure Privacy

1. Enable GDPR compliance
2. Set up data retention policies
3. Configure data anonymization
4. Set up user consent management

## Next Steps

- Set up custom events
- Configure funnels
- Set up alerts
- Create custom dashboards

# Resend Email Service Setup Guide

This guide will help you set up Resend for email notifications in the HACCP Business Manager PWA.

## Prerequisites

- Resend account (free tier available)
- Domain for email sending (optional but recommended)
- Vercel project deployed

## Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address
4. Complete account setup

## Step 2: Get API Key

1. In Resend dashboard, go to API Keys
2. Create a new API key
3. Copy the key: `re_...`
4. Store it securely

## Step 3: Configure Environment Variables

Add these to your Vercel environment variables:

```
RESEND_API_KEY=re_your_api_key_here
```

## Step 4: Install Resend SDK

```bash
npm install resend
```

## Step 5: Create Email Service

Create `src/lib/email.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HACCP Manager <noreply@yourdomain.com>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}
```

## Step 6: Create Email Templates

### Temperature Alert Template

```typescript
export const createTemperatureAlertEmail = (data: {
  conservationPoint: string
  temperature: number
  department: string
  timestamp: string
}) => {
  return `
    <h2>🌡️ Temperature Alert</h2>
    <p>A temperature violation has been detected:</p>
    <ul>
      <li><strong>Location:</strong> ${data.conservationPoint}</li>
      <li><strong>Temperature:</strong> ${data.temperature}°C</li>
      <li><strong>Department:</strong> ${data.department}</li>
      <li><strong>Time:</strong> ${data.timestamp}</li>
    </ul>
    <p>Please take immediate corrective action.</p>
  `
}
```

### Task Reminder Template

```typescript
export const createTaskReminderEmail = (data: {
  taskName: string
  dueDate: string
  assignedTo: string
  department: string
}) => {
  return `
    <h2>📋 Task Reminder</h2>
    <p>You have a task due soon:</p>
    <ul>
      <li><strong>Task:</strong> ${data.taskName}</li>
      <li><strong>Due:</strong> ${data.dueDate}</li>
      <li><strong>Assigned to:</strong> ${data.assignedTo}</li>
      <li><strong>Department:</strong> ${data.department}</li>
    </ul>
    <p>Please complete this task to maintain HACCP compliance.</p>
  `
}
```

## Step 7: Set Up Domain (Recommended)

1. In Resend dashboard, go to Domains
2. Add your domain
3. Verify domain ownership
4. Configure DNS records
5. Update email sender address

## Step 8: Configure Webhooks

Set up webhooks for email events:

1. Go to Webhooks in Resend dashboard
2. Add webhook URL: `https://your-app.vercel.app/api/webhooks/resend`
3. Select events to track:
   - Email sent
   - Email delivered
   - Email bounced
   - Email complained

## Step 9: Test Email Sending

```typescript
// Test email sending
const testEmail = async () => {
  const result = await sendEmail(
    'test@example.com',
    'Test Email',
    '<h1>Test Email from HACCP Manager</h1>'
  )

  console.log('Email result:', result)
}
```

## Step 10: Set Up Email Notifications

Configure automatic emails for:

- Temperature violations
- Task reminders
- Maintenance alerts
- Compliance reports
- User invitations
- Password resets

## Next Steps

- Set up email templates
- Configure notification preferences
- Set up email analytics
- Test email delivery
- Set up email scheduling

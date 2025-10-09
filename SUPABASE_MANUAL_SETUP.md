# 🚀 Supabase Manual Setup Guide

**Project:** Business HACCP Manager v2
**Branch:** NoClerk
**Date:** 2025-01-09

---

## 📋 OVERVIEW

This guide will walk you through setting up Supabase Auth + Email + RLS manually via the Supabase Dashboard.

**Total time:** ~30 minutes
**Complexity:** Medium

---

## ✅ PREREQUISITES

- [x] Supabase project exists: `https://tucqgcfrlzmwyfadiodo.supabase.co`
- [x] SQL migration files created in `/database/`
- [x] Branch `NoClerk` created
- [ ] Supabase Dashboard access

---

## 🗂️ STEP 0: CREA SCHEMA BASE (NUOVO PROGETTO VUOTO)

⚠️ **IMPORTANTE**: Se stai creando un NUOVO progetto Supabase completamente vuoto, devi PRIMA creare lo schema base!

### 0.1 Verifica se il Database è Vuoto

Esegui questa query per verificare se hai già delle tabelle:

```sql
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';
```

**Se il risultato è 0** → Procedi con lo Step 0.2 qui sotto  
**Se il risultato è >0** → Salta allo Step 1 (hai già lo schema base)

### 0.2 Esegui Schema Base Completo

1. Apri il file `database/NUOVO_PROGETTO_SUPABASE_COMPLETO.sql`
2. **COPIA TUTTO IL CONTENUTO** (sono circa 450 righe)
3. Nel SQL Editor di Supabase, **INCOLLA** tutto il contenuto
4. Clicca **RUN** (o Ctrl+Enter)

⏱️ **Tempo stimato**: 10-15 secondi

✅ **Output atteso**:
```
status: "Schema base creato con successo!"
total_tables: 15-16
```

**Verifica tabelle create**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Dovresti vedere queste 15 tabelle:
- ✅ companies
- ✅ conservation_points
- ✅ departments
- ✅ events
- ✅ maintenance_tasks
- ✅ non_conformities
- ✅ notes
- ✅ product_categories
- ✅ products
- ✅ shopping_list_items
- ✅ shopping_lists
- ✅ staff
- ✅ tasks
- ✅ temperature_readings
- ✅ user_profiles

❌ **Se ottieni errori**:
- Verifica di aver copiato tutto il file
- Controlla la console per errori specifici
- Assicurati che il progetto sia veramente vuoto

---

## 🗂️ STEP 1: EXECUTE SQL MIGRATIONS (Tabelle Auth)

⚠️ **PREREQUISITO**: Lo Step 0 deve essere completato (schema base esistente)

### 1.1 Open SQL Editor

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/tucqgcfrlzmwyfadiodo
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**

### 1.2 Execute Migration Files (IN ORDER)

**Execute these files ONE BY ONE in this exact order:**

#### File 1: `database/migrations/001_supabase_auth_setup.sql`

```sql
-- Copy and paste the entire content of 001_supabase_auth_setup.sql
-- This creates: company_members, user_sessions, invite_tokens, audit_logs
```

✅ Expected output: `Migration 001 completed successfully!`

**Verify tables created:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('company_members', 'user_sessions', 'invite_tokens', 'audit_logs');
```

Should return 4 rows.

---

#### File 2: `database/functions/rls_helpers.sql`

```sql
-- Copy and paste the entire content of rls_helpers.sql
-- This creates 9 helper functions for RLS policies
```

✅ Expected output: `RLS Helper Functions created successfully!`

**Verify functions created:**
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%company%' OR routine_name LIKE '%permission%';
```

Should return at least 9 functions.

---

#### File 3: `database/policies/rls_policies.sql`

⚠️ **IMPORTANT:** This file prepares policies but does NOT enable RLS yet!

```sql
-- Copy and paste the entire content of rls_policies.sql
-- This creates 72 policies for 18 tables (but RLS stays DISABLED for now)
```

✅ Expected output: `RLS Policies created successfully! (RLS NOT enabled yet)`

**Verify policies created:**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
LIMIT 10;
```

Should return at least 10 policies.

---

### 1.3 Verification Checkpoint

Run this comprehensive check:

```sql
-- Check new tables
SELECT 'Tables' as check_type, COUNT(*)::text as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('company_members', 'user_sessions', 'invite_tokens', 'audit_logs')

UNION ALL

-- Check functions
SELECT 'Functions', COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_active_company_id',
    'is_company_member',
    'has_management_role',
    'is_admin'
  )

UNION ALL

-- Check policies
SELECT 'Policies', COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public';
```

**Expected results:**
- Tables: 4
- Functions: 4+ (we created 9 total)
- Policies: 72+

---

## 🔐 STEP 2: CONFIGURE SUPABASE AUTH

### 2.1 Enable Email Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Find **Email** provider
3. Enable the following settings:

```
✅ Enable Email provider
✅ Confirm email (require users to verify email before login)
✅ Secure email change (require re-authentication)
❌ Disable signup (only admins can register initially)
```

4. Click **Save**

---

### 2.2 Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Configure these templates:

#### Template 1: **Confirm Signup**

**Subject:** `Conferma il tuo account - Business HACCP Manager`

**Body (HTML):**
```html
<h2>Benvenuto in Business HACCP Manager!</h2>
<p>Clicca sul pulsante qui sotto per confermare la tua email:</p>
<a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Conferma Email
</a>
<p>Oppure copia e incolla questo link nel browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Questo link scadrà tra 24 ore.</p>
<p><small>Se non hai richiesto questa registrazione, ignora questa email.</small></p>
```

---

#### Template 2: **Reset Password**

**Subject:** `Reset Password - Business HACCP Manager`

**Body (HTML):**
```html
<h2>Richiesta Reset Password</h2>
<p>Hai richiesto di resettare la tua password. Clicca sul pulsante qui sotto:</p>
<a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Reset Password
</a>
<p>Oppure copia e incolla questo link nel browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Questo link scadrà tra 1 ora.</p>
<p><small>Se non hai richiesto questo reset, ignora questa email.</small></p>
```

---

#### Template 3: **Magic Link** (optional, per login senza password)

**Subject:** `Il tuo link di accesso - Business HACCP Manager`

**Body (HTML):**
```html
<h2>Accesso Rapido</h2>
<p>Clicca sul pulsante qui sotto per accedere:</p>
<a href="{{ .ConfirmationURL }}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
  Accedi Ora
</a>
<p>Oppure copia e incolla questo link nel browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Questo link scadrà tra 5 minuti.</p>
```

---

### 2.3 Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure these options:

```
Site URL: https://your-production-domain.com (or http://localhost:5173 for dev)
Redirect URLs:
  - http://localhost:5173/auth/callback
  - https://your-production-domain.com/auth/callback

Mailer settings:
  - Rate limit: 10 emails per hour per user (default is fine)

Session settings:
  - JWT expiry: 3600 (1 hour)
  - Refresh token expiry: 2592000 (30 days)

Email settings:
  - Enable double opt-in: ✅ (requires email confirmation)
  - Minimum password length: 8
```

3. Click **Save**

---

## 📧 STEP 3: CONFIGURE SUPABASE SMTP

Supabase provides built-in SMTP for development. For production, you'll configure a custom domain.

### 3.1 Development SMTP (Built-in)

**Default configuration (no setup needed):**
- Supabase uses internal SMTP for development
- Emails will be sent from `noreply@mail.app.supabase.io`
- ⚠️ **Limitation:** Limited deliverability, emails may go to spam
- ⚠️ **Rate limit:** 30 emails per hour per project

**For testing, this is enough!** No additional configuration needed.

---

### 3.2 Production SMTP (Custom Domain)

When ready for production, configure your own domain:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**

2. Choose **Custom SMTP** and fill in:

```
SMTP Host: smtp.yourdomain.com
SMTP Port: 587 (or 465 for SSL)
SMTP User: noreply@yourdomain.com
SMTP Password: [your-smtp-password]
Sender Email: noreply@yourdomain.com
Sender Name: Business HACCP Manager
```

3. Click **Save**

---

### 3.3 Configure DNS Records (for Custom Domain)

Add these DNS records to your domain provider:

#### SPF Record (for email authentication)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.supabase.co ~all
TTL: 3600
```

#### DKIM Record (for email signing)
```
Type: TXT
Name: supabase._domainkey
Value: [Supabase will provide this after SMTP setup]
TTL: 3600
```

#### DMARC Record (for email policy)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@yourdomain.com
TTL: 3600
```

**Validation:** After adding DNS records, wait 24-48 hours for propagation, then test email delivery.

---

## 🧪 STEP 4: TEST AUTHENTICATION

### 4.1 Test Email Confirmation Flow

1. Create a test user via SQL:

```sql
-- This will trigger email confirmation
SELECT auth.signup(
  'test@yourdomain.com'::text,
  'TestPassword123!'::text,
  'test-user'::uuid
);
```

2. Check your email inbox for confirmation email
3. Click the confirmation link
4. Verify user is confirmed:

```sql
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'test@yourdomain.com';
```

Should show `email_confirmed_at` with a timestamp.

---

### 4.2 Test Password Reset Flow

1. Request password reset via SQL:

```sql
-- This will trigger password reset email
SELECT auth.request_password_reset('test@yourdomain.com'::text);
```

2. Check your email for reset link
3. Click the reset link and set new password
4. Verify you can login with new password

---

### 4.3 Test Multi-Company Session

1. Create a test company:

```sql
INSERT INTO companies (id, name, email, phone)
VALUES (gen_random_uuid(), 'Test Company', 'test@company.com', '1234567890')
RETURNING id;
```

2. Link user to company:

```sql
INSERT INTO company_members (user_id, company_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@yourdomain.com'),
  '[company-id-from-step-1]'::uuid,
  'admin'
);
```

3. Create session:

```sql
INSERT INTO user_sessions (user_id, active_company_id)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@yourdomain.com'),
  '[company-id-from-step-1]'::uuid
);
```

4. Test helper function:

```sql
-- Simulate auth.uid() for testing
SET LOCAL jwt.claims.sub = (SELECT id FROM auth.users WHERE email = 'test@yourdomain.com')::text;

SELECT get_active_company_id();
-- Should return the company_id
```

---

## ✅ STEP 5: VERIFICATION CHECKLIST

Before proceeding to FASE 3 (Remove Clerk), verify:

- [ ] All 4 tables created (`company_members`, `user_sessions`, `invite_tokens`, `audit_logs`)
- [ ] All 9 RLS helper functions created
- [ ] All 72 RLS policies created (but NOT enabled)
- [ ] Email provider enabled with confirmation required
- [ ] Email templates configured (Confirm Signup, Reset Password)
- [ ] SMTP configured (built-in for dev, or custom for prod)
- [ ] Test user created and email confirmed
- [ ] Test password reset works
- [ ] Test company + session created
- [ ] Helper functions return correct data

---

## 🚨 TROUBLESHOOTING

### Issue 1: Tables not created

**Error:** `relation "company_members" does not exist`

**Fix:**
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- If missing, re-run 001_supabase_auth_setup.sql
```

---

### Issue 2: Functions not found

**Error:** `function "get_active_company_id" does not exist`

**Fix:**
```sql
-- Check if functions exist
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- If missing, re-run rls_helpers.sql
```

---

### Issue 3: Email not received

**Possible causes:**
1. Email went to spam folder (check spam!)
2. SMTP rate limit exceeded (wait 1 hour)
3. Email address typo (verify email)
4. Supabase SMTP down (check Supabase status page)

**Fix:**
```sql
-- Check if email was sent
SELECT * FROM auth.audit_log_entries
WHERE action = 'email_sent'
ORDER BY created_at DESC
LIMIT 10;
```

---

### Issue 4: Email confirmation link expired

**Error:** "Token expired"

**Fix:**
```sql
-- Manually confirm email (for testing only!)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'test@yourdomain.com';
```

---

### Issue 5: RLS helper functions not working

**Error:** `permission denied for function get_active_company_id`

**Fix:**
```sql
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_active_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_management_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
```

---

## 📚 NEXT STEPS

After completing this manual setup:

1. ✅ Mark "Execute SQL migrations in Supabase manually" as COMPLETED
2. ➡️ Proceed to **FASE 3: Remove Clerk Dependencies**
3. ➡️ Then **FASE 4: Implement new useAuth hook**

---

## 📞 SUPPORT

If you encounter issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Check auth logs: **Authentication** → **Logs**
3. Test SQL functions in SQL Editor
4. Verify email settings in **Authentication** → **Settings**

---

**Setup Guide Created:** 2025-01-09
**Last Updated:** 2025-01-09
**Status:** Ready for execution
**Estimated Time:** 30 minutes

---

## 🎯 QUICK START CHECKLIST

Copy this to track your progress:

```
[ ] Step 1.1: Open SQL Editor
[ ] Step 1.2: Execute 001_supabase_auth_setup.sql
[ ] Step 1.2: Execute rls_helpers.sql
[ ] Step 1.2: Execute rls_policies.sql
[ ] Step 1.3: Verify tables/functions/policies created
[ ] Step 2.1: Enable Email authentication
[ ] Step 2.2: Configure email templates (3 templates)
[ ] Step 2.3: Configure auth settings
[ ] Step 3.1: Verify SMTP (built-in for dev)
[ ] Step 4.1: Test email confirmation
[ ] Step 4.2: Test password reset
[ ] Step 4.3: Test multi-company session
[ ] Step 5: Complete verification checklist
```

**When all checkboxes are ✅, inform Claude to proceed to FASE 3!**

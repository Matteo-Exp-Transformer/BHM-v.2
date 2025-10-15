# 🏢 MULTI-TENANT ARCHITECTURE ANALYSIS & ISSUES

**Project:** Business HACCP Manager v2.0  
**Date:** 2025-01-07  
**Status:** 🔴 CRITICAL ISSUES IDENTIFIED  

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Objective & Requirements](#objective--requirements)
3. [Current Architecture](#current-architecture)
4. [Critical Problems](#critical-problems)
5. [Missing Components](#missing-components)
6. [User Flows](#user-flows)
7. [Technical Solutions](#technical-solutions)
8. [Implementation Priority](#implementation-priority)
9. [Risk Assessment](#risk-assessment)
10. [Acceptance Criteria](#acceptance-criteria)

---

## 🎯 EXECUTIVE SUMMARY

### Current State
The application has a **fundamentally broken multi-tenant architecture**. New users cannot complete onboarding because there is no mechanism to create or associate them with a company.

### Critical Issues
- ❌ No company creation during user registration
- ❌ No logic to distinguish first user (creates company) vs subsequent users (join existing)
- ❌ Onboarding assumes `company_id` exists but never creates it
- ❌ Circular dependency: need company to be in staff, need staff to have company

### Impact
- **100% of new users cannot complete onboarding**
- **App is non-functional for first-time users**
- **Multi-tenancy is not enforced**
- **Data isolation is not guaranteed**

---

## 🎯 OBJECTIVE & REQUIREMENTS

### What Client Wants

**CORRECT UNDERSTANDING:**
```
Companies exist as entities (restaurants, pizzerias, bars)
Users (employees/staff) belong to these companies
Multiple users can work for the same company
Each company has isolated data
```

**INCORRECT (Previous Understanding):**
```
❌ Each user gets their own company (1:1 relationship)
```

### Architecture Goal

```
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🏢 COMPANY A: "Ristorante Da Mario"                    │
│     ├── 👤 Mario (Admin)                                │
│     ├── 👤 Luca (Responsabile)                          │
│     ├── 👤 Anna (Dipendente)                            │
│     └── 📊 Data: departments, staff, products, etc.     │
│                                                          │
│  🏢 COMPANY B: "Pizzeria Bella Napoli"                  │
│     ├── 👤 Giuseppe (Admin)                             │
│     ├── 👤 Maria (Dipendente)                           │
│     └── 📊 Data: departments, staff, products, etc.     │
│                                                          │
│  🏢 COMPANY C: "Bar Centrale"                           │
│     ├── 👤 Paolo (Admin)                                │
│     └── 📊 Data: departments, staff, products, etc.     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Key Requirements

1. ✅ **Company-Centric:** Companies are primary entities
2. ✅ **User Association:** Users belong to companies
3. ✅ **Data Isolation:** Each company's data is completely isolated
4. ✅ **Role-Based Access:** Users have roles within their company
5. ✅ **Scalability:** Support multiple companies with multiple users each

---

## 🏗️ CURRENT ARCHITECTURE

### Database Schema (Correct ✅)

```sql
-- Primary Entity
companies (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  address TEXT NOT NULL,
  email VARCHAR NOT NULL,
  staff_count INTEGER NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- User Profiles (Links Clerk to Company)
user_profiles (
  id UUID PRIMARY KEY,
  clerk_user_id VARCHAR UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id),  -- ❌ Often NULL!
  email VARCHAR NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  staff_id UUID REFERENCES staff(id),
  role VARCHAR DEFAULT 'guest',              -- ❌ Often 'guest'!
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Staff Members (Employees of Company)
staff (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  status VARCHAR DEFAULT 'active',
  haccp_certification JSONB,
  department_assignments UUID[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- All other tables have company_id FK
departments, conservation_points, maintenance_tasks, 
tasks, products, product_categories, etc.
└── All include: company_id UUID REFERENCES companies(id)
```

### Current User Registration Flow (Broken ❌)

```
1. User registers with Clerk
   └── Clerk creates auth account
       └── clerk_user_id: "user_xxx"

2. User logs in for first time
   └── useAuth.ts checks user_profiles
       └── No profile found

3. useAuth.ts creates user_profile
   ├── Searches staff table by email
   │   └── Email NOT found (new user)
   │       ├── company_id = NULL        ❌ PROBLEM!
   │       └── role = 'guest'           ❌ PROBLEM!
   │
   └── INSERT user_profiles (
       clerk_user_id: "user_xxx",
       email: "user@email.com",
       company_id: NULL,               ❌ NO COMPANY!
       role: 'guest'                   ❌ GUEST ROLE!
   )

4. User redirected to /onboarding
   └── OnboardingWizard loads
       └── completeOnboarding() needs company_id
           └── company_id = NULL        ❌ FAILS!
               └── Error: "Company ID not found"

❌ RESULT: User cannot complete onboarding
```

---

## ❌ CRITICAL PROBLEMS

### Problem 1: No Company Creation Logic
**Severity:** 🔴 CRITICAL  
**Impact:** App completely non-functional for new users

**Issue:**
There is **NO CODE** anywhere in the application that creates a `companies` record.

**Evidence:**
- `RegisterPage.tsx` - Only uses Clerk SignUp (no Supabase interaction)
- `useAuth.ts` - Creates `user_profiles` but NOT `companies`
- `onboardingHelpers.ts` - Assumes company exists, does UPDATE not INSERT

**Code Analysis:**
```typescript
// src/utils/onboardingHelpers.ts:800
const saveAllDataToSupabase = async (formData, companyId) => {
  if (!companyId) throw new Error('Company ID not found')  // ❌ THROWS!
  
  // Updates existing company (never creates new one)
  await supabase
    .from('companies')
    .update(formData.business)    // ❌ UPDATE not INSERT!
    .eq('id', companyId)          // ❌ But companyId is NULL!
}
```

**Consequence:**
```
New User → company_id = null → Onboarding fails → Cannot use app
```

---

### Problem 2: Circular Dependency (Catch-22)
**Severity:** 🔴 CRITICAL  
**Impact:** Impossible for new users to get company_id

**Issue:**
Logic creates an unsolvable circular dependency:
- To have `company_id`, user must be in `staff` table
- To be in `staff` table, user needs `company_id`
- **Result:** New users can never get company_id!

**Code Analysis:**
```typescript
// src/hooks/useAuth.ts:144-158
const { data: staffData } = await supabase
  .from('staff')
  .select('id, company_id, role, name, email')
  .eq('email', userEmail)
  .single()

// If NOT in staff → no company!
const role: UserRole = staffData?.role || 'guest'
const company_id = staffData?.company_id || null  // ❌ NULL!
```

**Logical Flow:**
```
Check staff table for user email
├── Found? ✅
│   └── Get company_id from staff record
│       └── User can proceed
│
└── Not Found? ❌
    └── company_id = null
        └── role = 'guest'
            └── User STUCK! Cannot proceed!
```

---

### Problem 3: No First User vs Subsequent User Logic
**Severity:** 🔴 CRITICAL  
**Impact:** Cannot distinguish who should create company

**Issue:**
Application treats all users the same:
- **First user** (should create company) → Gets company_id = null
- **Subsequent user** (should join existing) → Also gets company_id = null
- **No mechanism** to determine which scenario applies

**What's Needed:**
```
First User Flow:
1. Mario registers
2. System detects: NO company associated
3. System prompts: "Create your company"
4. Mario completes onboarding
5. System CREATES new company
6. Mario becomes admin

Subsequent User Flow:
1. Luca registers (email: luca@ristorante.com)
2. System detects: Email in staff table of Mario's company
3. System automatically: Associates Luca with company
4. Luca becomes staff member (role from staff table)
5. Luca can access dashboard (skip onboarding)
```

**Current Reality:**
```
Both Mario and Luca:
└── company_id = null
    └── role = 'guest'
        └── Cannot proceed
```

---

### Problem 4: Onboarding Assumes Company Exists
**Severity:** 🔴 CRITICAL  
**Impact:** Cannot save any onboarding data

**Issue:**
Onboarding code assumes `company_id` already exists and only updates the company info.

**Code Analysis:**
```typescript
// BusinessInfoStep data saved but company never created
const saveAllDataToSupabase = async (formData, companyId) => {
  // ASSUMES company exists
  if (!companyId) throw new Error('Company ID not found')
  
  // UPDATES existing company (never creates)
  await supabase
    .from('companies')
    .update({
      name: formData.business.name,
      address: formData.business.address,
      email: formData.business.email,
      staff_count: formData.staff?.length || 0,
    })
    .eq('id', companyId)  // This will fail if companyId is null
}
```

**What Should Happen:**
```typescript
// Should CREATE company first
const saveAllDataToSupabase = async (formData, companyId) => {
  // If no company, CREATE new one
  if (!companyId) {
    const { data: newCompany } = await supabase
      .from('companies')
      .insert({
        name: formData.business.name,
        address: formData.business.address,
        email: formData.business.email,
        staff_count: 1,
      })
      .select()
      .single()
    
    companyId = newCompany.id
    
    // Link user to new company
    await linkUserToCompany(userId, companyId, 'admin')
  }
  
  // Then save other data...
}
```

---

### Problem 5: Reset App Doesn't Clean Database
**Severity:** 🟠 HIGH  
**Impact:** Cannot test with clean state

**Issue:**
`resetApp()` only clears localStorage but leaves Supabase data intact.

**Code Analysis:**
```typescript
// src/App.tsx
export const resetApp = (): void => {
  localStorage.clear()
  sessionStorage.clear()
  location.reload()
  // ❌ Does NOT clean Supabase data!
}
```

**Consequence:**
```
User tries to reset and start fresh
└── localStorage cleared ✅
    └── But Supabase still has:
        ├── 28 maintenance_tasks
        ├── 7 conservation_points
        ├── Staff records
        └── Department records
            └── User sees "old" data after reset ❌
```

---

## 🔧 MISSING COMPONENTS

### 1. Company Creation Function
**Priority:** 🔴 P0 (Blocker)

**What's Missing:**
```typescript
/**
 * Creates a new company for first-time user
 * @param userData - User information from Clerk
 * @param businessData - Business information from onboarding
 * @returns company_id of newly created company
 */
async function createCompanyForUser(
  userData: {
    clerk_user_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  },
  businessData: {
    name: string;
    address: string;
    email: string;
  }
): Promise<string> {
  // 1. Create company
  const { data: newCompany, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: businessData.name,
      address: businessData.address,
      email: businessData.email,
      staff_count: 1,
    })
    .select()
    .single()

  if (companyError) throw companyError

  // 2. Link user to company
  await supabase
    .from('user_profiles')
    .update({
      company_id: newCompany.id,
      role: 'admin',  // First user is admin
    })
    .eq('clerk_user_id', userData.clerk_user_id)

  // 3. Create staff record for admin
  await supabase
    .from('staff')
    .insert({
      company_id: newCompany.id,
      name: `${userData.first_name} ${userData.last_name}`,
      email: userData.email,
      role: 'admin',
      category: 'Amministratore',
      status: 'active',
    })

  return newCompany.id
}
```

**Where to Add:** 
- `src/utils/companyManagement.ts` (new file)
- Call from `BusinessInfoStep.tsx` when submitting

---

### 2. Enhanced User Authentication Logic
**Priority:** 🔴 P0 (Blocker)

**What's Missing:**
```typescript
/**
 * Enhanced authentication with company detection
 * Handles both new users and existing staff
 */
async function authenticateUserWithCompany(clerkUser: ClerkUser) {
  const userEmail = clerkUser.emailAddresses[0].emailAddress

  // Check if user profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*, staff_id, role, company_id')
    .eq('clerk_user_id', clerkUser.id)
    .single()

  if (existingProfile) {
    // Profile exists, return it
    return existingProfile
  }

  // Profile doesn't exist - check staff table
  const { data: staffData } = await supabase
    .from('staff')
    .select('id, company_id, role, name, email')
    .eq('email', userEmail)
    .single()

  if (staffData) {
    // ✅ User email found in staff = existing company member
    const newProfile = await supabase
      .from('user_profiles')
      .insert({
        clerk_user_id: clerkUser.id,
        email: userEmail,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        company_id: staffData.company_id,  // ✅ From staff table
        staff_id: staffData.id,
        role: staffData.role,              // ✅ From staff table
      })
      .select()
      .single()

    return newProfile
  }

  // ❌ User NOT in staff = first user of new company
  const newProfile = await supabase
    .from('user_profiles')
    .insert({
      clerk_user_id: clerkUser.id,
      email: userEmail,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      company_id: null,           // Will be set during onboarding
      staff_id: null,
      role: 'admin',              // First user becomes admin
    })
    .select()
    .single()

  return newProfile
}
```

**Where to Add:**
- `src/hooks/useAuth.ts` (replace existing logic at lines 125-185)

---

### 3. Onboarding Company Creation
**Priority:** 🔴 P0 (Blocker)

**What's Missing:**
```typescript
/**
 * Modified onboarding to create company if needed
 */
async function completeOnboardingWithCompanyCreation(formData, userId) {
  let companyId = await getCompanyId(userId)

  // If no company, CREATE it from BusinessInfoStep data
  if (!companyId) {
    const { data: newCompany } = await supabase
      .from('companies')
      .insert({
        name: formData.business.name,
        address: formData.business.address,
        email: formData.business.email,
        staff_count: 1,
      })
      .select()
      .single()

    companyId = newCompany.id

    // Link user to new company
    await supabase
      .from('user_profiles')
      .update({ company_id: companyId, role: 'admin' })
      .eq('clerk_user_id', userId)
  } else {
    // Company exists, UPDATE it
    await supabase
      .from('companies')
      .update({
        name: formData.business.name,
        address: formData.business.address,
        email: formData.business.email,
      })
      .eq('id', companyId)
  }

  // Continue saving other onboarding data...
  await saveAllDataToSupabase(formData, companyId)
}
```

**Where to Modify:**
- `src/utils/onboardingHelpers.ts:800` (function `saveAllDataToSupabase`)

---

### 4. Database Cleanup Function
**Priority:** 🟡 P2 (Important)

**What's Missing:**
```sql
-- Supabase Function to purge all company data
CREATE OR REPLACE FUNCTION purge_company_data(p_company_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_stats jsonb;
BEGIN
  -- Delete in correct order (respect foreign keys)
  DELETE FROM temperature_readings WHERE company_id = p_company_id;
  DELETE FROM products WHERE company_id = p_company_id;
  DELETE FROM product_categories WHERE company_id = p_company_id;
  DELETE FROM tasks WHERE company_id = p_company_id;
  DELETE FROM maintenance_tasks WHERE company_id = p_company_id;
  DELETE FROM conservation_points WHERE company_id = p_company_id;
  DELETE FROM staff WHERE company_id = p_company_id;
  DELETE FROM departments WHERE company_id = p_company_id;
  DELETE FROM events WHERE company_id = p_company_id;
  DELETE FROM notes WHERE company_id = p_company_id;
  DELETE FROM non_conformities WHERE company_id = p_company_id;
  
  -- Return stats
  v_stats := jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'timestamp', NOW()
  );
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Integration:**
```typescript
// Enhanced resetApp()
async function resetApp() {
  const companyId = await getUserCompanyId()
  
  if (companyId) {
    // Purge database
    await supabase.rpc('purge_company_data', {
      p_company_id: companyId
    })
  }
  
  // Clear local storage
  localStorage.clear()
  sessionStorage.clear()
  
  // Reload
  location.reload()
}
```

**Where to Add:**
- Create `supabase/functions/purge-company-data.sql`
- Modify `src/utils/onboardingHelpers.ts` (function `resetApp`)

---

### 5. Invite System (Optional but Recommended)
**Priority:** 🟢 P3 (Enhancement)

**What's Missing:**
```sql
-- Invite table
CREATE TABLE company_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  email VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  invited_by UUID REFERENCES user_profiles(id),
  invite_token VARCHAR UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_company_invites_token ON company_invites(invite_token);
CREATE INDEX idx_company_invites_email ON company_invites(email);
```

**Functionality:**
```typescript
// Generate invite link
async function generateInvite(companyId, email, role) {
  const token = crypto.randomUUID()
  
  await supabase
    .from('company_invites')
    .insert({
      company_id: companyId,
      email: email,
      role: role,
      invite_token: token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

  return `${APP_URL}/register?invite=${token}`
}

// Accept invite during registration
async function acceptInvite(inviteToken, clerkUserId) {
  const { data: invite } = await supabase
    .from('company_invites')
    .select('*, companies(*)')
    .eq('invite_token', inviteToken)
    .single()

  if (!invite || invite.used_at || invite.expires_at < new Date()) {
    throw new Error('Invalid or expired invite')
  }

  // Link user to company
  await supabase
    .from('user_profiles')
    .update({
      company_id: invite.company_id,
      role: invite.role,
    })
    .eq('clerk_user_id', clerkUserId)

  // Mark invite as used
  await supabase
    .from('company_invites')
    .update({ used_at: new Date() })
    .eq('id', invite.id)
}
```

---

## 👥 USER FLOWS

### Flow 1: First Admin Creates Company

```
┌─────────────────────────────────────────────────────────┐
│ MARIO - First Admin of "Ristorante Da Mario"           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Registration                                         │
│    ├── Opens app                                        │
│    ├── Clicks "Register"                                │
│    ├── Enters: mario@ristorante.com                     │
│    └── Clerk creates account                            │
│                                                         │
│ 2. First Login                                          │
│    ├── useAuth checks user_profiles → NOT FOUND        │
│    ├── useAuth checks staff table → NOT FOUND          │
│    └── Creates user_profile:                            │
│        ├── company_id: null                             │
│        └── role: 'admin' (temporary)                    │
│                                                         │
│ 3. Onboarding Step 1: Business Info                    │
│    ├── System detects: company_id = null               │
│    ├── Shows: "Create Your Company"                     │
│    ├── Mario enters:                                    │
│    │   ├── Name: "Ristorante Da Mario"                 │
│    │   ├── Address: "Via Roma 1, Milano"               │
│    │   └── Email: "info@ristorante.com"                │
│    └── On Submit:                                       │
│        ├── CREATE new company                           │
│        ├── UPDATE user_profile.company_id               │
│        └── CREATE staff record for Mario                │
│                                                         │
│ 4. Onboarding Steps 2-6                                │
│    ├── Configure Departments                            │
│    ├── Add Staff (including Luca's email)              │
│    ├── Set Conservation Points                          │
│    ├── Define Tasks                                     │
│    └── Setup Inventory                                  │
│                                                         │
│ 5. Onboarding Complete                                 │
│    └── Mario can access full app with admin rights     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Flow 2: Staff Member Joins (Email Match)

```
┌─────────────────────────────────────────────────────────┐
│ LUCA - Staff Member joining Mario's company            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Prerequisite:                                           │
│ └── Mario added Luca to staff table during onboarding  │
│     └── staff.email = "luca@ristorante.com"            │
│         staff.company_id = <Mario's company>            │
│         staff.role = "dipendente"                       │
│                                                         │
│ 1. Registration                                         │
│    ├── Luca opens app                                   │
│    ├── Registers with: luca@ristorante.com             │
│    └── Clerk creates account                            │
│                                                         │
│ 2. First Login                                          │
│    ├── useAuth checks user_profiles → NOT FOUND        │
│    ├── useAuth checks staff table → FOUND! ✅          │
│    │   └── Email matches staff record                   │
│    └── Creates user_profile:                            │
│        ├── company_id: <Mario's company> ✅             │
│        ├── staff_id: <Luca's staff record> ✅           │
│        └── role: 'dipendente' ✅                        │
│                                                         │
│ 3. Access Granted                                       │
│    └── Luca automatically has access to:                │
│        ├── Company dashboard                            │
│        ├── Assigned tasks                               │
│        ├── Conservation monitoring                      │
│        └── Inventory (based on role permissions)        │
│                                                         │
│ ✅ NO ONBOARDING NEEDED - Direct access!               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

### Flow 3: Staff Member Joins (Invite Link)

```
┌─────────────────────────────────────────────────────────┐
│ ANNA - New employee invited by Mario                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Mario Generates Invite                              │
│    ├── Goes to Settings → Team Management              │
│    ├── Clicks "Invite Team Member"                      │
│    ├── Enters:                                          │
│    │   ├── Email: anna@ristorante.com                   │
│    │   └── Role: dipendente                             │
│    └── System generates:                                │
│        └── Link: app.com/register?invite=abc123        │
│                                                         │
│ 2. Anna Receives Email                                 │
│    ├── Mario sends invite link to Anna                  │
│    └── Anna clicks link                                 │
│                                                         │
│ 3. Registration with Invite                            │
│    ├── Link opens app with invite token                │
│    ├── Anna registers: anna@ristorante.com             │
│    └── Clerk creates account                            │
│                                                         │
│ 4. Invite Processing                                   │
│    ├── System validates invite token                    │
│    ├── Token is valid ✅                                │
│    └── Creates user_profile:                            │
│        ├── company_id: <Mario's company> ✅             │
│        ├── role: 'dipendente' (from invite) ✅          │
│        └── Marks invite as used                         │
│                                                         │
│ 5. Staff Record Creation                               │
│    └── System creates staff record:                     │
│        ├── name: "Anna"                                 │
│        ├── email: "anna@ristorante.com"                 │
│        ├── role: 'dipendente'                           │
│        └── company_id: <Mario's company>                │
│                                                         │
│ 6. Access Granted                                       │
│    └── Anna can access dashboard immediately           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 TECHNICAL SOLUTIONS

### Solution 1: Modify useAuth.ts

**File:** `src/hooks/useAuth.ts`  
**Lines:** 125-185

**Current Code (Broken):**
```typescript
// Check if email exists in staff table
const { data: staffData } = await supabase
  .from('staff')
  .select('id, company_id, role, name, email')
  .eq('email', userEmail)
  .single()

// Determine role and company
const role: UserRole = staffData?.role || 'guest'  // ❌ guest!
const company_id = staffData?.company_id || null   // ❌ null!
```

**Fixed Code:**
```typescript
// Check if email exists in staff table
const { data: staffData } = await supabase
  .from('staff')
  .select('id, company_id, role, name, email')
  .eq('email', userEmail)
  .single()

// Determine role and company
let role: UserRole
let company_id: string | null

if (staffData) {
  // ✅ User in staff table = existing company member
  role = staffData.role
  company_id = staffData.company_id
} else {
  // ✅ User NOT in staff = first user of new company
  role = 'admin'  // Will create company during onboarding
  company_id = null  // Will be set during onboarding
}
```

---

### Solution 2: Modify OnboardingWizard Business Step

**File:** `src/components/onboarding-steps/BusinessInfoStep.tsx`  
**Add:** Company creation logic

**New Code to Add:**
```typescript
const handleSubmit = async (data) => {
  const { companyId } = useAuth()

  if (!companyId) {
    // Create new company
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert({
        name: data.name,
        address: data.address,
        email: data.email,
        staff_count: 1,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create company')
      return
    }

    // Link user to company
    await supabase
      .from('user_profiles')
      .update({
        company_id: newCompany.id,
        role: 'admin',
      })
      .eq('clerk_user_id', user.id)

    // Update context
    setCompanyId(newCompany.id)
    
    toast.success('Company created successfully!')
  }

  // Continue to next step
  onUpdate(data)
  goToNextStep()
}
```

---

### Solution 3: Modify saveAllDataToSupabase

**File:** `src/utils/onboardingHelpers.ts`  
**Lines:** 800-845

**Current Code (Broken):**
```typescript
const saveAllDataToSupabase = async (formData, companyId) => {
  if (!companyId) throw new Error('Company ID not found')  // ❌
  
  // UPDATE existing (assumes company exists)
  await supabase
    .from('companies')
    .update(formData.business)
    .eq('id', companyId)  // ❌
}
```

**Fixed Code:**
```typescript
const saveAllDataToSupabase = async (formData, companyId) => {
  if (!companyId) {
    throw new Error('Company ID not found - should have been created in BusinessInfoStep')
  }
  
  // Company should already exist (created in BusinessInfoStep)
  // Just update with any additional info
  await supabase
    .from('companies')
    .update({
      ...formData.business,
      staff_count: formData.staff?.length || 1,
    })
    .eq('id', companyId)
  
  // Continue saving other data...
}
```

---

### Solution 4: Add Database Cleanup

**Create:** `supabase/functions/purge-company-data.sql`

```sql
-- Function to purge all data for a company
CREATE OR REPLACE FUNCTION purge_company_data(p_company_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_counts jsonb;
BEGIN
  -- Delete in order respecting foreign keys
  WITH deletion_stats AS (
    SELECT
      'temperature_readings' as table_name,
      (DELETE FROM temperature_readings WHERE company_id = p_company_id) as count
    UNION ALL
    SELECT 'products', (DELETE FROM products WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'product_categories', (DELETE FROM product_categories WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'tasks', (DELETE FROM tasks WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'maintenance_tasks', (DELETE FROM maintenance_tasks WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'conservation_points', (DELETE FROM conservation_points WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'staff', (DELETE FROM staff WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'departments', (DELETE FROM departments WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'events', (DELETE FROM events WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'notes', (DELETE FROM notes WHERE company_id = p_company_id)
    UNION ALL
    SELECT 'non_conformities', (DELETE FROM non_conformities WHERE company_id = p_company_id)
  )
  SELECT jsonb_object_agg(table_name, count) INTO v_deleted_counts
  FROM deletion_stats;

  RETURN jsonb_build_object(
    'success', true,
    'company_id', p_company_id,
    'deleted_counts', v_deleted_counts,
    'timestamp', NOW()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION purge_company_data(uuid) TO authenticated;
```

**Integration:**
```typescript
// src/utils/onboardingHelpers.ts
export const resetApp = async (): Promise<void> => {
  const confirmed = window.confirm(
    '🚨 RESET COMPLETO\n\n' +
    'Questa operazione cancellerà TUTTI i dati dal database.\n' +
    'Sei ASSOLUTAMENTE sicuro?'
  )

  if (!confirmed) return

  try {
    // Get company_id
    const clerkUserId = localStorage.getItem('clerk-user-id')
    if (clerkUserId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('clerk_user_id', clerkUserId)
        .single()

      if (profile?.company_id) {
        // Purge database
        const { data, error } = await supabase.rpc('purge_company_data', {
          p_company_id: profile.company_id
        })

        if (error) throw error
        console.log('✅ Database purged:', data)
      }
    }

    // Clear local storage
    clearAllStorage()
    
    toast.success('Reset completato!')
    setTimeout(() => location.reload(), 1000)
  } catch (error) {
    console.error('❌ Reset failed:', error)
    toast.error('Errore durante il reset')
  }
}
```

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1: Critical Fixes (IMMEDIATE)
**Goal:** Make app functional for new users

| Priority | Task | File | Estimated Time |
|----------|------|------|----------------|
| P0 | Fix useAuth company detection | `src/hooks/useAuth.ts` | 2 hours |
| P0 | Add company creation in BusinessInfoStep | `src/components/onboarding-steps/BusinessInfoStep.tsx` | 3 hours |
| P0 | Modify saveAllDataToSupabase | `src/utils/onboardingHelpers.ts` | 2 hours |
| P0 | Test complete flow | Manual testing | 2 hours |

**Total:** ~9 hours

---

### Phase 2: Data Management (SHORT-TERM)
**Goal:** Enable proper testing and data cleanup

| Priority | Task | File | Estimated Time |
|----------|------|------|----------------|
| P1 | Create purge_company_data SQL function | `supabase/functions/` | 2 hours |
| P1 | Integrate cleanup in resetApp | `src/utils/onboardingHelpers.ts` | 1 hour |
| P1 | Add company validation middleware | `src/hooks/useSecureQuery.ts` | 3 hours |
| P1 | Implement error recovery UI | Various components | 4 hours |

**Total:** ~10 hours

---

### Phase 3: Enhancements (MEDIUM-TERM)
**Goal:** Improve UX and add invite system

| Priority | Task | File | Estimated Time |
|----------|------|------|----------------|
| P2 | Create invite system database schema | `supabase/migrations/` | 2 hours |
| P2 | Implement invite generation | `src/features/settings/` | 4 hours |
| P2 | Implement invite acceptance | `src/features/auth/` | 3 hours |
| P2 | Add invite UI to settings | `src/features/settings/` | 3 hours |

**Total:** ~12 hours

---

### Phase 4: Security & Polish (LONG-TERM)
**Goal:** Production-ready security

| Priority | Task | File | Estimated Time |
|----------|------|------|----------------|
| P3 | Implement RLS policies | `supabase/policies/` | 6 hours |
| P3 | Add audit logging | Various | 4 hours |
| P3 | Add automated tests | `tests/` | 8 hours |
| P3 | Add monitoring/alerts | Infrastructure | 4 hours |

**Total:** ~22 hours

---

## ⚠️ RISK ASSESSMENT

### Risk Matrix

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|------------|--------|----------|------------|
| Data Leakage (no RLS) | HIGH | CRITICAL | 🔴 | Implement RLS policies immediately |
| Orphan Data (no validation) | MEDIUM | HIGH | 🟠 | Add NOT NULL constraints + validation |
| Company Collision | LOW | MEDIUM | 🟡 | UUID-based identification (already done) |
| Invite Abuse | MEDIUM | MEDIUM | 🟡 | Rate limiting + expiration |
| Reset Data Loss | HIGH | LOW | 🟡 | Add confirmation dialog (already done) |

---

### Security Considerations

#### 1. Row Level Security (RLS)
**Status:** ⚠️ MISSING

**Required Policies:**
```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Policy: Users can only see data from their company
CREATE POLICY company_isolation ON departments
FOR ALL
USING (
  company_id IN (
    SELECT company_id 
    FROM user_profiles 
    WHERE clerk_user_id = auth.uid()
  )
);

-- Apply similar policy to all tables with company_id
```

---

#### 2. Data Validation
**Status:** ⚠️ PARTIAL

**Needed:**
```sql
-- Add NOT NULL constraint on company_id
ALTER TABLE departments 
ALTER COLUMN company_id SET NOT NULL;

-- Add check constraint
ALTER TABLE companies
ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

---

#### 3. Audit Logging
**Status:** ❌ MISSING

**Recommended:**
```sql
-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  user_id VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  table_name VARCHAR NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger function
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (company_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ ACCEPTANCE CRITERIA

### Must Have (P0)

- [ ] **New user can register and create company**
  - User completes Clerk registration
  - User accesses onboarding
  - User creates company in BusinessInfoStep
  - Company is created in database
  - User is linked to company as admin

- [ ] **Staff member can join existing company**
  - Admin adds staff member email during onboarding
  - Staff member registers with that email
  - System automatically associates them with company
  - Staff member has correct role from staff table
  - Staff member can access dashboard immediately

- [ ] **Onboarding saves all data correctly**
  - Company information saved
  - Departments created
  - Staff records created
  - Conservation points created
  - Maintenance tasks created
  - All data has correct company_id

- [ ] **Data isolation is enforced**
  - Company A cannot see Company B's data
  - All queries filter by company_id
  - Users can only access their company's data

---

### Should Have (P1)

- [ ] **Reset app cleans database**
  - resetApp() purges Supabase data
  - purge_company_data function works correctly
  - User can start fresh after reset

- [ ] **Error handling for missing company**
  - Clear error messages
  - Recovery options presented
  - No silent failures

- [ ] **Company validation**
  - company_id validated in all queries
  - Middleware enforces company context
  - Orphan data prevented

---

### Nice to Have (P2-P3)

- [ ] **Invite system implemented**
  - Admin can generate invite links
  - Invite links work correctly
  - Invites expire after 7 days
  - Used invites cannot be reused

- [ ] **RLS policies active**
  - Row-level security on all tables
  - Users restricted to their company
  - Admin cannot access other companies

- [ ] **Audit logging**
  - All changes logged
  - Audit trail available
  - Compliance reporting possible

---

## 📝 TESTING CHECKLIST

### Test Scenario 1: New Company Creation

```
Steps:
1. Clear database and localStorage
2. Register new user (mario@test.com)
3. Complete onboarding with company info
4. Verify:
   ✓ Company created in companies table
   ✓ User linked to company (user_profiles.company_id set)
   ✓ User has admin role
   ✓ Staff record created for user
   ✓ All onboarding data saved with company_id
```

---

### Test Scenario 2: Staff Member Join

```
Prerequisite:
- Company exists (created by Mario)
- Staff record exists with email luca@test.com

Steps:
1. Register new user (luca@test.com)
2. Login
3. Verify:
   ✓ User automatically linked to Mario's company
   ✓ User has role from staff table
   ✓ User can access dashboard
   ✓ User sees company's data
   ✓ No onboarding shown
```

---

### Test Scenario 3: Data Isolation

```
Prerequisite:
- Company A (Mario's) exists with data
- Company B (Giuseppe's) exists with data

Steps:
1. Login as Mario
2. Verify:
   ✓ See only Company A's departments
   ✓ See only Company A's staff
   ✓ See only Company A's products
   
3. Login as Giuseppe
4. Verify:
   ✓ See only Company B's departments
   ✓ See only Company B's staff
   ✓ See only Company B's products
   ✓ Cannot see Company A's data
```

---

### Test Scenario 4: Reset App

```
Prerequisite:
- Company with data exists

Steps:
1. Call resetApp()
2. Confirm deletion
3. Verify:
   ✓ Database purged (all tables empty for company)
   ✓ localStorage cleared
   ✓ Can register as new user
   ✓ Can create new company
   ✓ No old data visible
```

---

## 📚 ADDITIONAL RESOURCES

### SQL Script to Check Current State

```sql
-- Check companies
SELECT id, name, email, staff_count FROM companies;

-- Check user profiles
SELECT 
  up.email,
  up.role,
  up.company_id,
  c.name as company_name
FROM user_profiles up
LEFT JOIN companies c ON c.id = up.company_id;

-- Check staff
SELECT 
  s.name,
  s.email,
  s.role,
  c.name as company_name
FROM staff s
LEFT JOIN companies c ON c.id = s.company_id;

-- Check data counts per company
SELECT 
  c.name as company_name,
  (SELECT COUNT(*) FROM departments WHERE company_id = c.id) as departments,
  (SELECT COUNT(*) FROM staff WHERE company_id = c.id) as staff,
  (SELECT COUNT(*) FROM conservation_points WHERE company_id = c.id) as conservation_points,
  (SELECT COUNT(*) FROM maintenance_tasks WHERE company_id = c.id) as maintenance_tasks,
  (SELECT COUNT(*) FROM products WHERE company_id = c.id) as products
FROM companies c;
```

---

### Quick Diagnosis Commands

**Check if user has company:**
```sql
SELECT 
  email, 
  company_id, 
  role 
FROM user_profiles 
WHERE clerk_user_id = 'YOUR_CLERK_ID';
```

**Check if email in staff:**
```sql
SELECT 
  name, 
  email, 
  role, 
  company_id 
FROM staff 
WHERE email = 'user@email.com';
```

**Count records per company:**
```sql
SELECT 
  company_id,
  COUNT(*) as record_count,
  'departments' as table_name
FROM departments
GROUP BY company_id
ORDER BY company_id;
```

---

## 🎯 SUMMARY

### Current Status
- ❌ **Application is non-functional for new users**
- ❌ **No company creation mechanism exists**
- ❌ **Multi-tenancy not enforced**
- ❌ **Data isolation not guaranteed**

### Root Cause
- Missing company creation logic during registration
- Circular dependency between user and company
- Onboarding assumes company exists
- No distinction between first user and subsequent users

### Priority Actions
1. **P0:** Fix useAuth to handle new users correctly
2. **P0:** Add company creation in BusinessInfoStep
3. **P0:** Modify onboarding to create instead of update
4. **P1:** Implement database cleanup function
5. **P2:** Add invite system for team members

### Expected Outcome
- ✅ New users can register and create company
- ✅ Staff members can join existing companies
- ✅ Data is properly isolated per company
- ✅ Multi-tenancy works correctly
- ✅ App is production-ready

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-07  
**Next Review:** After Phase 1 implementation


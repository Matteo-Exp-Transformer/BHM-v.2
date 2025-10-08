# Supabase Schema Mapping - HACCP Business Manager v3.0

**Comprehensive schema documentation and data access patterns**

**Ultima verifica:** 2025-10-07
**Status:** ✅ Verificato e aggiornato con audit completo
**Architettura:** Clerk Auth + Supabase Database

---

## Table of Contents

1. [Overview](#overview)
2. [Complete Table Reference](#complete-table-reference)
3. [Onboarding Data Mapping](#onboarding-data-mapping)
4. [Runtime Data Operations](#runtime-data-operations)
5. [Data Access Patterns](#data-access-patterns)
6. [Type Definitions Reference](#type-definitions-reference)
7. [Security & Multi-Tenancy](#security--multi-tenancy)
8. [Common Patterns & Best Practices](#common-patterns--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Current Architecture
- **Authentication:** Clerk Auth (JWT tokens)
- **Database:** Supabase PostgreSQL
- **Truth Source:** `user_profiles` table for user data
- **Multi-tenancy:** `company_id` filtering at application level
- **Security:** RLS disabled, application-level filtering

### RLS Status and Security Approach
⚠️ **RLS (Row-Level Security) is DISABLED** on all tables to support Clerk Auth integration.

**Security Implementation:**
- All queries include `.eq('company_id', companyId)` filters
- Company isolation enforced at application level
- User context managed through Clerk Auth + `user_profiles` table

### Company_id Multi-tenancy Pattern
Every data table includes `company_id` as a foreign key to `companies.id` for complete data isolation between organizations.

---

## Complete Table Reference

### ✅ Core Tables (Verified in Codebase)

#### 1. `companies`
**Purpose:** Organization/tenant records
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\utils\onboardingHelpers.ts:818`

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  address TEXT,
  email VARCHAR,
  staff_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** N/A (root tenant table)
**Indexes:** Primary key on `id`

#### 2. `user_profiles`
**Purpose:** User authentication and company assignment
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\utils\onboardingHelpers.ts:679,1129`

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR UNIQUE NOT NULL,
  company_id UUID REFERENCES companies(id),
  staff_id UUID REFERENCES staff(id),
  email VARCHAR,
  name VARCHAR,
  role VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`, `staff_id → staff.id`

#### 3. `departments`
**Purpose:** Organizational departments within companies
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\management\hooks\useDepartments.ts`

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`
**Check Constraints:** None
**Array/JSON fields:** None

#### 4. `staff`
**Purpose:** Employee records with HACCP certifications
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\management\hooks\useStaff.ts`

```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,  -- ⚠️ No CHECK constraint in actual schema
  category VARCHAR NOT NULL,
  email VARCHAR,
  phone VARCHAR,
  hire_date DATE,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes TEXT,
  haccp_certification JSONB,
  department_assignments UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`
**Check Constraints:** `status` (⚠️ `role` has no DB constraint - application-level only)
**Array/JSON fields:** `haccp_certification` (JSONB), `department_assignments` (UUID[])

#### 5. `conservation_points`
**Purpose:** Temperature monitoring locations
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useConservationPoints.ts`

```sql
CREATE TABLE conservation_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  name VARCHAR NOT NULL,
  setpoint_temp NUMERIC NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('ambient', 'fridge', 'freezer', 'blast')),
  product_categories TEXT[],
  is_blast_chiller BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  maintenance_due TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`, `department_id → departments.id`
**Check Constraints:** `type`, `status`
**Array/JSON fields:** `product_categories` (TEXT[])

#### 6. `temperature_readings` ⚠️ **SIMPLIFIED SCHEMA**
**Purpose:** Temperature monitoring data (SIMPLIFIED VERSION)
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useTemperatureReadings.ts`

```sql
CREATE TABLE temperature_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  conservation_point_id UUID NOT NULL REFERENCES conservation_points(id),
  temperature NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`, `conservation_point_id → conservation_points.id`
**Check Constraints:** None
**Note:** ⚠️ Code expects additional fields (target_temperature, status, method, notes, etc.) but actual schema only has 6 basic fields

#### 7. `maintenance_tasks`
**Purpose:** Maintenance scheduling and tracking
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useMaintenanceTasks.ts`

```sql
CREATE TABLE maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  conservation_point_id UUID NOT NULL REFERENCES conservation_points(id),
  title VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL CHECK (type IN ('temperature', 'sanitization', 'defrosting')),
  frequency VARCHAR NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'biannually', 'annually', 'as_needed', 'custom')),
  estimated_duration INTEGER NOT NULL, -- minutes
  last_completed TIMESTAMP,
  next_due TIMESTAMP NOT NULL,
  assigned_to VARCHAR,
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'skipped')),
  checklist TEXT[],
  required_tools TEXT[],
  safety_notes TEXT[],
  completion_notes TEXT,
  completed_by VARCHAR,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`, `conservation_point_id → conservation_points.id`
**Check Constraints:** `type`, `frequency`, `priority`, `status`
**Array/JSON fields:** `checklist` (TEXT[]), `required_tools` (TEXT[]), `safety_notes` (TEXT[])

#### 8. `product_categories`
**Purpose:** Product categorization
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\inventory\hooks\useCategories.ts`

```sql
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`

#### 9. `products`
**Purpose:** Inventory management with expiry tracking
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\inventory\hooks\useProducts.ts`

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR NOT NULL,
  category_id UUID REFERENCES product_categories(id),
  department_id UUID REFERENCES departments(id),
  conservation_point_id UUID REFERENCES conservation_points(id),
  barcode VARCHAR,
  sku VARCHAR,
  supplier_name VARCHAR,
  purchase_date TIMESTAMP,
  expiry_date TIMESTAMP,
  quantity NUMERIC,
  unit VARCHAR,
  allergens TEXT[],
  label_photo_url VARCHAR,
  notes TEXT,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'consumed', 'waste')),
  compliance_status VARCHAR CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`, `category_id → product_categories.id`, `department_id → departments.id`, `conservation_point_id → conservation_points.id`
**Check Constraints:** `status`, `compliance_status`
**Array/JSON fields:** `allergens` (TEXT[])

#### 10. `tasks`
**Purpose:** General task management
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\utils\onboardingHelpers.ts:1026`

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR NOT NULL,
  description TEXT,
  frequency VARCHAR NOT NULL,
  department_id UUID REFERENCES departments(id),
  conservation_point_id UUID REFERENCES conservation_points(id),
  priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_duration INTEGER, -- minutes
  checklist TEXT[],
  required_tools TEXT[],
  haccp_category VARCHAR,
  next_due TIMESTAMP,
  status VARCHAR DEFAULT 'pending',
  assigned_to VARCHAR,
  assignment_type VARCHAR,
  assigned_to_staff_id UUID REFERENCES staff(id),
  assigned_to_role VARCHAR,
  assigned_to_category VARCHAR,
  documentation_url VARCHAR,
  validation_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`, `department_id → departments.id`, `conservation_point_id → conservation_points.id`, `assigned_to_staff_id → staff.id`
**Check Constraints:** `priority`
**Array/JSON fields:** `checklist` (TEXT[]), `required_tools` (TEXT[])

#### 11. `events` ✅ **Verified from SQL Schema**
**Purpose:** Calendar events and scheduling
**Files:** Missing from current codebase but exists in SQL

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`

#### 12. `notes` ✅ **Verified from SQL Schema**
**Purpose:** General notes and documentation
**Files:** Missing from current codebase but exists in SQL

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`

#### 13. `non_conformities` ✅ **Verified from SQL Schema**
**Purpose:** Non-conformity tracking and management
**Files:** Missing from current codebase but exists in SQL

```sql
CREATE TABLE non_conformities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  severity USER-DEFINED NOT NULL,
  status USER-DEFINED DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id`
**USER-DEFINED Types:** `severity`, `status` (PostgreSQL ENUMs)

#### 14. `shopping_lists` ✅ **Verified from SQL Schema**
**Purpose:** Shopping lists and templates
**Files:** Missing from current codebase but exists in SQL

```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  created_by UUID,
  is_template BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Company_id filtering:** ✅ Required (`.eq('company_id', companyId)`)
**FK Constraints:** `company_id → companies.id` (⚠️ missing in actual schema)

#### 15. `shopping_list_items` ✅ **Verified from SQL Schema**
**Purpose:** Individual items in shopping lists
**Files:** Missing from current codebase but exists in SQL

```sql
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id),
  product_id UUID,
  product_name VARCHAR NOT NULL,
  category_name VARCHAR NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit VARCHAR,
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Company_id filtering:** ⚠️ No direct company_id - filter via shopping_lists join
**FK Constraints:** `shopping_list_id → shopping_lists.id`

### ⚠️ Referenced but Not Verified Tables

Based on code references, these tables are mentioned but need verification:

#### 16. `maintenance_completions`
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useMaintenanceTasks.ts:144`

```sql
-- Schema needs verification
CREATE TABLE maintenance_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  maintenance_task_id UUID NOT NULL REFERENCES maintenance_tasks(id),
  completed_by VARCHAR NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  notes TEXT,
  photos TEXT[],
  next_due TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 17. `training_sessions`
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\hooks\useCalendar.ts:96`

```sql
-- Schema needs verification
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  assigned_to VARCHAR[],
  status VARCHAR DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 18. `inventory_events`
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\hooks\useCalendar.ts:98`

```sql
-- Schema needs verification
CREATE TABLE inventory_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  conservation_point_id UUID REFERENCES conservation_points(id),
  type VARCHAR NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  description TEXT,
  assigned_to VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  priority VARCHAR DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 19. `meetings`
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\hooks\useCalendar.ts:103`

```sql
-- Schema needs verification
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  title VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  attendees VARCHAR[],
  location VARCHAR,
  status VARCHAR DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 20. `email_schedule_logs`
**Files:** `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\services\export\EmailScheduler.ts:456`

```sql
-- Schema needs verification
CREATE TABLE email_schedule_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  email_type VARCHAR NOT NULL,
  recipient VARCHAR NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status VARCHAR DEFAULT 'pending',
  content JSONB,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## PostgreSQL ENUM Types (USER-DEFINED)

The actual SQL schema uses PostgreSQL ENUM types (shown as USER-DEFINED) for several fields. These are custom types that restrict values to predefined options:

### Identified ENUM Types

#### `conservation_points.type`
- **SQL Field:** `type USER-DEFINED NOT NULL`
- **Expected Values:** Based on codebase: `'ambient' | 'fridge' | 'freezer' | 'blast'`
- **Usage:** Classification of conservation point temperature ranges

#### `maintenance_tasks.type`
- **SQL Field:** `type USER-DEFINED NOT NULL`
- **Expected Values:** Based on codebase: `'temperature' | 'sanitization' | 'defrosting'`
- **Usage:** Type of maintenance task to be performed

#### `maintenance_tasks.assignment_type`
- **SQL Field:** `assignment_type USER-DEFINED NOT NULL`
- **Expected Values:** To be determined from codebase
- **Usage:** How the task is assigned (role, individual, etc.)

#### `tasks.assignment_type`
- **SQL Field:** `assignment_type USER-DEFINED NOT NULL`
- **Expected Values:** To be determined from codebase
- **Usage:** How the task is assigned (role, individual, etc.)

#### `non_conformities.severity`
- **SQL Field:** `severity USER-DEFINED NOT NULL`
- **Expected Values:** To be determined from codebase
- **Usage:** Severity level of non-conformity

#### `non_conformities.status`
- **SQL Field:** `status USER-DEFINED DEFAULT 'open'`
- **Expected Values:** To be determined from codebase
- **Usage:** Current status of non-conformity resolution

### Note on ENUM Types

These PostgreSQL ENUM types provide database-level validation but are not directly visible in the schema dump. The application code should handle these as string literals with the expected values.

---

## Schema Validation Notes

### Critical Discrepancies Between Code and Database

#### 1. `temperature_readings` Table Mismatch

**Issue:** Code expects complex temperature reading schema but database has simplified version.

**Actual Schema (6 fields only):**
- `id`, `company_id`, `conservation_point_id`, `temperature`, `recorded_at`, `created_at`

**Code Expects But Missing:**
- `target_temperature`, `tolerance_range_min`, `tolerance_range_max`
- `status`, `method`, `validation_status`
- `recorded_by`, `notes`, `photo_evidence`

**Impact:** Runtime errors likely when code tries to access non-existent fields.

#### 2. `staff.role` Constraint Mismatch

**Issue:** Documentation claims CHECK constraint but actual SQL has none.

**Actual Schema:** `role character varying NOT NULL` (no CHECK constraint)
**Code Expects:** CHECK constraint with values `('admin', 'responsabile', 'dipendente', 'collaboratore')`

**Impact:** Database accepts any role value; validation is application-level only.

#### 3. Missing Foreign Key in `shopping_lists`

**Issue:** `shopping_lists.company_id` lacks FK constraint to `companies.id`

**Impact:** Potential referential integrity issues.

#### 4. USER-DEFINED Types Not Documented

**Issue:** Several fields use PostgreSQL ENUM types but values are not defined in schema.

**Affected Fields:**
- `conservation_points.type`
- `maintenance_tasks.type` and `assignment_type`
- `tasks.assignment_type`
- `non_conformities.severity` and `status`

**Impact:** Application must enforce valid values without database assistance visibility.

---

## Onboarding Data Mapping

### 1. BusinessInfoStep → `companies`

```typescript
// File: src/utils/onboardingHelpers.ts:818
const companyUpdate = {
  name: businessData.name,           // ✅ AVAILABLE
  address: businessData.address,     // ✅ AVAILABLE
  email: businessData.email,         // ✅ AVAILABLE
  staff_count: staff.length,         // ✅ CALCULATED
  updated_at: new Date().toISOString()
}

// ❌ NOT AVAILABLE in schema:
// - phone (businessData.phone)
// - vat_number (businessData.vat_number)
// - business_type (businessData.business_type)
// - established_date (businessData.established_date)
// - license_number (businessData.license_number)
```

### 2. DepartmentsStep → `departments`

```typescript
// File: src/utils/onboardingHelpers.ts:845
departments.map(dept => ({
  id: dept.id,                       // ✅ Frontend generated
  company_id: companyId,             // ✅ Required parameter
  name: dept.name,                   // ✅ AVAILABLE
  is_active: dept.is_active ?? true, // ✅ AVAILABLE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

### 3. StaffStep → `staff`

```typescript
// File: src/utils/onboardingHelpers.ts:882
staff.map(person => ({
  company_id: companyId,                           // ✅ Required
  name: person.fullName || `${person.name} ${person.surname}`, // ✅ AVAILABLE
  role: person.role,                               // ✅ AVAILABLE
  category: Array.isArray(person.categories)
    ? person.categories[0] || 'Altro'
    : person.category,                             // ✅ AVAILABLE (take first)
  email: person.email || null,                     // ✅ AVAILABLE
  phone: person.phone || null,                     // ✅ AVAILABLE
  hire_date: null,                                 // ⚠️ Not in StaffMember
  status: 'active',                                // ✅ Default
  notes: person.notes || null,                     // ✅ AVAILABLE
  haccp_certification: person.haccpExpiry ? {
    level: 'base',
    expiry_date: person.haccpExpiry,
    issuing_authority: '',
    certificate_number: ''
  } : null,                                        // ✅ AVAILABLE (map from haccpExpiry)
  department_assignments: person.department_assignments, // ✅ AVAILABLE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

### 4. ConservationStep → `conservation_points`

```typescript
// File: src/utils/onboardingHelpers.ts:912
points.map(point => ({
  company_id: companyId,                          // ✅ Required
  department_id: point.departmentId,              // ✅ AVAILABLE
  name: point.name,                               // ✅ AVAILABLE
  setpoint_temp: point.targetTemperature,         // ✅ AVAILABLE (rename)
  type: point.pointType,                          // ✅ AVAILABLE
  product_categories: point.productCategories || [], // ✅ AVAILABLE
  is_blast_chiller: point.isBlastChiller || false,   // ✅ AVAILABLE
  status: 'normal',                               // ✅ Default
  maintenance_due: point.maintenanceDue || null,  // ✅ AVAILABLE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

### 5. TasksStep → `maintenance_tasks` + `tasks`

```typescript
// File: src/utils/onboardingHelpers.ts:981 (maintenance_tasks)
conservationMaintenancePlans.map(plan => ({
  company_id: companyId,                          // ✅ Required
  conservation_point_id: realId,                 // ✅ MAPPED from ID conversion
  type: mapMaintenanceType(plan.manutenzione),    // ✅ MAPPED (IT → EN)
  frequency: mapFrequency(plan.frequenza),        // ✅ MAPPED (IT → EN)
  title: `Manutenzione: ${plan.manutenzione}`,   // ✅ Generated
  description: plan.note || '',                   // ✅ AVAILABLE
  priority: 'medium',                             // ✅ Default
  status: 'scheduled',                            // ✅ Default
  next_due: calculateNextDue(plan.frequenza),    // ✅ CALCULATED
  estimated_duration: 60,                        // ✅ Default
  checklist: [],                                 // ✅ Default
  assigned_to: plan.assegnatoADipendenteSpecifico || plan.assegnatoARuolo || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// File: src/utils/onboardingHelpers.ts:1026 (tasks)
genericTasks.map(task => ({
  company_id: companyId,                          // ✅ Required
  name: task.name,                                // ✅ AVAILABLE
  frequency: mapFrequency(task.frequenza),        // ✅ MAPPED
  description: task.note || '',                   // ✅ AVAILABLE
  department_id: null,                            // ⚠️ Null for generic tasks
  conservation_point_id: null,                   // ⚠️ Null for generic tasks
  priority: 'medium',                             // ✅ Default
  estimated_duration: 60,                        // ✅ Default
  next_due: calculateNextDue(task.frequenza),    // ✅ CALCULATED
  status: 'pending',                              // ✅ Default
  assigned_to: task.assegnatoADipendenteSpecifico || task.assegnatoARuolo || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

### 6. InventoryStep → `product_categories` + `products`

```typescript
// File: src/utils/onboardingHelpers.ts:1044 (product_categories)
categories.map(category => ({
  id: category.id,                        // ✅ Frontend generated
  company_id: companyId,                  // ✅ Required
  name: category.name,                    // ✅ AVAILABLE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// File: src/utils/onboardingHelpers.ts:1081 (products)
products.map(product => ({
  id: product.id,                                 // ✅ Frontend generated
  company_id: companyId,                          // ✅ Required
  name: product.name,                             // ✅ AVAILABLE
  category_id: product.categoryId || null,        // ✅ AVAILABLE
  department_id: product.departmentId || null,    // ✅ AVAILABLE
  conservation_point_id: product.conservationPointId || null, // ✅ AVAILABLE
  barcode: product.barcode || null,               // ✅ AVAILABLE
  sku: product.sku || null,                       // ✅ AVAILABLE
  supplier_name: product.supplierName || null,    // ✅ AVAILABLE
  purchase_date: product.purchaseDate || null,    // ✅ AVAILABLE
  expiry_date: product.expiryDate || null,        // ✅ AVAILABLE
  quantity: product.quantity || null,             // ✅ AVAILABLE
  unit: product.unit || null,                     // ✅ AVAILABLE
  allergens: product.allergens || [],             // ✅ AVAILABLE
  label_photo_url: product.labelPhotoUrl || null, // ✅ AVAILABLE
  notes: product.notes || null,                   // ✅ AVAILABLE
  status: product.status || 'active',             // ✅ AVAILABLE
  compliance_status: product.complianceStatus || null, // ✅ AVAILABLE
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))
```

---

## Runtime Data Operations

### Temperature Readings Creation/Updates

**Hook:** `useTemperatureReadings` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useTemperatureReadings.ts`)

**CREATE Operations:**
```typescript
// Lines 49-77
const createReading = async (data: Omit<TemperatureReading, 'id' | 'company_id' | 'recorded_at' | 'validation_status'>) => {
  const payload = {
    ...data,
    company_id: user.company_id,        // ✅ Company isolation
    recorded_at: new Date().toISOString(),
    validation_status: 'pending'
  }

  await supabase
    .from('temperature_readings')       // ✅ Table: temperature_readings
    .insert([payload])
    .select()
    .single()
}
```

**READ Operations:**
```typescript
// Lines 26-36
const query = supabase
  .from('temperature_readings')         // ✅ Table: temperature_readings
  .select('*')
  .eq('company_id', user.company_id)    // ✅ Company filtering
  .order('recorded_at', { ascending: false })

// Optional conservation point filtering
if (conservationPointId) {
  query = query.eq('conservation_point_id', conservationPointId)
}
```

**UPDATE Operations:**
```typescript
// Lines 89-105
await supabase
  .from('temperature_readings')         // ✅ Table: temperature_readings
  .update(data)
  .eq('id', id)                         // ✅ Record isolation
  .select()
  .single()
```

**DELETE Operations:**
```typescript
// Lines 118-123
await supabase
  .from('temperature_readings')         // ✅ Table: temperature_readings
  .delete()
  .eq('id', id)                         // ✅ Record isolation
```

### Product Inventory Management

**Hook:** `useProducts` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\inventory\hooks\useProducts.ts`)

**CREATE Operations:**
```typescript
// Lines 184-210
const createProduct = async (productData: CreateProductForm) => {
  const payload = {
    ...productData,
    company_id: companyId,              // ✅ Company isolation
    allergens: productData.allergens || [],
    purchase_date: productData.purchase_date?.toISOString() || null,
    expiry_date: productData.expiry_date?.toISOString() || null
  }

  await supabase
    .from('products')                   // ✅ Table: products
    .insert(payload)
    .select()
    .single()
}
```

**READ Operations with Relations:**
```typescript
// Lines 68-94
await supabase
  .from('products')                     // ✅ Table: products
  .select(`
    *,
    product_categories(id, name),       // ✅ JOIN: product_categories
    departments(id, name),              // ✅ JOIN: departments
    conservation_points(id, name)       // ✅ JOIN: conservation_points
  `)
  .eq('company_id', companyId)          // ✅ Company filtering
  .order('created_at', { ascending: false })
```

**UPDATE Operations:**
```typescript
// Lines 227-258
await supabase
  .from('products')                     // ✅ Table: products
  .update(payload)
  .eq('id', id)
  .eq('company_id', companyId)          // ✅ Double security check
  .select()
  .single()
```

**Status Update Operations:**
```typescript
// Lines 305-329
await supabase
  .from('products')                     // ✅ Table: products
  .update({
    status,                             // ✅ Status change
    updated_at: new Date().toISOString()
  })
  .eq('id', id)
  .eq('company_id', companyId)          // ✅ Company filtering
```

### Maintenance Task Execution

**Hook:** `useMaintenanceTasks` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useMaintenanceTasks.ts`)

**CREATE Operations:**
```typescript
// Lines 56-78
const createTask = async (data: Omit<MaintenanceTask, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
  await supabase
    .from('maintenance_tasks')          // ✅ Table: maintenance_tasks
    .insert([{
      ...data,
      checklist: data.checklist ?? [],  // ✅ Array field handling
      company_id: user.company_id       // ✅ Company isolation
    }])
    .select()
    .single()
}
```

**READ Operations with Relations:**
```typescript
// Lines 30-43
await supabase
  .from('maintenance_tasks')            // ✅ Table: maintenance_tasks
  .select(`
    *,
    conservation_point:conservation_points(id, name), // ✅ JOIN
    assigned_user:staff(id, name)       // ✅ JOIN: staff
  `)
  .eq('company_id', user.company_id)    // ✅ Company filtering
  .order('next_due', { ascending: true })
```

**Completion Tracking:**
```typescript
// Lines 137-156
const completeTask = async (completion: Omit<MaintenanceCompletion, 'id' | 'company_id'>) => {
  await supabase
    .from('maintenance_completions')    // ✅ Table: maintenance_completions
    .insert([{
      ...completion,
      company_id: user.company_id       // ✅ Company isolation
    }])
    .select()
    .single()
}
```

### Calendar Events and Task Scheduling

**Hook:** `useCalendarEvents` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\calendar\hooks\useCalendarEvents.ts`)

**CREATE Operations (Calendar → Maintenance Tasks):**
```typescript
// Lines 178-213
const createEvent = async (input: CreateCalendarEventInput) => {
  if (input.type === 'maintenance' && input.conservation_point_id) {
    const payload = {
      company_id: user.company_id,      // ✅ Company isolation
      conservation_point_id: input.conservation_point_id,
      title: input.title,
      instructions: input.description,
      next_due: input.start.toISOString(),
      estimated_duration: Math.ceil((input.end.getTime() - input.start.getTime()) / (1000 * 60)),
      frequency: input.recurring ? 'daily' : 'once',
      priority: input.priority,
      assigned_to: input.assigned_to?.[0],
      status: 'scheduled'
    }

    await supabase
      .from('maintenance_tasks')        // ✅ Table: maintenance_tasks
      .insert([payload])
      .select(`
        *,
        conservation_points(id, name, departments(id, name))
      `)
      .single()
  }
}
```

**READ Operations (Maintenance Tasks → Calendar Events):**
```typescript
// Lines 44-60
await supabase
  .from('maintenance_tasks')            // ✅ Table: maintenance_tasks
  .select(`
    *,
    conservation_points(id, name, departments(id, name)) // ✅ Nested JOIN
  `)
  .eq('company_id', user.company_id)    // ✅ Company filtering
  .order('next_due', { ascending: true })

// Transform to calendar events (lines 89-169)
const calendarEvents = tasks.map(task => ({
  id: `task-${task.id}`,               // ✅ Prefixed ID
  title: task.title || 'Manutenzione',
  start: new Date(task.next_due),
  type: 'maintenance',
  status: task.status === 'completed' ? 'completed' :
          new Date(task.next_due) < new Date() ? 'overdue' : 'pending',
  // ... other transformations
}))
```

### Staff Management

**Hook:** `useStaff` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\management\hooks\useStaff.ts`)

**CREATE Operations:**
```typescript
// Lines 95-119
const createStaffMember = async (input: StaffInput) => {
  await supabase
    .from('staff')                      // ✅ Table: staff
    .insert({
      company_id: companyId,            // ✅ Company isolation
      name: input.name,
      role: input.role,
      category: input.category,
      email: input.email || null,       // ✅ Null handling
      phone: input.phone || null,
      hire_date: input.hire_date || null,
      status: input.status || 'active', // ✅ Default values
      notes: input.notes || null,
      haccp_certification: input.haccp_certification || null, // ✅ JSONB field
      department_assignments: input.department_assignments || null // ✅ Array field
    })
    .select()
    .single()
}
```

### Department Management

**Hook:** `useDepartments` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\management\hooks\useDepartments.ts`)

**CREATE Operations:**
```typescript
// Lines 67-82
const createDepartment = async (input: DepartmentInput) => {
  await supabase
    .from('departments')                // ✅ Table: departments
    .insert({
      company_id: companyId,            // ✅ Company isolation
      name: input.name,
      is_active: input.is_active ?? true // ✅ Default value
    })
    .select()
    .single()
}
```

**Preset Department Creation:**
```typescript
// Lines 200-224
const createPresetDepartments = async () => {
  const presetDepartments = [
    { name: 'Bancone' },
    { name: 'Sala' },
    { name: 'Magazzino' },
    { name: 'Cucina' }
  ]

  await supabase
    .from('departments')                // ✅ Table: departments
    .insert(
      presetDepartments.map(dept => ({
        company_id: companyId,          // ✅ Company isolation
        name: dept.name,
        is_active: true
      }))
    )
    .select()
}
```

### Product Categories Management

**Hook:** `useCategories` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\inventory\hooks\useCategories.ts`)

**CREATE Operations:**
```typescript
// Lines 46-65
const createCategory = async (categoryData: CreateCategoryForm) => {
  await supabase
    .from('product_categories')         // ✅ Table: product_categories
    .insert({
      ...categoryData,
      company_id: companyId             // ✅ Company isolation
    })
    .select()
    .single()
}
```

**DELETE with FK Constraint Check:**
```typescript
// Lines 115-141
const deleteCategory = async (categoryId: string) => {
  // Check if category is used by products
  const { data: productsUsingCategory } = await supabase
    .from('products')                   // ✅ FK constraint verification
    .select('id')
    .eq('category_id', categoryId)
    .eq('company_id', companyId)        // ✅ Company filtering
    .limit(1)

  if (productsUsingCategory && productsUsingCategory.length > 0) {
    throw new Error('Cannot delete category: it is used by products')
  }

  await supabase
    .from('product_categories')         // ✅ Table: product_categories
    .delete()
    .eq('id', categoryId)
    .eq('company_id', companyId)        // ✅ Company filtering
}
```

### Conservation Points Management

**Hook:** `useConservationPoints` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useConservationPoints.ts`)

**CREATE Operations with Automatic Classification:**
```typescript
// Lines 56-122
const createConservationPoint = async ({ conservationPoint, maintenanceTasks }) => {
  // Auto-classify based on temperature
  const typeClassification = classifyConservationPoint(
    conservationPoint.setpoint_temp,
    conservationPoint.is_blast_chiller
  )

  // Create conservation point
  const { data: pointResult } = await supabase
    .from('conservation_points')        // ✅ Table: conservation_points
    .insert([{
      ...conservationPoint,
      company_id: user.company_id,      // ✅ Company isolation
      type: typeClassification          // ✅ Auto-classification
    }])
    .select()
    .single()

  // Create maintenance tasks if any
  if (maintenanceTasks.length > 0) {
    const tasksToInsert = maintenanceTasks.map(task => ({
      company_id: user.company_id,      // ✅ Company isolation
      conservation_point_id: pointResult.id, // ✅ FK relationship
      title: task.title,
      type: task.type,
      frequency: task.frequency,
      estimated_duration: task.estimated_duration,
      assigned_to: task.assigned_to,
      priority: task.priority,
      next_due: task.next_due.toISOString(),
      status: 'scheduled',
      instructions: task.instructions
    }))

    await supabase
      .from('maintenance_tasks')        // ✅ Table: maintenance_tasks
      .insert(tasksToInsert)
  }
}
```

### Offline Storage and Background Sync

**Service:** `BackgroundSync` (`C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\services\offline\BackgroundSync.ts`)

**Temperature Readings Sync:**
```typescript
// Lines 38-40
await supabase
  .from('temperature_readings')         // ✅ Table: temperature_readings
  .insert(payload)
```

**Tasks Sync:**
```typescript
// Lines 58-60
await supabase
  .from('tasks')                        // ✅ Table: tasks
  .insert(payload)
```

**Products Sync:**
```typescript
// Lines 78-80
await supabase
  .from('products')                     // ✅ Table: products
  .insert(payload)
```

**Task Completions Sync:**
```typescript
// Lines 98-100
await supabase
  .from('task_completions')             // ⚠️ Table: task_completions (needs verification)
  .insert(payload)
```

---

## Data Access Patterns

### Query Pattern Summary

| Hook | Primary Table | Relations | Company Filtering | Caching |
|------|---------------|-----------|-------------------|---------|
| `useConservationPoints` | `conservation_points` | `departments` | ✅ Required | React Query (5min stale) |
| `useTemperatureReadings` | `temperature_readings` | None | ✅ Required | React Query (live) |
| `useMaintenanceTasks` | `maintenance_tasks` | `conservation_points`, `staff` | ✅ Required | React Query (5min refetch) |
| `useProducts` | `products` | `product_categories`, `departments`, `conservation_points` | ✅ Required | React Query (live) |
| `useStaff` | `staff` | None | ✅ Required | React Query (5min stale) |
| `useDepartments` | `departments` | None | ✅ Required | React Query (5min stale) |
| `useCategories` | `product_categories` | None | ✅ Required | React Query (live) |
| `useCalendarEvents` | `maintenance_tasks` | `conservation_points`, `departments` | ✅ Required | React Query (5min refetch) |

### Common Query Patterns

#### 1. Company Isolation Pattern
```typescript
// All data queries follow this pattern:
const { data } = await supabase
  .from('table_name')
  .select('*')
  .eq('company_id', user.company_id)  // ✅ Required for all tables
```

#### 2. Relational Data Pattern
```typescript
// Complex joins for rich data display:
const { data } = await supabase
  .from('products')
  .select(`
    *,
    product_categories(id, name),
    departments(id, name),
    conservation_points(id, name)
  `)
  .eq('company_id', companyId)
```

#### 3. Nested Relations Pattern
```typescript
// Multi-level relationships:
const { data } = await supabase
  .from('maintenance_tasks')
  .select(`
    *,
    conservation_points(id, name, departments(id, name))
  `)
  .eq('company_id', user.company_id)
```

#### 4. FK Constraint Verification Pattern
```typescript
// Before deletion, check for references:
const { data: dependencies } = await supabase
  .from('dependent_table')
  .select('id')
  .eq('foreign_key_field', recordId)
  .eq('company_id', companyId)
  .limit(1)

if (dependencies?.length > 0) {
  throw new Error('Cannot delete: record is referenced')
}
```

#### 5. Optimistic Updates Pattern
```typescript
// React Query optimistic updates:
onSuccess: (newData) => {
  queryClient.setQueryData(
    QUERY_KEYS.table(companyId),
    (old: Record[] = []) => [...old, newData]
  )
}
```

#### 6. Cache Invalidation Pattern
```typescript
// Multi-table cache invalidation:
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] })
  queryClient.invalidateQueries({ queryKey: ['conservation-points'] })
  queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
}
```

### Security Patterns

#### 1. Double Security Check Pattern
```typescript
// Update operations with double security:
await supabase
  .from('products')
  .update(data)
  .eq('id', productId)
  .eq('company_id', companyId)  // ✅ Prevents cross-tenant access
```

#### 2. User Context Pattern
```typescript
// Get user context before operations:
const { user } = useAuth()
if (!user?.company_id) {
  throw new Error('No company ID available')
}
```

#### 3. Null Safety Pattern
```typescript
// Safe handling of optional fields:
email: input.email || null,        // ✅ Convert empty string to null
department_assignments: input.department_assignments || null
```

---

## Type Definitions Reference

### Core Database Types

#### From `src/types/inventory.ts`

```typescript
interface Product {
  id: string
  company_id: string                   // ✅ FK to companies
  name: string                         // Required
  category_id?: string                 // FK to product_categories
  department_id?: string               // FK to departments
  conservation_point_id?: string       // FK to conservation_points

  // Identification
  barcode?: string
  sku?: string
  supplier_name?: string

  // Dates & Quantities
  purchase_date?: Date
  expiry_date?: Date
  quantity?: number
  unit?: string

  // Safety & Compliance
  allergens: AllergenType[]            // ✅ Array field
  label_photo_url?: string
  notes?: string

  // Status
  status: 'active' | 'expired' | 'consumed' | 'waste'  // ✅ Check constraint
  compliance_status?: 'compliant' | 'warning' | 'non_compliant'

  // Metadata
  created_at: Date
  updated_at: Date
}

interface ProductCategory {
  id: string
  company_id: string                   // ✅ FK to companies
  name: string
  created_at: Date
  updated_at: Date
}

enum AllergenType {                    // ✅ Used in products.allergens array
  GLUTINE = 'glutine',
  LATTE = 'latte',
  UOVA = 'uova',
  SOIA = 'soia',
  FRUTTA_GUSCIO = 'frutta_guscio',
  ARACHIDI = 'arachidi',
  PESCE = 'pesce',
  CROSTACEI = 'crostacei'
}
```

#### From `src/types/conservation.ts`

```typescript
interface ConservationPoint {
  id: string
  company_id: string                   // ✅ FK to companies
  department_id: string                // ✅ FK to departments
  name: string
  setpoint_temp: number
  type: ConservationPointType          // ✅ Check constraint
  product_categories: string[]         // ✅ Array field
  status: ConservationStatus           // ✅ Check constraint
  last_temperature_reading?: TemperatureReading
  maintenance_due?: Date
  is_blast_chiller: boolean
  created_at: Date
  updated_at: Date

  // Relations
  department?: { id: string; name: string }
  maintenance_tasks?: MaintenanceTask[]
}

type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'
type ConservationStatus = 'normal' | 'warning' | 'critical'

interface TemperatureReading {
  id: string
  company_id: string                   // ✅ FK to companies
  conservation_point_id: string        // ✅ FK to conservation_points
  temperature: number
  target_temperature?: number
  tolerance_range_min?: number
  tolerance_range_max?: number
  status: 'compliant' | 'warning' | 'critical'  // ✅ Check constraint
  recorded_by?: string
  recorded_at: Date
  method: 'manual' | 'digital_thermometer' | 'automatic_sensor'  // ✅ Check constraint
  notes?: string
  photo_evidence?: string
  validation_status?: 'validated' | 'flagged' | 'pending'  // ✅ Check constraint
  created_at: Date
}

interface MaintenanceTask {
  id: string
  company_id: string                   // ✅ FK to companies
  conservation_point_id: string        // ✅ FK to conservation_points
  title: string
  description?: string
  type: MaintenanceType                // ✅ Check constraint
  frequency: MaintenanceFrequency      // ✅ Check constraint
  estimated_duration: number           // minutes
  last_completed?: Date
  next_due: Date
  assigned_to?: string
  priority: 'low' | 'medium' | 'high' | 'critical'  // ✅ Check constraint
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'  // ✅ Check constraint
  checklist?: string[]                 // ✅ Array field
  required_tools?: string[]            // ✅ Array field
  safety_notes?: string[]              // ✅ Array field
  completion_notes?: string
  completed_by?: string
  completed_at?: Date
  created_at: Date
  updated_at: Date
}

type MaintenanceType = 'temperature' | 'sanitization' | 'defrosting'
type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'as_needed' | 'custom'
```

#### From `src/types/calendar.ts`

```typescript
interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end?: Date
  allDay?: boolean

  // Event classification
  type: CalendarEventType              // ✅ Mapped to maintenance_tasks
  status: CalendarEventStatus
  priority: CalendarEventPriority
  source?: 'maintenance' | 'task' | 'training' | 'inventory' | 'meeting' | 'temperature_reading' | 'general_task' | 'custom'
  sourceId?: string

  // Assignment and organization
  assigned_to: string[]                // Staff IDs
  department_id?: string               // ✅ FK to departments
  conservation_point_id?: string       // ✅ FK to conservation_points

  // Recurrence
  recurring: boolean
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
    interval: number
    days_of_week?: number[]
    day_of_month?: number
    end_date?: Date
    max_occurrences?: number
  }

  // Visual styling
  backgroundColor: string
  borderColor: string
  textColor: string

  // Extended metadata
  metadata: CalendarEventMetadata
  extendedProps: Record<string, any>

  // Audit fields
  created_at: Date
  updated_at: Date
  created_by: string
  company_id: string                   // ✅ FK to companies
}

type CalendarEventType = 'maintenance' | 'general_task' | 'temperature_reading' | 'custom'
type CalendarEventStatus = 'pending' | 'completed' | 'overdue' | 'cancelled'
type CalendarEventPriority = 'low' | 'medium' | 'high' | 'critical'
```

#### From `src/features/management/hooks/useStaff.ts`

```typescript
interface StaffMember {
  id: string
  company_id: string                   // ✅ FK to companies
  name: string
  role: 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'  // ✅ Check constraint
  category: string
  email?: string | null
  phone?: string | null
  hire_date?: string | null
  status: 'active' | 'inactive' | 'suspended'  // ✅ Check constraint
  notes?: string | null
  haccp_certification?: HaccpCertification | null  // ✅ JSONB field
  department_assignments?: string[] | null         // ✅ Array field
  created_at: string
  updated_at: string
}

interface HaccpCertification {
  level: 'base' | 'advanced'
  expiry_date: string
  issuing_authority: string
  certificate_number: string
}
```

#### From `src/features/management/hooks/useDepartments.ts`

```typescript
interface Department {
  id: string
  company_id: string                   // ✅ FK to companies
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Onboarding Types

#### From `src/types/onboarding.ts`

```typescript
interface BusinessInfoData {
  name: string
  address: string
  phone: string              // ❌ Not in companies table
  email: string
  vat_number: string         // ❌ Not in companies table
  business_type: string      // ❌ Not in companies table
  established_date: string   // ❌ Not in companies table
  license_number: string     // ❌ Not in companies table
}

interface ConservationPoint {
  id: string
  name: string
  departmentId: string       // ✅ Maps to department_id
  targetTemperature: number  // ✅ Maps to setpoint_temp
  pointType: ConservationPointType  // ✅ Maps to type
  isBlastChiller: boolean    // ✅ Maps to is_blast_chiller
  productCategories: string[]  // ✅ Maps to product_categories
  maintenanceTasks?: ConservationMaintenanceTask[]
  maintenanceDue?: string    // ✅ Maps to maintenance_due
  source: PointSource
}

interface StaffMember {
  id: string
  name: string
  surname: string
  fullName: string           // ✅ Maps to name
  role: StaffRole           // ✅ Maps to role
  categories: string[]       // ✅ Maps to category (take first)
  email?: string
  phone?: string
  department_assignments: string[]  // ✅ Maps to department_assignments
  haccpExpiry?: string      // ✅ Maps to haccp_certification.expiry_date
  notes?: string
}
```

### Enum Reference

```typescript
// Check constraints values by table:

// products.status
type ProductStatus = 'active' | 'expired' | 'consumed' | 'waste'

// products.compliance_status
type ComplianceStatus = 'compliant' | 'warning' | 'non_compliant'

// conservation_points.type
type ConservationPointType = 'ambient' | 'fridge' | 'freezer' | 'blast'

// conservation_points.status
type ConservationStatus = 'normal' | 'warning' | 'critical'

// temperature_readings.status
type TemperatureStatus = 'compliant' | 'warning' | 'critical'

// temperature_readings.method
type TemperatureMethod = 'manual' | 'digital_thermometer' | 'automatic_sensor'

// temperature_readings.validation_status
type ValidationStatus = 'validated' | 'flagged' | 'pending'

// maintenance_tasks.type
type MaintenanceType = 'temperature' | 'sanitization' | 'defrosting'

// maintenance_tasks.frequency
type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually' | 'as_needed' | 'custom'

// maintenance_tasks.priority, tasks.priority
type Priority = 'low' | 'medium' | 'high' | 'critical'

// maintenance_tasks.status
type MaintenanceTaskStatus = 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'skipped'

// staff.role
type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

// staff.status
type StaffStatus = 'active' | 'inactive' | 'suspended'
```

---

## Security & Multi-Tenancy

### Company_id Filtering Checklist

#### ✅ Verified Tables (Company Filtering Implemented)

1. **`departments`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\management\hooks\useDepartments.ts:52`
   ```typescript
   .eq('company_id', companyId)
   ```

2. **`staff`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\management\hooks\useStaff.ts:84`
   ```typescript
   .eq('company_id', companyId)
   ```

3. **`conservation_points`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useConservationPoints.ts:39`
   ```typescript
   .eq('company_id', user.company_id)
   ```

4. **`temperature_readings`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useTemperatureReadings.ts:29`
   ```typescript
   .eq('company_id', user.company_id)
   ```

5. **`maintenance_tasks`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\conservation\hooks\useMaintenanceTasks.ts:37`
   ```typescript
   .eq('company_id', user.company_id)
   ```

6. **`products`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\inventory\hooks\useProducts.ts:92`
   ```typescript
   .eq('company_id', companyId)
   ```

7. **`product_categories`** - `C:\Users\matte.MIO\Documents\GitHub\BHM-v.2\src\features\inventory\hooks\useCategories.ts:32`
   ```typescript
   .eq('company_id', companyId)
   ```

#### ✅ Additional Tables Requiring Company Filtering (From SQL Schema)

8. **`events`** - ⚠️ Needs implementation
   ```typescript
   .eq('company_id', companyId)  // Required but not yet implemented
   ```

9. **`notes`** - ⚠️ Needs implementation
   ```typescript
   .eq('company_id', companyId)  // Required but not yet implemented
   ```

10. **`non_conformities`** - ⚠️ Needs implementation
    ```typescript
    .eq('company_id', companyId)  // Required but not yet implemented
    ```

11. **`shopping_lists`** - ⚠️ Needs implementation
    ```typescript
    .eq('company_id', companyId)  // Required but not yet implemented
    ```

12. **`shopping_list_items`** - ⚠️ Needs implementation via JOIN
    ```typescript
    // No direct company_id - must filter via shopping_lists relationship
    .select('*, shopping_lists!inner(company_id)')
    .eq('shopping_lists.company_id', companyId)
    ```

#### ⚠️ Tables Needing Verification

1. **`maintenance_completions`** - Referenced in `useMaintenanceTasks.ts:144` but filtering not verified
2. **`training_sessions`** - Referenced in `useCalendar.ts:96` but filtering not verified
3. **`inventory_events`** - Referenced in `useCalendar.ts:98` but filtering not verified
4. **`meetings`** - Referenced in `useCalendar.ts:103` but filtering not verified
5. **`email_schedule_logs`** - Referenced in `EmailScheduler.ts:456` but filtering not verified

### RLS Status

⚠️ **Row-Level Security (RLS) is DISABLED** on all tables.

**Reason:** Incompatibility between Supabase RLS policies (which expect Supabase Auth JWT) and Clerk Auth JWT tokens.

**Security Implementation:**
- All queries manually include `.eq('company_id', companyId)` filters
- Double security checks on UPDATE/DELETE operations
- User context validation before all operations

**Files Reference:**
- RLS disabled: See existing `RLS_SOLUTION.md`
- Manual filtering: All hooks in `src/features/*/hooks/`

### Role-based Access Patterns

**Staff Roles and Access:**
```typescript
type StaffRole = 'admin' | 'responsabile' | 'dipendente' | 'collaboratore'

// Role hierarchy (from highest to lowest privilege):
// 1. admin - Full access to all company data
// 2. responsabile - Management access, can assign tasks
// 3. dipendente - Employee access, can complete tasks
// 4. collaboratore - Limited access, view-only for most data
```

**User Context Pattern:**
```typescript
// Get user company context:
const { userProfile } = useAuth()
const companyId = userProfile?.company_id

// Validate before operations:
if (!companyId) {
  throw new Error('Company ID not found')
}
```

### Data Isolation Verification

**Cross-tenant Data Leakage Prevention:**
1. All table queries include company_id filter
2. INSERT operations automatically add company_id
3. UPDATE/DELETE operations verify company_id ownership
4. No direct table access without company context

**Example Security Check:**
```typescript
// Secure update pattern:
await supabase
  .from('products')
  .update(data)
  .eq('id', productId)
  .eq('company_id', companyId)  // ✅ Prevents cross-tenant access
```

---

## Common Patterns & Best Practices

### How to Add a New Table

1. **Create Table with Required Fields:**
```sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),  -- ✅ Required
  name VARCHAR NOT NULL,
  -- other fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **Add TypeScript Interface:**
```typescript
// Add to src/types/domain.ts
interface NewTable {
  id: string
  company_id: string                  // ✅ Required
  name: string
  // other fields
  created_at: Date
  updated_at: Date
}
```

3. **Create Hook with Company Filtering:**
```typescript
// Create src/features/domain/hooks/useNewTable.ts
export const useNewTable = () => {
  const { user, companyId } = useAuth()

  const { data } = useQuery({
    queryKey: ['new-table', companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('No company ID')

      const { data, error } = await supabase
        .from('new_table')
        .select('*')
        .eq('company_id', companyId)    // ✅ Required
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!companyId && !!user
  })
}
```

### Required Fields Checklist

**Every table must have:**
- [x] `id` (UUID, Primary Key)
- [x] `company_id` (UUID, Foreign Key to companies.id)
- [x] `created_at` (Timestamp)
- [x] `updated_at` (Timestamp)

**Every query must have:**
- [x] Company filtering: `.eq('company_id', companyId)`
- [x] Error handling: `if (error) throw error`
- [x] User context validation: `if (!companyId) throw new Error(...)`

**Every mutation must have:**
- [x] Company isolation in INSERT: `company_id: companyId`
- [x] Company verification in UPDATE/DELETE: `.eq('company_id', companyId)`
- [x] Cache invalidation: `queryClient.invalidateQueries(...)`

### Foreign Key Management

**Safe FK Operations:**
```typescript
// 1. Verify parent exists before INSERT
const { data: parentExists } = await supabase
  .from('parent_table')
  .select('id')
  .eq('id', parentId)
  .eq('company_id', companyId)
  .single()

if (!parentExists) {
  throw new Error('Parent record not found')
}

// 2. Check dependencies before DELETE
const { data: dependencies } = await supabase
  .from('child_table')
  .select('id')
  .eq('parent_id', recordId)
  .eq('company_id', companyId)
  .limit(1)

if (dependencies?.length > 0) {
  throw new Error('Cannot delete: record has dependencies')
}
```

### Timestamps Handling

**Automatic Timestamps:**
```typescript
// INSERT - set both timestamps
const payload = {
  ...data,
  company_id: companyId,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// UPDATE - only update updated_at
const updateData = {
  ...changes,
  updated_at: new Date().toISOString()
}
```

### UUID Generation

**Client-side UUID Generation:**
```typescript
// Use crypto.randomUUID() for client-generated UUIDs
const newId = crypto.randomUUID()

// Or let database generate (recommended)
// Just omit 'id' field in INSERT
```

### Array and JSON Field Handling

**Array Fields:**
```typescript
// Always initialize arrays, never null
const payload = {
  checklist: data.checklist || [],    // ✅ Default empty array
  allergens: data.allergens || [],    // ✅ Default empty array
  safety_notes: data.safety_notes || []
}
```

**JSON Fields:**
```typescript
// JSONB fields can be null or object
const staffData = {
  haccp_certification: data.haccpExpiry ? {
    level: 'base',
    expiry_date: data.haccpExpiry,
    issuing_authority: '',
    certificate_number: ''
  } : null                            // ✅ Null when not provided
}
```

### Query Optimization Patterns

**Selective Field Loading:**
```typescript
// Only select needed fields for large tables
const { data } = await supabase
  .from('products')
  .select('id, name, status, expiry_date')  // ✅ Only needed fields
  .eq('company_id', companyId)
```

**Pagination for Large Datasets:**
```typescript
// Use range() for pagination
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('company_id', companyId)
  .range(0, 49)                       // ✅ First 50 records
  .order('created_at', { ascending: false })
```

**Smart Caching:**
```typescript
// Different stale times based on data volatility
const { data } = useQuery({
  queryKey: ['departments', companyId],
  queryFn: fetchDepartments,
  staleTime: 5 * 60 * 1000,           // ✅ 5min for stable data
})

const { data } = useQuery({
  queryKey: ['temperature-readings', companyId],
  queryFn: fetchReadings,
  refetchInterval: 30 * 1000,         // ✅ 30sec for live data
})
```

---

## Troubleshooting

### Common Errors

#### 1. Foreign Key Constraint Violations

**Error:** `foreign key constraint "fk_..." violates`

**Causes:**
- Referenced record doesn't exist
- Referenced record belongs to different company
- NULL value in required FK field

**Solutions:**
```typescript
// Verify FK exists before INSERT
const { data: parent } = await supabase
  .from('parent_table')
  .select('id')
  .eq('id', foreignKeyValue)
  .eq('company_id', companyId)
  .single()

if (!parent) {
  throw new Error('Referenced record not found or not accessible')
}
```

#### 2. Company_id Filtering Issues

**Error:** `No company ID available` or unauthorized data access

**Causes:**
- User not properly authenticated
- Missing company_id in user_profiles
- Race condition during auth initialization

**Solutions:**
```typescript
// Check user context before operations
const { user, companyId } = useAuth()

if (!user) {
  throw new Error('User not authenticated')
}

if (!companyId) {
  throw new Error('Company ID not found - user may need profile setup')
}

// Use enabled flag in queries
const { data } = useQuery({
  queryKey: ['data', companyId],
  queryFn: fetchData,
  enabled: !!user && !!companyId     // ✅ Prevent premature execution
})
```

#### 3. Schema Mismatch Issues

**Error:** `column "..." does not exist`

**Causes:**
- TypeScript interface doesn't match database schema
- Missing database migrations
- Using onboarding types instead of database types

**Solutions:**
```typescript
// Use database-specific types
interface DatabaseProduct {
  // Use exact database column names
  setpoint_temp: number           // ✅ Database: setpoint_temp
  // Not: targetTemperature        // ❌ Onboarding only
}

// Transform at boundary
const dbProduct = {
  setpoint_temp: onboardingData.targetTemperature  // ✅ Convert at insert
}
```

#### 4. Array/JSON Field Errors

**Error:** `malformed array literal` or `invalid JSON`

**Causes:**
- Passing undefined/null to array fields
- Invalid JSON structure in JSONB fields
- String values where arrays expected

**Solutions:**
```typescript
// Safe array handling
const payload = {
  allergens: data.allergens?.length ? data.allergens : [],  // ✅ Default empty
  checklist: Array.isArray(data.checklist) ? data.checklist : []
}

// Safe JSON handling
const staffData = {
  haccp_certification: data.haccpCert ?
    JSON.parse(JSON.stringify(data.haccpCert)) : // ✅ Ensure valid JSON
    null
}
```

#### 5. Check Constraint Violations

**Error:** `check constraint "..." violates`

**Causes:**
- Invalid enum values
- Status values not in allowed list
- Business logic violations

**Solutions:**
```typescript
// Validate enum values before insert
const VALID_STATUSES = ['active', 'expired', 'consumed', 'waste']

if (!VALID_STATUSES.includes(status)) {
  throw new Error(`Invalid status: ${status}. Must be one of: ${VALID_STATUSES.join(', ')}`)
}
```

### Migration Notes

#### Schema Evolution Checklist

1. **Adding New Columns:**
   - Add DEFAULT values for non-nullable columns
   - Update TypeScript interfaces
   - Update all INSERT statements

2. **Removing Columns:**
   - Check for dependencies in code
   - Update TypeScript interfaces
   - Remove from SELECT statements

3. **Changing Column Types:**
   - Ensure data compatibility
   - Update validation logic
   - Test with existing data

4. **Adding Check Constraints:**
   - Validate existing data first
   - Update enum types in TypeScript
   - Add validation in forms

#### Breaking Changes Tracking

**v2.0 → v3.0 Changes:**
- Added `validation_status` to `temperature_readings`
- Added `safety_notes` array to `maintenance_tasks`
- Added `compliance_status` to `products`
- Changed `targetTemperature` → `setpoint_temp` in `conservation_points`

### Performance Considerations

#### Query Performance

**Slow Queries:**
```sql
-- Add indexes for common filters
CREATE INDEX idx_products_company_status ON products(company_id, status);
CREATE INDEX idx_temperature_readings_point_date ON temperature_readings(conservation_point_id, recorded_at);
CREATE INDEX idx_maintenance_tasks_due ON maintenance_tasks(company_id, next_due);
```

**N+1 Query Problems:**
```typescript
// ❌ Bad: N+1 queries
products.forEach(async product => {
  const category = await getCategory(product.category_id)
})

// ✅ Good: Single query with relations
const { data } = await supabase
  .from('products')
  .select(`
    *,
    product_categories(id, name)
  `)
```

#### Memory Management

**Large Datasets:**
```typescript
// Use pagination for large tables
const PAGE_SIZE = 50

const { data } = await supabase
  .from('temperature_readings')
  .select('*')
  .eq('company_id', companyId)
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('recorded_at', { ascending: false })
```

#### Cache Strategy

**Optimal Cache Times:**
- **Static Data** (departments, categories): 5+ minutes
- **Semi-static** (staff, conservation points): 2-5 minutes
- **Dynamic Data** (temperatures, tasks): 30 seconds - 2 minutes
- **Real-time** (notifications, alerts): No cache or 10-30 seconds

---

## 🔄 Reset & Purge System

### Reset App Function

**File:** `src/utils/onboardingHelpers.ts:653`

The `resetApp()` function provides complete application reset:

**Operations:**
1. ✅ Get `company_id` from `user_profiles`
2. ✅ Call `supabase.rpc('purge_company_data')` to delete DB data
3. ✅ Clear localStorage + sessionStorage
4. ✅ Clear React Query cache (`window.queryClient.clear()`)
5. ✅ Hard reload page

### Database Purge Function

**File:** `supabase/purge-company-data.sql`

SQL function `purge_company_data(p_company_id uuid)`:
- Deletes all company data in FK-safe order
- Handles 15+ tables with dependencies
- Returns JSON statistics of deleted records
- **Does NOT delete** `companies` or `user_profiles`

**Deletion Order (FK-safe):**
1. `temperature_readings`
2. `shopping_list_items`
3. `products`
4. `maintenance_tasks`, `tasks`
5. `events`, `notes`, `non_conformities`
6. `shopping_lists`
7. `product_categories`
8. `conservation_points`
9. `UPDATE user_profiles SET staff_id = NULL`
10. `staff`
11. `departments`

---

## 📚 Related Documentation

- **`MAPPING_COMPLIANCE_REPORT.md`** - Schema compliance audit
- **`RLS_SOLUTION.md`** - Row-Level Security with Clerk Auth
- **`RESET_APP_GUIDE.md`** - Complete reset system guide

---

**Document Updated By:** Claude Code
**Version:** 3.1
**Last Updated:** 2025-10-07
**Changes v3.1:**
- Fixed `temperature_readings` schema to match actual simplified SQL structure
- Added 5 missing tables from SQL schema: `events`, `notes`, `non_conformities`, `shopping_lists`, `shopping_list_items`
- Added PostgreSQL ENUM Types section documenting USER-DEFINED types
- Added Schema Validation Notes section highlighting critical discrepancies
- Updated security checklist to include all SQL schema tables
- Corrected staff.role constraint documentation (no DB-level constraint exists)
**Next Update:** When schema changes or new tables are added
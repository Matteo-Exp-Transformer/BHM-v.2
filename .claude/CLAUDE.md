# BHM v.2 - Business HACCP Manager

## Project Context
Progressive Web App per gestione sicurezza alimentare HACCP in ristoranti e attività alimentari. Architettura multi-tenant con Supabase.

## Tech Stack
- **Frontend**: React 18.3 + TypeScript 5.6 + Vite 5.4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + RLS)
- **UI**: TailwindCSS 3.4 + Radix UI + Lucide Icons
- **State**: TanStack React Query 5.62
- **Testing**: Vitest 2.1 (unit) + Playwright 1.56 (e2e)
- **Build**: Vite + PWA plugin + Sentry

## Architecture

```
src/
├── features/       # Feature modules organized by business domain
│   ├── auth/       # Authentication (login, register, invites, password recovery)
│   ├── calendar/   # Calendar system with events aggregation
│   ├── conservation/ # Temperature monitoring & HACCP compliance
│   ├── dashboard/  # Analytics dashboard with KPIs
│   ├── inventory/  # Product & category management
│   ├── management/ # Staff & department management
│   ├── settings/   # Application settings
│   └── shopping/   # Shopping lists & orders
├── components/     # Shared UI components
│   ├── ui/         # Base UI components (Radix-based)
│   ├── layouts/    # Layout components
│   └── onboarding-steps/ # Onboarding wizard steps
├── hooks/          # Global custom React hooks
├── services/       # Business logic services
│   ├── auth/       # Auth services
│   ├── export/     # Report generation (PDF)
│   ├── integration/ # External integrations
│   ├── multi-tenant/ # Multi-company logic
│   ├── realtime/   # Real-time alerts
│   └── security/   # Security services (CSRF, audit, compliance)
├── types/          # TypeScript type definitions
├── lib/            # External library configs
│   ├── supabase/   # Supabase client
│   └── sentry/     # Error tracking
└── utils/          # Utility functions
```

## Key Files
- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Auth**: `src/hooks/useAuth.ts` (multi-company, role-based permissions)
- **Supabase**: `src/lib/supabase/client.ts`
- **Types**: `src/types/*.ts`
- **Bug Tracking**: `/BUG_TRACKER.md` (single source of truth for issues)

## Conventions

### File Naming
- **Components**: PascalCase (`Button.tsx`, `LoginPage.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useCalendar.ts`)
- **Utils**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Types**: PascalCase (`UserType`, `AuthError`)

### Code Organization
- **Path alias**: `@/` = `src/`
- **Feature structure**: `features/[name]/components/`, `hooks/`, `utils/`
- **Import order**: External libs → Internal absolute (@/) → Relative
- **TypeScript**: Strict mode enabled, explicit return types for public functions

## Commands

```bash
# Development
npm run dev          # Dev server :3000
npm run dev:multi    # 3 instances for multi-agent testing

# Testing  
npm run test         # Vitest unit tests
npm run test:coverage # Coverage report
npm run test:e2e     # Playwright E2E
npm run test:agent1  # Agent 1 UI-Base tests
npm run test:agent2  # Agent 2 Forms tests
npm run test:agent3  # Agent 3 Business Logic tests
npm run test:agent5  # Agent 5 Navigation tests

# Build & Quality
npm run build        # Production build
npm run build:clean  # Clean + build
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix linting
npm run type-check   # TypeScript check
```

## Bug Tracking

**Single file**: `/BUG_TRACKER.md` - Always update this file instead of creating new documentation.

Current critical issues tracked:
- 35 TODO items across codebase
- 3 HIGH/MEDIUM severity bugs

## Database

### Supabase Setup
- **PostgreSQL** with Row Level Security (RLS) enabled
- **Multi-tenant**: `company_id` column on all tables
- **Auth**: `company_members` table for role assignments
- **Migrations**: Located in `database/` folder

### Tables Structure
- `companies` - Company profiles
- `company_members` - User-company relationships with roles
- `staff` - Staff directory with HACCP certifications
- `departments` - Department organization
- `conservation_points` - Temperature monitoring points
- `temperature_readings` - Temperature logs
- `products` - Product inventory
- `product_categories` - Product categorization
- `generic_tasks` - Calendar tasks/events
- `company_calendar_settings` - Calendar configuration

## Current State

### Working Features
- ✅ **Auth**: Login, registration, multi-company, password recovery
- ✅ **Onboarding**: 8-step wizard with validation
- ✅ **Calendar**: Event aggregation, filters, recurring tasks
- ✅ **Inventory**: Products & categories with HACCP constraints
- ✅ **Dashboard**: KPIs, compliance stats, temperature monitoring
- ✅ **Management**: Staff & department CRUD

### Partial/In Progress
- ⚠️ **Conservation**: Temperature tracking works, but DB schema missing `method` field for readings
- ⚠️ **Export**: Basic PDF generation, needs corrective actions & training tracking
- ⚠️ **Shopping**: Basic lists, needs order management

### Known Issues

See `/BUG_TRACKER.md` for complete list. Critical items:

1. **CalendarPage.tsx**: 1095 lines - needs decomposition into:
   - `useCalendarStats.ts` hook
   - `useCalendarRefresh.ts` hook  
   - `CalendarStatsPanel.tsx` component
   - `CalendarQuickOverview.tsx` component

2. **Supabase Client**: Uses `any` type - needs proper type generation:
   ```bash
   npx supabase gen types typescript --project-id [ID] > src/types/database.types.ts
   ```

3. **Conservation DB Schema**: Missing `method` field on `temperature_readings` table

4. **window.location.reload()**: Used in `CalendarPage.tsx` line 381 - should use query invalidation

## Development Guidelines

### When Adding Features
1. Create feature module in `src/features/[name]/`
2. Add types in `src/types/[name].ts`
3. Create tests in `__tests__/` subdirectory
4. Update `/BUG_TRACKER.md` with any TODOs
5. Run `npm run type-check` and `npm run lint`

### Testing Strategy
- **Unit tests**: 85%+ coverage target for business logic
- **E2E tests**: Critical user flows only
- **Test data**: Use `prefillOnboarding()` helper for seed data

### Security Considerations
- All API calls go through Supabase RLS
- CSRF tokens for sensitive operations (`CSRFService`)
- Audit logging for compliance (`AuditLogger`)
- Role-based permissions via `useAuth` hook

## Common Patterns

### Data Fetching
```typescript
// Use React Query for all API calls
const { data, isLoading, error } = useQuery({
  queryKey: ['products', companyId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
    if (error) throw error
    return data
  }
})
```

### Mutations
```typescript
const mutation = useMutation({
  mutationFn: async (product: Product) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
    if (error) throw error
    return data
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success('Product created')
  }
})
```

### Permissions
```typescript
const { hasRole, hasPermission } = useAuth()

// Check single role
if (hasRole('admin')) { ... }

// Check multiple roles
if (hasRole(['admin', 'responsabile'])) { ... }

// Check permission
if (hasPermission('write:staff')) { ... }
```

## Troubleshooting

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Database Issues
- Check RLS policies in Supabase dashboard
- Verify `company_id` is correctly set in queries
- Check user role in `company_members` table

### Testing Issues
- Run tests in headed mode: `npm run test:e2e -- --headed`
- Check test screenshots in `test-results/`
- Use `screen.debug()` in Vitest for DOM inspection

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Radix UI](https://www.radix-ui.com/)
- [Playwright](https://playwright.dev/)

---

**Last Updated**: 2026-01-06  
**Maintainer**: BHM v.2 Team





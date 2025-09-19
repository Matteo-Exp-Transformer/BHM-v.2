# HACCP Business Manager - Frontend Structure

## 📁 Directory Structure

```
src/
├── 📄 App.tsx                    # Main app component with routing
├── 📄 App.test.tsx              # App tests
├── 📄 main.tsx                  # Entry point with providers setup
├── 📄 Router.tsx                # Router configuration
│
├── 📂 components/
│   └── 📂 layouts/
│       └── 📄 MainLayout.tsx    # Main layout with tab navigation
│
├── 📂 features/
│   └── 📂 auth/
│       ├── 📄 HomePage.tsx      # Dashboard/home page
│       └── 📄 LoginPage.tsx     # Clerk authentication page
│
├── 📂 lib/
│   └── 📄 sentry.ts             # Sentry error monitoring setup
│
├── 📂 styles/
│   └── 📄 index.css             # Global styles and Tailwind
│
├── 📂 test/
│   └── 📄 setup.ts              # Test configuration
│
└── 📂 types/
    └── 📄 env.d.ts              # Environment variables types
```

## 🔧 Key Files for Backend Integration

### **1. Authentication Setup**

- **`main.tsx`**: ClerkProvider configuration
- **`src/features/auth/LoginPage.tsx`**: Clerk SignIn component
- **`src/features/auth/HomePage.tsx`**: UserButton and user data

### **2. Routing & Layout**

- **`App.tsx`**: Main routing with protected routes
- **`src/components/layouts/MainLayout.tsx`**: Tab navigation (6 tabs)

### **3. Missing Backend Integration Files**

The following files need to be created for Supabase integration:

```
src/lib/supabase/
├── client.ts                    # Supabase client configuration
├── types.ts                     # Database types from schema
└── auth.ts                      # Auth helpers (optional)
```

## 🎯 Integration Points

### **Authentication Flow**

1. User visits `/login` → `LoginPage.tsx`
2. Clerk handles authentication
3. Redirects to `/` → `HomePage.tsx` (protected)
4. `MainLayout.tsx` provides navigation

### **Database Integration Needed**

- Supabase client setup in `src/lib/supabase/`
- Type definitions from `supabase-schema.sql`
- API calls for CRUD operations
- User profile management

### **Current State**

- ✅ Frontend structure complete
- ✅ Authentication UI ready
- ✅ Navigation implemented
- ❌ Backend integration missing
- ❌ Database operations missing

## 📋 Next Steps for Backend Agent

1. **Create Supabase client** (`src/lib/supabase/client.ts`)
2. **Generate types** from schema (`src/lib/supabase/types.ts`)
3. **Implement API functions** for each table
4. **Add user profile management**
5. **Connect frontend to backend**

## 🔗 Related Files

- **Database Schema**: `supabase-schema.sql` (root)
- **Environment**: `env.example` (root)
- **Package Config**: `package.json` (root)
- **Deploy Config**: `vercel.json` (root)

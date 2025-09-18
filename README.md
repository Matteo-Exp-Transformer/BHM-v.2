# 🍽️ HACCP Business Manager

A Progressive Web App (PWA) for digitalizing food safety management in restaurants, ensuring HACCP compliance through guided workflows, automatic monitoring, and complete audit trails.

## 🚀 Features

- **📱 Mobile-First PWA**: Works offline, installable on any device
- **🔐 Multi-tenant Architecture**: Complete data isolation per company
- **👥 Role-Based Access Control**: Admin, Manager, Employee roles
- **📊 Real-time Dashboard**: Compliance scores and KPIs
- **📅 Unified Calendar**: Tasks and maintenance scheduling
- **🌡️ Temperature Monitoring**: Automated alerts and logging
- **📦 Inventory Management**: Expiry tracking and shopping lists
- **📄 HACCP Compliance Reports**: Export-ready documentation
- **🔄 Offline Sync**: Work without internet, sync when connected

## 🛠️ Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **PWA**: Workbox + Service Workers
- **Calendar**: FullCalendar
- **Charts**: Chart.js
- **PDF Generation**: jsPDF

## 📋 Prerequisites

- Node.js 18.x or 20.x LTS
- pnpm (recommended) or npm
- Git
- Supabase account
- Clerk account

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Matteo-Exp-Transformer/BHM-v.2.git
   cd BHM-v.2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase and Clerk credentials.

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
haccp-business-manager/
├── src/
│   ├── components/      # Reusable React components
│   ├── features/        # Feature-based modules
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript types
│   └── styles/         # Global styles
├── public/             # Static assets
├── supabase/           # Database configuration
├── tests/              # Test files
└── docs/               # Documentation
```

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## 📦 Building for Production

```bash
# Create production build
pnpm build

# Preview production build
pnpm preview
```

## 🚀 Deployment

The app is configured for deployment on Vercel. Push to the main branch to trigger automatic deployment.

## 📖 Documentation

- [Development Guide](./docs/development/README.md)
- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/deployment/README.md)

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ for the restaurant industry to ensure food safety and HACCP compliance.
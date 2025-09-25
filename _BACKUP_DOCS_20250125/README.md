# 🍽️ HACCP Business Manager

A modern Progressive Web App (PWA) designed to revolutionize food safety management in the restaurant industry. Built with React, TypeScript, and Supabase.

## 🎯 Overview

HACCP Business Manager digitalizes HACCP compliance processes, making food safety management intuitive, efficient, and accessible for restaurant staff at all levels.

### Key Features

- **📱 Mobile-First Design**: Optimized for smartphones and tablets
- **🔄 Offline Support**: Critical functions work without internet
- **📊 Real-Time Dashboard**: Live updates and notifications
- **✅ HACCP Compliance**: Built around food safety regulations
- **👥 Multi-User Support**: Role-based access control
- **📈 Analytics**: Compliance scoring and performance tracking

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand + React Query
- **Authentication**: Clerk
- **Backend**: Supabase (PostgreSQL)
- **PWA**: Service Worker with Workbox
- **Testing**: Vitest + React Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x LTS
- npm or pnpm (pnpm recommended)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/haccp-business-manager.git
   cd haccp-business-manager
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your service credentials:
   - Supabase project URL and keys
   - Clerk authentication keys
   - Optional: Sentry DSN, PostHog key

4. **Start development server**

   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Production build
pnpm preview      # Preview production build

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format with Prettier

# Testing
pnpm test         # Run unit tests
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Run tests with coverage
```

### Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Base UI components
│   ├── forms/          # Form components
│   └── layouts/        # Layout components
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── onboarding/    # Onboarding flow
│   ├── conservation/  # Temperature management
│   ├── tasks/         # Task management
│   └── inventory/     # Inventory system
├── hooks/             # Custom React hooks
├── lib/               # Utilities and helpers
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── styles/            # Global styles
```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
pnpm test

# With coverage
pnpm test:coverage

# Interactive UI
pnpm test:ui
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build

```bash
pnpm build
```

The `dist/` directory contains the production build ready for deployment.

## 🌟 Core Features

### User Roles

- **Administrator**: Full system access, user management
- **Manager**: Operational oversight, task assignment
- **Employee**: Task execution, data entry

### Main Modules

- **🏠 Dashboard**: Real-time compliance overview
- **❄️ Conservation**: Temperature monitoring and alerts
- **✅ Tasks**: Maintenance and general task management
- **📦 Inventory**: Product tracking and expiry management
- **⚙️ Settings**: System configuration
- **👥 Management**: User and department administration

## 🔒 Security & Compliance

- **Authentication**: Secure JWT-based auth with Clerk
- **Data Security**: Row-level security (RLS) in Supabase
- **HACCP Compliance**: Built-in regulatory compliance features
- **Audit Trail**: Complete activity logging
- **Data Retention**: Configurable data retention policies

## 📱 PWA Features

- **Offline Support**: Core functions work without internet
- **Install Prompt**: Add to home screen capability
- **Push Notifications**: Real-time alerts and reminders
- **Background Sync**: Automatic data synchronization
- **Responsive Design**: Works on all device sizes

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## 🗺️ Roadmap

- [ ] **Phase 1**: Core HACCP compliance features
- [ ] **Phase 2**: Advanced analytics and reporting
- [ ] **Phase 3**: AI-powered insights and automation
- [ ] **Phase 4**: Multi-location support
- [ ] **Phase 5**: Third-party integrations

## 🙏 Acknowledgments

- HACCP guidelines and food safety regulations
- React and TypeScript communities
- Supabase for the excellent backend platform
- All contributors and testers

---

**Made with ❤️ for food safety professionals**

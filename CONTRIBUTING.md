# 🤝 Contributing to HACCP Business Manager

Thank you for your interest in contributing to HACCP Business Manager! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 📜 Code of Conduct

This project follows a code of conduct that we expect all contributors to follow. Please be respectful, inclusive, and constructive in all interactions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or 20.x LTS
- npm 9.0+
- Git 2.40+
- VS Code (recommended)

### Development Setup

1. **Fork the repository**

   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/BHM-v.2.git
   cd BHM-v.2
   ```

2. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/Matteo-Exp-Transformer/BHM-v.2.git
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment**

   ```bash
   cp env.example .env.local
   # Configure your environment variables
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔄 Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to express interest
- Wait for assignment before starting work

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Follow the coding standards
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Changes

Use conventional commits:

```bash
git commit -m "feat(auth): add login functionality"
git commit -m "fix(ui): resolve button alignment issue"
git commit -m "docs: update API documentation"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new components
- Define proper interfaces and types
- Avoid `any` type usage
- Use strict type checking

### React Components

```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary'
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  children,
  onClick
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ❌ Bad
export const Button = ({ variant, children, onClick }) => {
  return <button onClick={onClick}>{children}</button>
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `camelCase.ts` (e.g., `useUserData.ts`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `userTypes.ts`)

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from 'react'

// 2. Third-party libraries
import { z } from 'zod'
import { toast } from 'react-toastify'

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

// 4. Relative imports
import './Component.css'
```

### CSS/Styling

- Use Tailwind CSS classes
- Create custom components for reusable styles
- Follow mobile-first responsive design
- Use CSS variables for theming

```typescript
// ✅ Good - Tailwind classes
<div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">

// ✅ Good - Custom component
<Card className="p-6">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
</Card>
```

## 🧪 Testing Guidelines

### Unit Tests

- Test all utility functions
- Test custom hooks
- Test component behavior, not implementation
- Aim for >80% code coverage

```typescript
// Example test
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests

- Test API interactions
- Test state management
- Test user workflows

### E2E Tests

- Test critical user paths
- Test mobile responsiveness
- Test offline functionality

## 📋 Pull Request Process

### Before Submitting

- [ ] Code follows project standards
- [ ] All tests pass (`npm test`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format

### PR Template

When creating a PR, please include:

1. **Description**: What changes were made and why
2. **Type**: Bug fix, feature, documentation, etc.
3. **Testing**: How the changes were tested
4. **Screenshots**: If UI changes were made
5. **Checklist**: Confirm all requirements are met

### Review Process

- All PRs require at least one review
- Address feedback promptly
- Keep PRs focused and small when possible
- Update PR description if scope changes

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template and include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Use the feature request template and include:

- Clear description of the feature
- Use case and benefits
- Potential implementation approach
- HACCP compliance impact (if applicable)

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority

## 🏗️ Project Architecture

### Component Structure

```
src/components/
├── ui/                 # Base UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── Card/
├── forms/              # Form components
├── layouts/            # Layout components
└── features/           # Feature-specific components
    ├── auth/
    ├── conservation/
    └── tasks/
```

### State Management

- Use Zustand for global state
- Use React Query for server state
- Use local state for component-specific data
- Keep state as close to where it's used as possible

### API Layer

- All API calls go through service layer
- Use React Query for caching and synchronization
- Implement proper error handling
- Use TypeScript for API responses

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Testing Library Docs](https://testing-library.com/docs/)

## ❓ Questions?

- Check existing [GitHub Discussions](https://github.com/Matteo-Exp-Transformer/BHM-v.2/discussions)
- Create a new discussion for questions
- Join our community chat (if available)

---

Thank you for contributing to HACCP Business Manager! 🎉

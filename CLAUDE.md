# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Commands:**

- `npm run dev` - Start development server with Turbopack (faster builds)
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

**Note:** Always run `npm run lint` after making changes to ensure code quality before committing.

## Architecture Overview

This is a **Next.js 15** dashboard application built with **TypeScript** that provides a comprehensive web interface for managing **Typesense** search engine instances. The application uses **App Router** with server components for optimal performance.

### Core Architecture Patterns

**1. App Router Structure:**

- `/app/(app)/` - Main authenticated application routes with shared layout
- `/app/layout.tsx` - Root layout with theme providers
- `/app/(app)/layout.tsx` - Dashboard layout with sidebar and header
- Routes are organized by feature: `/collections/`, `/documents/`, `/search/`, `/metrics/`, etc.

**2. Component Organization:**

- `/components/features/` - Feature-specific components organized by domain
- `/components/ui/` - Shadcn/ui reusable UI components (buttons, cards, forms, etc.)
- `/components/layout/` - Layout components (header, footer, breadcrumbs)
- `/components/sidebar/` - Sidebar navigation components

**3. Typesense Integration Layer:**

- `/lib/typesense/` - **Centralized Typesense functions** (consolidated from actions)
- `/lib/typesense/typesense-client.ts` - Main Typesense client configuration
- `/lib/typesense/index.ts` - Export barrel for easy imports
- All Typesense operations use the centralized client with environment-based configuration

### Key Architectural Decisions

**Typesense Client:**

- Single client instance in `/lib/typesense/typesense-client.ts`
- Environment variables: `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY`
- 60-second connection timeout for stability
- All functions return standardized `{success, data, error}` patterns where applicable

**State Management:**

- React Server Components for data fetching (collections loaded in layout)
- Client-side state with React hooks and local storage utilities
- Theme management via `next-themes` with system preference detection

**Form Handling:**

- React Hook Form with Zod validation throughout the application
- Consistent form patterns in `/components/features/` components

**UI Framework:**

- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom design system
- Responsive design with mobile-first approach

## Environment Configuration

Required environment variables:

```
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Default values are provided in `next.config.ts` for development.

## Typesense Function Library

The `/lib/typesense/` directory contains comprehensive Typesense functionality:

**Collections:** CRUD operations, bulk import/export, schema updates
**Documents:** Search, CRUD, bulk operations, multi-search
**Advanced Features:** Natural language search models, aliases, analytics rules, search overrides, stopwords
**Management:** API keys, cluster health, metrics monitoring

**Import Pattern:**

```typescript
import { createDocument, getCollections, multiSearch } from '@/lib/typesense';
```

## File Organization Principles

**Feature-Based Structure:** Components are organized by domain (collections, documents, search, analytics)
**Colocation:** Related components, hooks, and utilities are kept together
**Barrel Exports:** Index files provide clean import paths
**Server vs Client:** Clear separation between server components (data fetching) and client components (interactivity)

## Development Notes

**Turbopack:** Both dev and build scripts use `--turbopack` for faster compilation
**TypeScript:** Strict type checking enabled with comprehensive type definitions
**Linting:** ESLint configured with Next.js recommended rules
**Git Hooks:** Husky and lint-staged configured for pre-commit code quality checks
**Responsive Design:** Mobile-first approach with collapsible sidebar navigation

## Common Patterns

**Error Handling:** Consistent error boundaries and toast notifications using Sonner
**Loading States:** Skeleton components and loading indicators throughout the UI
**Navigation:** Breadcrumb navigation and dynamic sidebar with collection listing
**Data Fetching:** Server components for initial data, client components for interactions
**Form Validation:** Zod schemas with React Hook Form for all user inputs

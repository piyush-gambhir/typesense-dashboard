# Typesense Dashboard

A modern, feature-rich web dashboard for managing and monitoring Typesense search infrastructure. Built with Next.js 16, TypeScript, and shadcn/ui components.

## Overview

This dashboard provides a comprehensive interface to manage Typesense collections, documents, search configurations, and cluster operations. It includes intelligent version gating to ensure compatibility with different Typesense server versions.

## Features

### Core Features

- **📊 Metrics & Monitoring**: Real-time cluster metrics, health status, and performance monitoring
- **🗂️ Collection Management**: Create, view, update, and delete collections with full schema management
- **📄 Document Operations**: Browse, search, create, edit, and delete documents within collections
- **🔍 Search Testing**: Interactive search interface with advanced filtering and query options
- **⚙️ Cluster Operations**: Manage cluster snapshots, health checks, and system operations

### Advanced Search Features

- **🎯 Search Presets**: Create and manage reusable search configurations
- **🏷️ Aliases**: Zero-downtime schema changes with collection aliases
- **🔤 Stopwords**: Configure stopwords for improved search relevance
- **📈 Analytics Rules**: Set up search analytics and tracking rules
- **📚 Stemming Dictionaries**: Manage custom stemming rules for better matching
- **🤖 Natural Language Search**: Configure and test AI-powered natural language models
- **💬 Conversational Search**: Manage conversational search capabilities
- **🔗 Synonyms**: Create synonym sets for enhanced search understanding
- **✨ Search Overrides (Curations)**: Fine-tune search results with manual overrides

### User Experience

- **🎨 Modern UI**: Clean, responsive interface built with shadcn/ui and Tailwind CSS v4
- **🌓 Dark Mode**: Full dark mode support with system preference detection
- **📱 Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **♿ Accessibility**: Built with accessibility best practices using Radix UI primitives
- **🔄 Real-time Updates**: Live data updates and instant feedback on operations
- **🚀 Fast Performance**: Optimized with React 19, Next.js 16 App Router, and Turbopack

### Technical Features

- **🔐 Connection Management**: Flexible configuration via environment variables or UI setup
- **🐳 Docker Support**: Ready-to-use Docker configurations for development and production
- **✅ Type Safety**: Full TypeScript coverage for robust development
- **🧪 Testing**: Comprehensive test suite with Vitest
- **📦 Version Gating**: Feature availability based on Typesense server version
- **🔌 Error Handling**: Graceful error handling and user-friendly error messages

---

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router and Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Typesense](https://typesense.org/)** - Fast, typo-tolerant search engine
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Hook Form](https://react-hook-form.com/)** - Performant form handling
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[Vitest](https://vitest.dev/)** - Fast unit testing framework
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code-powered code editor
- **[Recharts](https://recharts.org/)** - Composable charting library

---

## Project Structure

```bash
typesense-dashboard/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Main application routes
│   │   ├── aliases/             # Collection alias management
│   │   ├── analytics-rules/     # Analytics rules configuration
│   │   ├── cluster-operations/  # Cluster management
│   │   ├── collections/         # Collection management
│   │   ├── conversations/       # Conversational search
│   │   ├── metrics/             # Dashboard overview & metrics
│   │   ├── nl-search-models/    # Natural language search models
│   │   ├── nl-search-test/      # NL search testing interface
│   │   ├── search-presets/      # Search preset management
│   │   ├── settings/            # Application settings
│   │   ├── stemming/            # Stemming dictionaries
│   │   └── stopwords/           # Stopword management
│   ├── api/                     # API routes
│   ├── connection-error/        # Connection error page
│   └── setup/                   # Initial setup wizard
├── components/
│   ├── features/                # Feature-specific components
│   ├── layout/                  # Layout components (header, footer)
│   ├── shared/                  # Shared utility components
│   ├── sidebar/                 # Sidebar navigation
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── typesense/               # Typesense API wrappers
│   │   ├── collections.ts       # Collection operations
│   │   ├── documents.ts         # Document operations
│   │   ├── aliases.ts           # Alias management
│   │   ├── search-overrides.ts  # Search curations
│   │   ├── synonyms.ts          # Synonym management
│   │   ├── stopwords.ts         # Stopword management
│   │   ├── analytics-rules.ts   # Analytics configuration
│   │   ├── stemming.ts          # Stemming dictionaries
│   │   ├── nl-search-models.ts  # Natural language models
│   │   ├── conversations.ts     # Conversational search
│   │   ├── cluster-*.ts         # Cluster operations
│   │   ├── version.ts           # Version detection & gating
│   │   └── typesense-client.ts  # Client initialization
│   └── utils/                   # Utility functions
├── hooks/                       # Custom React hooks
├── providers/                   # React context providers
├── utils/                       # General utilities
├── __tests__/                   # Test files
└── public/                      # Static assets
```

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- **pnpm** v8 or later (recommended) or npm/yarn
- **Typesense Server** v27.1 or later (local or cloud)

### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/piyush-gambhir/typesense-dashboard.git
cd typesense-dashboard
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Configure Typesense Connection**:

You have two options for configuring your Typesense connection:

#### Option 1: Environment Variables (Recommended for Production)

Create a `.env.local` file in the root directory:

```bash
# Typesense Server Configuration
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=your-admin-api-key

# Application URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Option 2: Setup Wizard (Recommended for Development)

If no environment variables are set, the application will redirect you to a setup wizard at `/setup` where you can configure your connection through the UI. The configuration will be stored in a secure cookie.

4. **Run the development server**:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Docker Deployment

#### Development

```bash
# Build development image
docker build -f Dockerfile.development -t typesense-dashboard:dev .

# Run with script
./start-development.sh
```

#### Production

```bash
# Build production image
docker build -f Dockerfile.production -t typesense-dashboard:prod .

# Run with script
./start-production.sh
```

Or use Docker Compose:

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.prod.yml up
```

---

## Configuration & Features

### Environment Variables

| Variable              | Description               | Required | Default     |
| --------------------- | ------------------------- | -------- | ----------- |
| `TYPESENSE_HOST`      | Typesense server hostname | Yes      | -           |
| `TYPESENSE_PORT`      | Typesense server port     | Yes      | -           |
| `TYPESENSE_PROTOCOL`  | Protocol (http/https)     | Yes      | -           |
| `TYPESENSE_API_KEY`   | Admin API key             | Yes      | -           |
| `NEXT_PUBLIC_APP_URL` | Application URL           | No       | -           |
| `NODE_ENV`            | Environment mode          | No       | development |

### Connection Management

The dashboard includes robust connection handling:

- **Automatic Connection Testing**: Validates server connectivity on startup
- **Connection Error Page**: User-friendly error page with troubleshooting steps at `/connection-error`
- **Setup Wizard**: Interactive setup at `/setup` for first-time configuration
- **Graceful Fallbacks**: Build process succeeds even if server is temporarily unavailable
- **Retry Mechanism**: Easy retry from error pages without restarting the app
- **Cookie-based Config**: Store connection settings in secure cookies for development

### Version Gating

The dashboard intelligently detects your Typesense server version and enables/disables features accordingly:

| Feature                 | Minimum Version |
| ----------------------- | --------------- |
| Collections             | All versions    |
| Aliases                 | All versions    |
| Search Overrides        | All versions    |
| Stopwords               | 27.0            |
| Analytics Rules         | 27.0            |
| Stemming Dictionaries   | 27.0            |
| Search Presets          | 27.1            |
| Natural Language Search | 27.1            |
| Conversational Search   | 28.0            |

Features unavailable on your server version will be automatically hidden from the navigation.

---

## Feature Documentation

### Collections Management

**Location**: `/collections`

Comprehensive collection management interface:

- **List Collections**: View all collections with document counts and schema info
- **Create Collections**: Define schemas with various field types and configurations
- **View Schema**: Inspect field definitions, types, and indexing options
- **Update Collections**: Modify collection settings and field configurations
- **Delete Collections**: Remove collections with confirmation dialogs
- **Search Collections**: Quick search to find collections by name

**API Functions**:

```typescript
import {
    getCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
} from '@/lib/typesense/collections';

// List all collections
const collections = await getCollections();

// Get specific collection
const collection = await getCollection('products');

// Create new collection
const newCollection = await createCollection({
    name: 'products',
    fields: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'float' },
    ],
});

// Delete collection
await deleteCollection('products');
```

### Documents Management

**Location**: `/collections/[name]/documents`

Powerful document management within collections:

- **Browse Documents**: Paginated view of all documents
- **Search Documents**: Full-text search with filtering
- **View Document**: Inspect individual document details
- **Create Document**: Add new documents via form or JSON editor
- **Edit Document**: Update existing documents with Monaco editor
- **Delete Document**: Remove documents with confirmation
- **Bulk Import**: Import multiple documents via JSON/JSONL

**API Functions**:

```typescript
import {
    searchDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from '@/lib/typesense/documents';

// Search documents
const results = await searchDocuments('products', {
    q: 'laptop',
    query_by: 'name,description',
});

// Get specific document
const doc = await getDocument('products', '123');

// Create document
await createDocument('products', {
    id: '124',
    name: 'MacBook Pro',
    price: 2499,
});

// Update document
await updateDocument('products', '124', { price: 2299 });

// Delete document
await deleteDocument('products', '124');
```

### Search Presets

**Location**: `/search-presets`

**Requires**: Typesense 27.1+

Create and manage reusable search configurations:

- **Preset Templates**: Save common search configurations
- **Query Parameters**: Pre-configure query_by, sort_by, filter_by
- **Pagination Settings**: Set default per_page and search limits
- **Typo Tolerance**: Configure typo tolerance settings
- **Grouping**: Set up result grouping configurations

### Collection Aliases

**Location**: `/aliases`

Zero-downtime schema changes and collection versioning:

- **Create Aliases**: Point aliases to existing collections
- **Update Aliases**: Atomically switch aliases to new collections
- **Delete Aliases**: Remove aliases when no longer needed
- **Version Management**: Maintain multiple collection versions
- **Backward Compatibility**: Keep old names working with new schemas

**Use Cases**:

- Blue-green deployments for schema changes
- A/B testing with different collection configurations
- Friendly, stable names for evolving collections

**API Functions**:

```typescript
import {
    listAliases,
    createAlias,
    updateAlias,
    deleteAlias,
} from '@/lib/typesense/aliases';

// Create alias
await createAlias('products-active', 'products-v2');

// Update alias (atomic switch)
await updateAlias('products-active', 'products-v3');

// Delete alias
await deleteAlias('products-active');
```

### Search Overrides (Curations)

**Location**: `/collections/[name]/overrides`

Fine-tune search results with manual interventions:

- **Rule Matching**: Define rules by exact or contains matching
- **Document Promotion**: Force include specific documents at positions
- **Document Exclusion**: Force exclude documents from results
- **Stop Words**: Add query-specific stop words
- **Custom Filters**: Apply additional filters to results
- **Custom Sorting**: Override default sort order

**API Functions**:

```typescript
import {
    listSearchOverrides,
    createSearchOverride,
    updateSearchOverride,
    deleteSearchOverride,
} from '@/lib/typesense/search-overrides';

// Create override
await createSearchOverride('products', 'promo-macbook', {
    rule: {
        query: 'laptop',
        match: 'contains',
    },
    includes: [{ id: 'macbook-pro-16', position: 1 }],
    excludes: [{ id: 'old-laptop-model' }],
});
```

### Stopwords

**Location**: `/stopwords`

**Requires**: Typesense 27.0+

Manage stopwords to improve search relevance:

- **Global Stopwords**: Define stopwords across collections
- **Locale Support**: Configure stopwords for different languages
- **Batch Management**: Add/remove multiple stopwords at once
- **Preview Impact**: See how stopwords affect search results

### Synonyms

**Location**: `/collections/[name]/synonyms`

Enhance search understanding with synonym sets:

- **One-way Synonyms**: Map terms to root words
- **Multi-way Synonyms**: Define equivalent terms
- **Locale-specific**: Configure synonyms per language
- **Symbol Indexing**: Control symbol handling in synonyms

**API Functions**:

```typescript
import {
    listSynonyms,
    createSynonym,
    updateSynonym,
    deleteSynonym,
} from '@/lib/typesense/synonyms';

// Create synonym set
await createSynonym('products', 'laptop-synonyms', {
    synonyms: ['laptop', 'notebook', 'portable computer'],
});

// Create one-way synonym
await createSynonym('products', 'phone-syn', {
    root: 'smartphone',
    synonyms: ['phone', 'mobile', 'cell'],
});
```

### Analytics Rules

**Location**: `/analytics-rules`

**Requires**: Typesense 27.0+

Track and analyze search behavior:

- **Query Analytics**: Track popular search queries
- **Click Analytics**: Monitor which results users click
- **Custom Rules**: Define custom analytics tracking
- **Event Streaming**: Configure analytics event handlers

### Stemming Dictionaries

**Location**: `/stemming`

**Requires**: Typesense 27.0+

Configure custom stemming rules:

- **Custom Rules**: Define word stemming behavior
- **Language Support**: Configure per-language dictionaries
- **Import/Export**: Bulk import stemming rules
- **Testing**: Preview stemming effects on queries

### Natural Language Search

**Location**: `/nl-search-models` and `/nl-search-test`

**Requires**: Typesense 27.1+

Configure and test AI-powered natural language search:

- **Model Management**: Create and manage NL search models
- **Model Types**: Support for OpenAI, Anthropic, and other providers
- **System Prompts**: Customize AI behavior with system prompts
- **Testing Interface**: Interactive testing of NL search
- **Query Transformation**: See how natural language converts to search queries

**API Functions**:

```typescript
import {
    listNLSearchModels,
    createNLSearchModel,
    naturalLanguageSearch,
} from '@/lib/typesense/nl-search-models';

// Create NL model
await createNLSearchModel({
    model_name: 'openai-assistant',
    model_type: 'openai',
    api_key: 'sk-...',
    system_prompt: 'You are a helpful search assistant.',
});

// Perform NL search
const results = await naturalLanguageSearch('products', {
    q: 'find me affordable laptops with good battery',
    model_by: 'openai-assistant',
});
```

### Conversational Search

**Location**: `/conversations`

**Requires**: Typesense 28.0+

Manage conversational search sessions:

- **Conversation History**: View past conversation sessions
- **Multi-turn Dialogs**: Support for context-aware follow-ups
- **Session Management**: Create and manage conversation sessions

### Cluster Operations

**Location**: `/cluster-operations`

Monitor and manage your Typesense cluster:

- **Health Status**: View cluster health and node status
- **Snapshots**: Create and manage cluster snapshots
- **Cache Management**: Clear or manage search caches
- **Metrics**: View detailed cluster metrics

**API Functions**:

```typescript
import {
    getClusterHealth,
    getClusterMetrics,
    createSnapshot,
} from '@/lib/typesense/cluster-operations';

// Check cluster health
const health = await getClusterHealth();

// Get metrics
const metrics = await getClusterMetrics();

// Create snapshot
await createSnapshot('/path/to/snapshot');
```

### Metrics & Overview

**Location**: `/metrics`

Dashboard overview with key metrics:

- **Collection Stats**: Total collections, documents, size
- **Search Analytics**: Query volume, latency, popular searches
- **Performance Metrics**: CPU, memory, disk usage
- **Health Indicators**: Cluster status, node availability

### Settings

**Location**: `/settings`

Application and server configuration:

- **Connection Settings**: View and test Typesense connection
- **Server Info**: Display server version and configuration
- **API Keys**: Manage Typesense API keys (if admin access)
- **Theme**: Toggle dark/light mode

---

## Development

### Available Scripts

| Script            | Description                             |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | Start development server with Turbopack |
| `pnpm build`      | Build for production                    |
| `pnpm start`      | Start production server                 |
| `pnpm lint`       | Run ESLint                              |
| `pnpm test`       | Run tests once                          |
| `pnpm test:watch` | Run tests in watch mode                 |
| `pnpm clean`      | Clean build artifacts and node_modules  |

### Testing

The project uses Vitest for unit testing:

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

Test files are located in `__tests__/` directory.

### Code Quality

- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting with plugins for imports and Tailwind
- **TypeScript**: Strict mode enabled for maximum type safety
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files only

### Project Architecture

#### App Router Structure

The application uses Next.js 16 App Router with:

- **Server Components**: Default for better performance
- **Client Components**: Used only when needed ('use client')
- **Parallel Routes**: For complex layouts
- **Loading States**: Automatic loading UI with loading.tsx
- **Error Boundaries**: Graceful error handling with error.tsx

#### Data Fetching

- **Server-side**: Fetch data in Server Components and Server Actions
- **Client-side**: Use React Query patterns for client interactions
- **Caching**: Leverage Next.js caching with revalidation strategies

#### State Management

- **Server State**: Managed via Server Components and Server Actions
- **Client State**: React hooks (useState, useReducer) for local state
- **Form State**: React Hook Form for complex forms
- **URL State**: useSearchParams for shareable state

### Component Library

Components are organized using the shadcn/ui pattern:

- `components/ui/`: Base UI components (buttons, inputs, dialogs)
- `components/features/`: Feature-specific components
- `components/layout/`: Layout components (header, footer, sidebar)
- `components/shared/`: Shared utility components

All UI components are built on Radix UI primitives for accessibility.

---

## Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Configuration

Ensure all required environment variables are set in production:

```bash
TYPESENSE_HOST=your-server.typesense.net
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-production-api-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configure environment variables in Vercel dashboard.

#### Docker

Use the provided Docker configurations:

```bash
# Build production image
docker build -f Dockerfile.production -t typesense-dashboard:latest .

# Run container
docker run -p 3000:3000 \
  -e TYPESENSE_HOST=your-server \
  -e TYPESENSE_PORT=8108 \
  -e TYPESENSE_PROTOCOL=http \
  -e TYPESENSE_API_KEY=your-key \
  typesense-dashboard:latest
```

#### Other Platforms

Compatible with any platform supporting Node.js:

- **Netlify**: Configure build command and environment variables
- **Railway**: Deploy with one click from GitHub
- **Render**: Automatic deployments from repository
- **Self-hosted**: Use PM2 or similar process manager

### Performance Optimization

The dashboard includes several optimizations:

- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: next/image with Sharp
- **Font Optimization**: next/font for local fonts
- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Use `ANALYZE=true pnpm build` to analyze bundles

---

## Troubleshooting

### Common Issues

#### Connection Failed

**Problem**: Cannot connect to Typesense server

**Solutions**:

- Verify server is running and accessible
- Check firewall rules and network connectivity
- Ensure environment variables are correct
- Verify API key has necessary permissions
- Check server logs for errors

#### Build Failures

**Problem**: Build process fails

**Solutions**:

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `pnpm clean && pnpm install`
- Check Node.js version (requires v20+)
- Verify no TypeScript errors: `pnpm build`

#### Feature Not Showing

**Problem**: Expected feature missing from sidebar

**Solutions**:

- Check Typesense server version (some features require newer versions)
- Verify version detection is working in `/settings`
- Ensure API key has admin permissions
- Check browser console for errors

#### Docker Issues

**Problem**: Docker container fails to start

**Solutions**:

- Verify environment variables are passed correctly
- Check container logs: `docker logs <container-id>`
- Ensure port 3000 is not already in use
- Verify Typesense server is reachable from container

### Debug Mode

Enable debug logging:

```bash
# Development
DEBUG=typesense:* pnpm dev

# Check Next.js info
pnpm next info
```

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/piyush-gambhir/typesense-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/piyush-gambhir/typesense-dashboard/discussions)
- **Typesense Docs**: [Typesense Documentation](https://typesense.org/docs/)
- **Next.js Docs**: [Next.js Documentation](https://nextjs.org/docs)

---

## Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the code style and conventions
4. **Add tests**: Ensure new features are tested
5. **Run tests**: `pnpm test`
6. **Lint code**: `pnpm lint`
7. **Commit changes**: `git commit -m "Add amazing feature"`
8. **Push to branch**: `git push origin feature/amazing-feature`
9. **Open a Pull Request**

### Code Style

- Follow existing code patterns
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused
- Use named exports for better refactoring

### Commit Messages

Follow conventional commits format:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: format code
refactor: improve code structure
test: add tests
chore: update dependencies
```

### Pull Request Guidelines

- Provide clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure CI passes
- Keep PRs focused and reasonably sized

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

- **[Typesense](https://typesense.org/)** - Fast, typo-tolerant search engine
- **[Next.js](https://nextjs.org/)** - React framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Radix UI](https://www.radix-ui.com/)** - Primitive components
- **[Vercel](https://vercel.com/)** - Deployment platform
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework

---

## Roadmap

Planned features and improvements:

- [ ] Advanced query builder with visual interface
- [ ] Bulk operations for collections and documents
- [ ] Export/import functionality for configurations
- [ ] Real-time collaboration features
- [ ] Enhanced analytics with visualizations
- [ ] Webhook management
- [ ] Audit log viewer
- [ ] Multi-cluster support
- [ ] Custom dashboard widgets
- [ ] Mobile app

---

## Additional Resources

- **[Typesense Documentation](https://typesense.org/docs/)** - Official Typesense docs
- **[Next.js Documentation](https://nextjs.org/docs)** - Next.js guides and API reference
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript documentation
- **[React Documentation](https://react.dev/)** - React guides and API
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Utility CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Component examples and docs

---

## Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📝 Contributing code or documentation
- 💬 Sharing with others

---

**Built with ❤️ using Next.js, TypeScript, and Typesense**

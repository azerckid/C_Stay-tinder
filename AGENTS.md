# AGENTS.md

Welcome! This is the AGENTS.md file for the **TravelSwipe** project. This file provides comprehensive context and instructions for AI coding agents working on this repository.

## Project Overview
TravelSwipe is a Tinder-style travel destination selection service that allows users to swipe through travel destinations and create optimized travel routes based on their selections. Unlike traditional travel services that provide pre-made itineraries, TravelSwipe empowers users to build their own personalized travel routes by selecting destinations through an intuitive swipe interface.

The service enables users to:
- Discover travel destinations through an engaging swipe-based interface
- Select preferred destinations by swiping right (like) or left (pass)
- View detailed information about selected destinations
- Generate optimized travel routes connecting all selected destinations
- Share their custom travel routes with other users

The core target audience consists of mobile-first users who enjoy interactive discovery experiences and want to create personalized travel itineraries. The service combines the familiar Tinder swipe interaction pattern with travel planning functionality, making destination selection fun and engaging.

## Tech Stack
- **Framework**: React Router v7 (Vite)
- **Styling**: Tailwind CSS v4, shadcn/ui (Nova Preset)
- **Database**: Turso (libSQL) with Drizzle ORM
- **Authentication**: Better Auth (session-based authentication)
- **Validation**: Zod (schema validation)
- **Date/Time**: Luxon (date and time handling)
- **Media Storage**: Cloudinary (for image and video uploads)
- **Mobile**: Capacitor (iOS, Android native apps, PWA support)
- **AI**: Google Gemini API (for chatbot responses)
- **AI Workflow**: LangGraph (for managing complex conversation flows and persona state transitions)
- **Search (Optional)**: RAG system with Vector DB (Pinecone, Weaviate, or FAISS) and Embedding models (OpenAI or open-source)
- **Maps (Travel Blog)**: Google Maps API, Naver Maps API, or Mapbox (for location visualization and travel route mapping)

## Setup Commands
- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build production bundle: `npm run build`
- Start production server: `npm start`
- Database migration: `npx drizzle-kit push`
- Database studio: `npx drizzle-kit studio`
- Type checking: `npm run typecheck`

## Authentication & Routing Setup
- 소셜 로그인 콜백 경로 구조 (React Router v7 + Better Auth)
- Better Auth는 기본적으로 `/auth/callback/{provider}` 형식의 내부 경로를 사용.

## Development Tools & Resources

### UI Design & Images
- **Stitch (UI Generation AI Tool)**: Used for initial UI design and travel destination image generation
  - Stitch-generated designs are saved as HTML files in `docs/stitch/` folder
  - Stitch-generated images are hosted on Google Images (`lh3.googleusercontent.com/aida-public/...`) URLs
  - **Note**: Prototype stage involves converting Stitch HTML designs to React components
  - Production will use Cloudinary for image hosting
  - Design system defined in `docs/UI_DESIGN_SYSTEM.md` based on actual Stitch HTML values

## Build, Lint & Test Commands

### Building
- **Development build**: `npm run dev` - Starts Vite dev server with hot reload
- **Production build**: `npm run build` - Creates optimized production bundle
- **Production server**: `npm start` - Starts production server
- **Type checking**: `npm run typecheck` - Runs TypeScript compiler for type checking

### Testing
Currently in Phase 9 of development - testing framework integration pending. When implemented:

**Single Test Execution:**
```bash
# Run all tests
npm test

# Run specific test file (when implemented)
npm test -- path/to/test/file.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Recommended Testing Setup (Future):**
- Use Vitest for fast, modern testing
- Test files: `*.test.ts`, `*.test.tsx`
- Test directory: `__tests__/` or `tests/`
- Coverage target: >80%

### Linting & Code Quality
Currently no linting setup. Recommended configuration:

```bash
# Install ESLint (when implemented)
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks

# Run linting (when implemented)
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run linting with type checking
npm run lint:check
```

**Recommended ESLint Configuration:**
- TypeScript strict rules
- React hooks rules
- Import sorting
- Accessibility rules

## Code Style & Conventions

### TypeScript Configuration
- **Strict mode enabled**: All TypeScript strict checks are active
- **Target**: ES2022
- **Module resolution**: bundler
- **JSX**: react-jsx
- **Path mapping**: `~/*` maps to `./app/*`

### Import Organization
```typescript
// 1. React imports
import React from "react";

// 2. Third-party library imports (alphabetically sorted)
import { motion } from "framer-motion";
import { Link } from "react-router";

// 3. Local imports (using ~ alias)
import type { Route } from "./+types/home";
import { authClient } from "~/lib/auth-client";
import { db } from "~/db";
import { places } from "~/db/schema";

// 4. Relative imports (rarely used, prefer ~ alias)
import { SwipeCard } from "../components/swipe/SwipeCard";
```

**Import Rules:**
- Group imports by category with blank lines between groups
- Sort imports alphabetically within each group
- Use type imports for TypeScript types: `import type { Route } from "./+types/home"`
- Prefer named imports over default imports
- Use path aliases (`~/`) instead of relative imports

### Component Patterns
```typescript
// Function component with proper typing
interface ComponentProps {
  destination: Destination;
  onSwipe: (direction: "left" | "right" | "up") => void;
  isFront: boolean;
}

export const SwipeCard: React.FC<ComponentProps> = ({
  destination,
  onSwipe,
  isFront
}) => {
  // Component logic
  return (
    // JSX
  );
};
```

**Component Conventions:**
- Use functional components with React.FC typing
- Define interfaces for props with clear naming
- Use descriptive prop names and TypeScript types
- Prefer early returns for conditional rendering
- Use object destructuring for props

### Database Schema Patterns
```typescript
// Drizzle ORM table definition
export const places = sqliteTable("places", {
  id: text("id").primaryKey(), // UUID primary keys
  name: text("name").notNull(),
  location: text("location").notNull(),
  tags: text("tags", { mode: "json" }), // JSON fields for arrays
  lat: real("lat"), // Nullable coordinates
  lng: real("lng"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`), // SQLite timestamp
});
```

**Database Conventions:**
- Use text() for strings, integer() for numbers, real() for floats
- Primary keys: text for UUIDs, integer with autoIncrement for serial IDs
- Foreign keys with proper references and cascade delete
- JSON mode for array/object fields
- Timestamps as Unix epoch integers
- Snake_case column names, camelCase property names

### Error Handling
```typescript
// React Router error boundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    // Handle route errors
    return <div>Route Error: {error.statusText}</div>;
  }

  if (import.meta.env.DEV && error instanceof Error) {
    // Development error details
    return <div>Error: {error.message}</div>;
  }

  // Production error fallback
  return <div>Something went wrong</div>;
}

// API error handling in loaders/actions
export async function loader() {
  try {
    const data = await fetchData();
    return { data };
  } catch (error) {
    console.error("Loader error:", error);
    throw new Response("Data loading failed", { status: 500 });
  }
}
```

**Error Handling Rules:**
- Use React Router's ErrorBoundary for route-level errors
- Check `isRouteErrorResponse()` for route-specific errors
- Display error details only in development (`import.meta.env.DEV`)
- Use try/catch in loaders and actions
- Return proper HTTP status codes
- Log errors for debugging but don't expose sensitive information

### Toast Notifications (Sonner)
```typescript
import { toast } from "sonner";

// Success notifications
toast.success("Destination added to itinerary");

// Error notifications
toast.error("Failed to save trip");

// Info notifications
toast.info("Route optimization in progress");

// Warning notifications
toast.warning("Some destinations may not be accessible");
```

**Toast Usage:**
- Success: Login, logout, signup, data saves, route creation
- Error: API failures, validation errors, network issues
- Info: Background processes, status updates
- Warning: Non-critical issues, confirmations needed

### React Router v7 Patterns
```typescript
// Route loader with proper typing
export async function loader({ params }: LoaderFunctionArgs) {
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, params.tripId),
  });

  if (!trip) {
    throw new Response("Trip not found", { status: 404 });
  }

  return { trip };
}

// Route action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // Handle creation
      break;
    case "update":
      // Handle update
      break;
  }
}

// Meta function
export function meta({ data }: MetaFunctionArgs) {
  return [
    { title: data?.trip?.title || "Trip Details" },
    { name: "description", content: data?.trip?.description },
  ];
}
```

**Route Conventions:**
- Type loaders/actions with proper React Router types
- Validate params and throw 404 for missing resources
- Use form data with intent-based actions
- Return proper data structures from loaders
- Set meaningful meta tags

### Styling with Tailwind CSS v4
```typescript
// Utility-first approach with shadcn/ui components
<div className="flex items-center justify-between px-6 py-4 bg-surface-dark rounded-lg border border-white/10">
  <h2 className="text-xl font-bold text-white">Title</h2>
  <Button variant="primary" size="sm">
    Action
  </Button>
</div>

// Responsive design patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

// Dark theme first approach
<div className="bg-background-dark text-white min-h-screen">
  {/* Dark theme optimized */}
</div>
```

**Styling Conventions:**
- Mobile-first responsive design
- Dark theme as primary (light theme secondary)
- Use shadcn/ui Nova preset components
- Consistent spacing with Tailwind scale
- Custom CSS variables for theme colors
- Backdrop blur and glassmorphism effects

### File Naming & Organization
```
app/
├── components/
│   ├── ui/           # Reusable UI components (shadcn/ui)
│   ├── swipe/        # Swipe-specific components
│   └── auth/         # Authentication components
├── routes/           # React Router route files
├── db/              # Database schema and connections
├── lib/             # Utilities and shared logic
│   ├── contexts/    # React contexts
│   ├── hooks/       # Custom hooks
│   └── utils/       # Helper functions
└── styles/          # Global styles
```

**Naming Conventions:**
- Components: PascalCase (SwipeCard.tsx)
- Files: kebab-case for utilities, PascalCase for components
- Directories: lowercase with hyphens if needed
- Test files: `ComponentName.test.tsx`
- Type files: `types.ts` or inline interfaces

### Authentication with Better Auth
```typescript
// Client usage
import { authClient } from "~/lib/auth-client";

const { data: session } = authClient.useSession();

// Server-side auth checking
export async function loader() {
  const session = await authClient.getSession();
  if (!session) {
    throw redirect("/login");
  }
  return { session };
}
```

**Auth Patterns:**
- Use authClient for client-side operations
- Check sessions in loaders for protected routes
- Handle auth state changes with useSession hook
- Redirect unauthenticated users appropriately

### Data Fetching & Validation
```typescript
// Zod schema for validation
import { z } from "zod";

const destinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).default([]),
});

// Usage in loader/action
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const validatedData = destinationSchema.parse(data);
  // Proceed with validated data
}
```

**Data Handling:**
- Validate all input data with Zod schemas
- Use proper TypeScript types throughout
- Handle null/undefined values explicitly
- Transform database data for component consumption

### Git Commit Conventions
Follow Conventional Commits in Korean:
- `feat(ui): 로그인 기능 추가` - New features
- `fix(auth): 토큰 만료 처리 버그 수정` - Bug fixes
- `refactor(db): 데이터베이스 스키마 최적화` - Code refactoring
- `docs(readme): 설치 가이드 업데이트` - Documentation
- `test(swipe): 스와이프 컴포넌트 테스트 추가` - Tests
- `style(components): 버튼 스타일 통일` - Styling changes

## Workflow & Safety
- **[Safe Checkpoint Strategy]** Always create git commits or confirm clean working directory before major changes (new files, DB schema changes, package installations)
- **[Database Integrity Rule]** Never perform destructive database operations without complete backup
- **[No Temporary Patches]** Use formal, production-ready solutions only
- **[Security First]** Never expose secrets, validate all inputs, follow authentication patterns

## Communication Rules
- **[No Emojis]** Use text only for all communication - no emojis or emoticons

## Testing Instructions
Currently in Phase 9 - testing integration pending. Future setup will include:
- Vitest for unit/integration tests
- React Testing Library for component tests
- MSW for API mocking
- Coverage reporting

## Key Documentation
- `docs/IMPLEMENTATION_PLAN.md`: Development roadmap with phase breakdown
- `docs/UI_DESIGN_SYSTEM.md`: Design tokens and visual guidelines based on Stitch designs
- `docs/INTERACTION_GUIDE.md`: Animation and interaction specifications using framer-motion
- `docs/stitch/`: Stitch-generated HTML design files for reference during implementation
- `app/db/schema.ts`: Drizzle schema and storage logic

[CRITICAL: DATABASE INTEGRITY RULE] You are strictly prohibited from performing any database operations, including migrations, schema resets, or structural changes, without first creating a complete data backup (dump). Data preservation is your absolute priority. Never execute destructive commands like 'DROP TABLE' or 'migrate reset' until a verifiable backup has been secured and confirmed.

[MANDATORY BACKUP PROCEDURE] Before initiating any database-related tasks, you must perform a full export of all existing records. This is a non-negotiable prerequisite for any migration or schema update. You must ensure that both user-generated content and administrative data are fully protected against loss before any changes are applied.

[STRICT ADHERENCE TO STANDARDS] Never suggest or implement "quick fixes," "short-cuts," or temporary workarounds. You must always prioritize formal, standardized, and industry-best-practice methodologies. All proposed solutions must be production-ready and architecturally sound, focusing on long-term stability and correctness over immediate speed.

[NO TEMPORARY PATCHES] You are strictly forbidden from proposing temporary bypasses or "quick-and-dirty" solutions. Every recommendation and implementation must follow the most formal and correct path. Prioritize robustness and adherence to professional engineering standards in every decision, ensuring that no technical debt is introduced for the sake of convenience.</content>
<parameter name="filePath">/Users/namhyeongseog/Desktop/TODO/STAYnC/CSTAY-tinder/AGENTS.md
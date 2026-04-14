# TaskFlow Frontend

Modern React/Next.js frontend for TaskFlow task management system.

## Features

- **Authentication**: Register, login, logout with JWT-based auth
- **Project Management**: Create, view, and manage projects
- **Task Management**: Create, edit, delete, and filter tasks
- **Status Tracking**: Move tasks between To Do, In Progress, and Done
- **Priority Levels**: Assign low, medium, or high priority to tasks
- **Due Dates**: Set and track task deadlines
- **Responsive Design**: Works on mobile (375px) to desktop (1280px+)
- **Dark Mode**: Built-in dark mode support via TailwindCSS
- **Auth Persistence**: Session persists across browser cycles

## Tech Stack

- **Next.js 16**: React framework with App Router
- **React 19**: Latest React with hooks
- **TypeScript**: Type-safe development
- **TailwindCSS 4**: Utility-first CSS framework
- **Context API**: State management without external libraries

## Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── login/page.tsx       # Authentication page
│   ├── register/page.tsx    # Registration page
│   ├── page.tsx             # Projects dashboard
│   ├── projects/
│   │   └── [id]/page.tsx    # Project detail & tasks
│   ├── layout.tsx           # Root layout with providers
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── navbar.tsx          # Navigation header
│   └── task-modal.tsx      # Task CRUD modal & task card
├── lib/                     # Utilities and helpers
│   ├── api.ts              # API client & type definitions
│   ├── auth-context.tsx    # Auth state management
│   └── use-protected-route.ts  # Route protection hook
├── public/                  # Static assets
├── db.json                  # Mock JSON Server data
├── docker-compose.yml      # Docker Compose setup
├── Dockerfile              # Frontend container image
├── .env.example            # Environment template
├── .env.local              # Local dev environment
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # TailwindCSS configuration
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file (optional, defaults are set)
cp .env.example .env.local

# Update .env.local with your API URL if needed
# NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Development

```bash
# Start JSON Server (mock API backend)
npm run json-server

# In another terminal, start Next.js dev server
npm run dev
```

Opens at [http://localhost:3001](http://localhost:3001) (Next.js) and [http://localhost:3002](http://localhost:3002) (JSON Server API)

### Production Build

```bash
npm run build
npm run start
```

### Docker

Use Docker Compose to run both the frontend and mock API together.

```bash
docker compose up --build
```

Open the app at `http://localhost:3000` and the API at `http://localhost:4000`.

### Stop Docker

```bash
docker compose down
```

### Linting

```bash
npm run lint
```

## Key Components

### AuthProvider & useAuth Hook

Manages global authentication state:

```tsx
const { user, token, login, register, logout, error } = useAuth();

if (!user) return <Redirect to="/login" />;
```

### useProtectedRoute Hook

Automatically redirects unauthenticated users:

```tsx
const { isProtected, loading } = useProtectedRoute();

if (isProtected || loading) return <LoadingScreen />;
return <ProtectedContent />;
```

### TaskModal Component

Modal for creating and editing tasks with form validation and API integration.

### TaskCard Component

Displays task information with inline status dropdown and action buttons.

## API Client

Type-safe API client with automatic error handling. See `lib/api.ts` for full TypeScript definitions.

## Styling

Uses TailwindCSS utility classes with dark mode via `dark:` prefix.

## Environment Variables

```
# API Backend URL (defaults to http://localhost:3002 for JSON Server)
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## Contributing

This is an open-source learning project. Issues and PRs welcome!

## License

MIT

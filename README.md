# FitZig - Personalized Fitness Tracker

A PWA-compatible fitness tracker that allows users to create workout sessions, select exercises, define progression maps, and track workouts with a countdown timer system.

## Tech Stack

| Layer      | Technology                |
| ---------- | ------------------------- |
| Frontend   | SvelteKit + TypeScript    |
| UI         | DaisyUI (TailwindCSS)     |
| Backend    | Convex                    |
| Auth       | Convex Auth               |
| PWA        | Vite PWA Plugin           |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up Convex (requires authentication)
npx convex dev

# Copy environment example and add your Convex URL
cp .env.example .env.local
# Edit .env.local with your PUBLIC_CONVEX_URL

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── auth/          # Login, Register forms
│   │   ├── exercises/     # Exercise cards, lists
│   │   ├── sessions/      # Session cards, wizard
│   │   ├── timer/         # Countdown timer
│   │   └── ui/            # Shared UI components
│   ├── stores/            # Svelte stores
│   ├── convex/            # Convex client setup
│   └── utils/             # Helper functions
├── routes/
│   ├── (public)/          # Public pages (landing, auth)
│   └── (app)/             # Protected app routes
│       ├── dashboard/
│       ├── sessions/
│       ├── exercises/
│       ├── history/
│       └── settings/
convex/
├── schema.ts              # Database schema
├── users.ts               # User functions
├── exercises.ts           # Exercise CRUD
├── sessions.ts            # Session CRUD
├── sessionExercises.ts    # Progression map
├── sessionLogs.ts         # Workout history
└── seed.ts                # Seed system exercises
```

---

## Implementation Stages

### Stage 1: Project Setup & Foundation

#### 1.1 Initialize SvelteKit Project
- [x] Create new SvelteKit project with TypeScript template
- [x] Configure `svelte.config.js` with adapter-auto
- [x] Set up path aliases (`$lib`, `$components`)
- [x] Configure TypeScript strict mode

#### 1.2 Install & Configure TailwindCSS + DaisyUI
- [x] Install TailwindCSS, PostCSS, Autoprefixer
- [x] Install DaisyUI plugin
- [x] Configure `tailwind.config.js` with DaisyUI themes (`light` for light, `dark` for dark)
- [x] Create global CSS with Tailwind directives
- [x] Add base theme toggle utility

#### 1.3 Set Up Convex Backend
- [x] Install `convex` and `convex-svelte` packages
- [x] Create Convex client configuration in `$lib/convex/`
- [x] Set up environment variables (`.env.example`)
- [ ] Initialize Convex project (`npx convex dev`) - *requires manual authentication*

#### 1.4 Define Database Schema
- [x] Create `convex/schema.ts` with tables:
  - `users` - User profiles
  - `exercises` - Exercise library (system + custom)
  - `sessions` - Workout sessions
  - `sessionExercises` - Progression map (exercises in session)
  - `sessionLogs` - Completed workout history

#### 1.5 Project Structure Setup
- [x] Create folder structure for components, stores, utils
- [x] Create index files for component exports
- [x] Add utility functions (formatDuration, formatDate, etc.)

---

### Stage 2: Authentication System

#### 2.1 Configure Convex Auth
- [ ] Set up Convex Auth with email/password provider
- [ ] Configure OAuth providers (Google - optional)
- [ ] Create auth helper functions

#### 2.2 Build Auth UI Components
- [ ] `LoginForm.svelte` - Email/password login form
- [ ] `RegisterForm.svelte` - Account creation form
- [ ] `AuthGuard.svelte` - Wrapper for protected content
- [ ] `UserMenu.svelte` - Logged-in user dropdown

#### 2.3 Create Auth Pages
- [ ] `/login` - Login page
- [ ] `/register` - Registration page
- [ ] `/logout` - Logout action

#### 2.4 Implement Route Protection
- [ ] Create `hooks.server.ts` for auth guards
- [ ] Redirect unauthenticated users to `/login`
- [ ] Redirect authenticated users from auth pages to `/dashboard`

#### 2.5 User Profile Functions
- [x] `convex/users.ts`:
  - `getCurrentUser` query
  - `updateProfile` mutation
  - `updatePreferences` mutation (theme, etc.)

---

### Stage 3: Core Layout & Navigation

#### 3.1 Create Layout Components
- [ ] `AppShell.svelte` - Main app wrapper with nav
- [ ] `BottomNav.svelte` - Mobile bottom navigation
- [ ] `Navbar.svelte` - Top navigation bar
- [ ] `ThemeToggle.svelte` - Light/dark mode switch

#### 3.2 Set Up Route Groups
- [ ] `(public)/+layout.svelte` - Public pages layout
- [ ] `(app)/+layout.svelte` - Protected app layout with navigation
- [ ] Configure nested layouts

#### 3.3 Build Common UI Components
- [ ] `PageHeader.svelte` - Page title with actions
- [ ] `EmptyState.svelte` - Empty list placeholder
- [ ] `LoadingSpinner.svelte` - Loading indicator
- [ ] `Toast.svelte` - Notification toasts
- [ ] `ConfirmModal.svelte` - Confirmation dialogs

#### 3.4 Create Dashboard Page
- [ ] `/dashboard/+page.svelte`
- [ ] Quick stats display (total sessions, workout time)
- [ ] Recent sessions list
- [ ] "Create Session" CTA button

---

### Stage 4: Exercise Library

#### 4.1 Convex Exercise Functions
- [x] `convex/exercises.ts`:
  - `listExercises` query - Get all exercises (system + user's custom)
  - `getExerciseById` query
  - `createExercise` mutation - Add custom exercise
  - `updateExercise` mutation
  - `deleteExercise` mutation

#### 4.2 Seed System Exercises
- [x] Create `convex/seed.ts` with predefined exercises:
  - Strength: Push-ups, Squats, Lunges, Plank, etc.
  - Cardio: Jumping Jacks, Burpees, High Knees, etc.
  - Flexibility: Stretches, Yoga poses, etc.
- [ ] Run seed function on initial setup

#### 4.3 Build Exercise Components
- [ ] `ExerciseCard.svelte` - Display single exercise
- [ ] `ExerciseList.svelte` - Filterable/searchable list
- [ ] `ExerciseForm.svelte` - Add/edit exercise form
- [ ] `CategoryFilter.svelte` - Filter by category tabs

#### 4.4 Create Exercise Pages
- [ ] `/exercises/+page.svelte` - Exercise library listing
- [ ] `/exercises/new/+page.svelte` - Add custom exercise
- [ ] `/exercises/[id]/+page.svelte` - Exercise detail view
- [ ] `/exercises/[id]/edit/+page.svelte` - Edit custom exercise

---

### Stage 5: Session Management

#### 5.1 Convex Session Functions
- [x] `convex/sessions.ts`:
  - `listUserSessions` query
  - `getSessionById` query
  - `getSessionWithExercises` query (with progression map)
  - `createSession` mutation
  - `updateSession` mutation
  - `deleteSession` mutation
  - `updateSessionStatus` mutation

#### 5.2 Convex Session Exercises Functions
- [x] `convex/sessionExercises.ts`:
  - `addExercisesToSession` mutation
  - `updateExerciseProgression` mutation
  - `reorderExercises` mutation
  - `removeExerciseFromSession` mutation

#### 5.3 Build Session Components
- [ ] `SessionCard.svelte` - Session preview card
- [ ] `SessionList.svelte` - List of user sessions
- [ ] `SessionDetail.svelte` - Full session view

#### 5.4 Create Session Listing Page
- [ ] `/sessions/+page.svelte` - All user sessions
- [ ] Filter by status (draft, ready, completed)
- [ ] Sort options (recent, name)

---

### Stage 6: Session Creation Wizard

#### 6.1 Build Wizard Infrastructure
- [ ] `SessionWizard.svelte` - Multi-step form container
- [ ] `StepIndicator.svelte` - Progress steps display
- [ ] Create wizard state store (`wizardStore.ts`)

#### 6.2 Step 1: Basic Info
- [ ] `WizardStep1.svelte`:
  - Session name input
  - Number of exercises input
  - Estimated duration picker
- [ ] Form validation

#### 6.3 Step 2: Exercise Selection
- [ ] `WizardStep2.svelte`:
  - Exercise picker with search/filter
  - Selection counter (X of N selected)
  - Selected exercises preview
- [ ] `ExercisePicker.svelte` - Selectable exercise list

#### 6.4 Step 3: Progression Map
- [ ] `WizardStep3.svelte`:
  - List of selected exercises
  - Per-exercise configuration
- [ ] `ProgressionEditor.svelte`:
  - Number of sets input
  - Duration per set (seconds)
  - Rest between sets (seconds)
- [ ] Drag-and-drop reordering

#### 6.5 Step 4: Review & Save
- [ ] `WizardStep4.svelte`:
  - Session summary
  - Total calculated duration
  - Exercise order preview
  - Confirm & Save button
- [ ] Save session to Convex

#### 6.6 Create Wizard Page
- [ ] `/sessions/new/+page.svelte` - Wizard container
- [ ] Handle wizard navigation (next, back, save)
- [ ] Redirect to session detail on completion

---

### Stage 7: Session Player (Timer)

#### 7.1 Build Timer Components
- [ ] `CountdownTimer.svelte` - Circular countdown display
- [ ] `TimerControls.svelte` - Play, Pause, Skip buttons
- [ ] `ExerciseDisplay.svelte` - Current exercise info
- [ ] `ProgressIndicator.svelte` - Session progress bar
- [ ] `RestScreen.svelte` - Rest period display

#### 7.2 Implement Timer Logic
- [ ] Create `timerStore.ts`:
  - Timer state (running, paused, rest, completed)
  - Current exercise index
  - Current set number
  - Time remaining
- [ ] Timer countdown logic
- [ ] Auto-advance between sets/exercises
- [ ] Handle rest periods

#### 7.3 Audio & Haptic Feedback
- [ ] Add audio cues for:
  - Exercise start
  - Set complete
  - Rest period start
  - Session complete
- [ ] Vibration feedback (where supported)

#### 7.4 Session Player Page
- [ ] `/sessions/[id]/play/+page.svelte`:
  - Full-screen timer view
  - Exercise name display
  - Set/exercise progress
  - Controls (pause, skip, end)
- [ ] Keep screen awake during session
- [ ] Prevent accidental navigation

#### 7.5 Session Completion
- [ ] `CompletionScreen.svelte`:
  - Congratulations message
  - Session stats (time, exercises completed)
  - Save to history button
- [ ] Log completed session to `sessionLogs`

---

### Stage 8: Session History & Stats

#### 8.1 Convex History Functions
- [x] `convex/sessionLogs.ts`:
  - `logCompletedSession` mutation
  - `getSessionHistory` query
  - `getSessionStats` query (aggregated stats)

#### 8.2 Build History Components
- [ ] `HistoryCard.svelte` - Completed session card
- [ ] `HistoryList.svelte` - List of past workouts
- [ ] `StatsOverview.svelte` - Summary statistics

#### 8.3 Create History Page
- [ ] `/history/+page.svelte`:
  - List of completed sessions
  - Date-based grouping
  - Total workout time
  - Streak tracking (optional)

#### 8.4 Enhance Dashboard Stats
- [ ] Add stats to dashboard:
  - Total sessions completed
  - Total workout time
  - This week's activity
  - Favorite exercises

---

### Stage 9: Settings & Profile

#### 9.1 Build Settings Components
- [ ] `ProfileForm.svelte` - Edit name, email
- [ ] `PreferencesForm.svelte` - App preferences
- [ ] `ThemeSelector.svelte` - Theme choice
- [ ] `DangerZone.svelte` - Delete account

#### 9.2 Create Settings Page
- [ ] `/settings/+page.svelte`:
  - Profile section
  - Preferences section
  - Theme toggle
  - About/Version info

#### 9.3 Persist User Preferences
- [ ] Save theme preference to Convex
- [ ] Apply theme on app load
- [ ] Sync preferences across devices

---

### Stage 10: PWA Configuration

#### 10.1 Install PWA Plugin
- [ ] Install `@vite-pwa/sveltekit`
- [ ] Configure in `vite.config.ts`

#### 10.2 Create Web App Manifest
- [ ] `static/manifest.json`:
  - App name, short name
  - Start URL (`/dashboard`)
  - Display mode (`standalone`)
  - Theme & background colors
  - App icons (192x192, 512x512)

#### 10.3 Design App Icons
- [ ] Create app icon in multiple sizes
- [ ] Add maskable icon variant
- [ ] Add Apple touch icons

#### 10.4 Configure Service Worker
- [ ] Set up precaching for static assets
- [ ] Configure runtime caching strategies:
  - Cache-first: Static assets, icons
  - Network-first: API calls
  - Stale-while-revalidate: Exercise list

#### 10.5 Add Install Prompt
- [ ] `InstallPrompt.svelte` - "Add to Home Screen" banner
- [ ] Detect installability
- [ ] Track install events

---

### Stage 11: Offline Support

#### 11.1 Cache Exercise Library
- [ ] Cache exercises on first load
- [ ] Serve from cache when offline
- [ ] Background refresh when online

#### 11.2 Cache User Sessions
- [ ] Cache user's sessions for offline viewing
- [ ] Show "cached" indicator
- [ ] Clear cache on logout

#### 11.3 Offline Session Completion
- [ ] Queue session logs in IndexedDB when offline
- [ ] Sync queued logs when back online
- [ ] Show pending sync indicator

#### 11.4 Offline UI Indicators
- [ ] `OfflineIndicator.svelte` - Connection status
- [ ] Show offline banner
- [ ] Disable actions requiring network

---

### Stage 12: Polish & Optimization

#### 12.1 Loading States
- [ ] Add skeleton loaders for lists
- [ ] Optimistic UI updates
- [ ] Smooth page transitions

#### 12.2 Error Handling
- [ ] Global error boundary
- [ ] User-friendly error messages
- [ ] Retry mechanisms

#### 12.3 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Focus management
- [ ] Color contrast verification

#### 12.4 Performance Optimization
- [ ] Lazy load routes
- [ ] Optimize images
- [ ] Minimize bundle size
- [ ] Audit with Lighthouse

#### 12.5 Mobile Responsiveness
- [ ] Test on various screen sizes
- [ ] Touch-friendly interactions
- [ ] Safe area handling (notch, home indicator)

---

### Stage 13: Testing & Deployment

#### 13.1 Testing Setup
- [ ] Install Vitest for unit tests
- [ ] Install Playwright for E2E tests
- [ ] Set up test utilities

#### 13.2 Write Tests
- [ ] Unit tests for utilities and stores
- [ ] Component tests for key components
- [ ] E2E tests for critical flows:
  - User registration/login
  - Session creation
  - Session playback

#### 13.3 Deployment Setup
- [ ] Configure Vercel/Netlify deployment
- [ ] Set up Convex production deployment
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline

#### 13.4 Launch Checklist
- [ ] Final Lighthouse audit
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Security review
- [ ] Documentation update

---

## Data Models

### Users
```typescript
{
  _id: Id<"users">
  email: string
  name: string
  createdAt: number
  preferences: {
    theme: "light" | "dark"
  }
}
```

### Exercises
```typescript
{
  _id: Id<"exercises">
  name: string
  category: "strength" | "cardio" | "flexibility" | "custom"
  description: string
  defaultDuration: number // seconds
  isSystem: boolean
  createdBy?: Id<"users"> // null for system exercises
}
```

### Sessions
```typescript
{
  _id: Id<"sessions">
  userId: Id<"users">
  sessionName: string
  numberOfExercises: number
  totalDuration: number // seconds
  status: "draft" | "ready" | "completed"
  createdAt: number
}
```

### Session Exercises
```typescript
{
  _id: Id<"sessionExercises">
  sessionId: Id<"sessions">
  exerciseId: Id<"exercises">
  order: number
  sets: number
  durationPerSet: number // seconds
  restBetweenSets: number // seconds
}
```

### Session Logs
```typescript
{
  _id: Id<"sessionLogs">
  sessionId: Id<"sessions">
  userId: Id<"users">
  startedAt: number
  completedAt: number
  actualDuration: number
  exercisesCompleted: number
}
```

---

## License

MIT

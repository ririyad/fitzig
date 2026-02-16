# Fitzig ⚡️

Fitzig is a modern, privacy-first mobile workout tracker built with **Expo** and **React Native**. It focuses on guided, time-based exercise sessions with a clean, high-contrast UI designed for use in the gym.

Current Version: `0.2.0`

## Philosophy

- **Local-First**: Your data stays on your device. No accounts, no cloud sync, no tracking.
- **Resilience**: Life happens. If the app crashes or you take a call, your session is saved and ready to resume exactly where you left off.
- **Simplicity**: No bloated social features. Just you, your timer, and your progress.
- **Consistency**: A generous 48-hour streak window encourages daily habits without being punitive.

## Core Features

- **Guided Workout Runner**: Intelligent timer system that manages exercise and cooldown phases.
- **Session Recovery**: Automatic snapshots ensure you never lose progress if the app is interrupted.
- **Custom Templates**: Create reusable workout routines with granular control over sets, reps, and durations.
- **Dynamic Cues**: Integrated haptic feedback and audio cues (optional) to keep you on track without looking at your screen.
- **Progress Analytics**: Track streaks, total volume, and exercise-specific performance.
- **Visual Identity**: A calm, gradient-based aesthetic combined with high-readability cards.

## Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev/) (React Native)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **State & Persistence**: `AsyncStorage`
- **Animations**: `React Native Reanimated`
- **Audio/Haptics**: `Expo AV` & `Expo Haptics`
- **Styling**: `Expo Linear Gradient` & `Lucide-style` icons via Ionicons

## Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn
- [Expo Go](https://expo.dev/client) app on your mobile device (for local development)

### Installation
```bash
npm install
```

### Development
```bash
npm run start
```
Press `a` for Android, `i` for iOS, or scan the QR code with your Expo Go app.

## Release Automation

The project uses GitHub Actions to automate Android APK builds via EAS.

- **Workflow**: `.github/workflows/release-apk.yml`
- **Trigger**: Pushing a tag (e.g., `v0.2.0`)
- **Profile**: Uses the `release` profile defined in `eas.json`

To trigger a release:
```bash
git tag v0.2.0
git push origin v0.2.0
```

## Structure

- `app/`: Expo Router screens and layouts.
- `components/`: Reusable UI elements and themed components.
- `constants/`: Theme definitions, exercise types, and UI constants.
- `hooks/`: Custom React hooks for color schemes and theme management.
- `lib/`: Core business logic (storage, session runner, streaks).
- `types/`: TypeScript definitions for workout and session data.

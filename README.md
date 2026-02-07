# Fitzig

Fitzig is a mobile workout tracker built with Expo + React Native.  
Current in-app release version: `0.2.0`.

## Current Feature Set
- Session template creation with sets, cooldown, and exercise durations
- Guided run flow with exercise and cooldown phases
- Pause, resume, stop, and skip cooldown controls
- Accurate timer correction after app interruptions
- Recover in-progress sessions from saved snapshot
- Completion logging per set and per exercise
- Report tab with streaks, volume stats, and top exercises
- Exercise-specific icons across create, run, complete, and report screens
- Settings for haptics, sound, and countdown behavior
- Calm gradient visual system with solid cards for readability

## Screens
- `Home`: start new session, resume/discard active snapshot, templates, recent sessions, app version label
- `Report`: training analytics and top exercises
- `Create Session`: compose templates and pick exercise durations
- `Run Session`: animated timer and phase-aware visual feedback
- `Complete Session`: submit counts and save history
- `Settings`: cue preferences and countdown duration

## Data and Storage
- Local-only storage via AsyncStorage
- Persists templates, completed sessions, active session snapshot, and app settings
- No cloud sync or account system in current scope

## Tech Stack
- Expo SDK 54
- React Native + Expo Router
- TypeScript
- AsyncStorage
- Expo Haptics
- Expo Linear Gradient
- Ionicons via `@expo/vector-icons`

## Key Paths
- `app/(tabs)/index.tsx`
- `app/(tabs)/report.tsx`
- `app/session/create.tsx`
- `app/session/run.tsx`
- `app/session/complete.tsx`
- `app/settings.tsx`
- `constants/exercises.ts`
- `components/exercise-icon.tsx`
- `components/app-gradient-background.tsx`
- `components/gradient-hero.tsx`
- `lib/workout-storage.ts`
- `lib/session-runner.ts`

## Local Development
```bash
npm install
npm run start
```

Open on device/emulator:
```bash
npm run android
# or
npm run ios
```

## Release Automation (APK to GitHub Releases)
- Workflow: `.github/workflows/release-apk.yml`
- EAS config: `eas.json`
- Required GitHub secret: `EXPO_TOKEN`

Default behavior:
- Trigger on git tags matching `v*`
- Build Android APK using EAS profile `release`
- Upload APK as a GitHub Release asset

Example:
```bash
git tag v0.2.0
git push origin main
git push origin v0.2.0
```

## Notes
- For Play Store release, use an AAB build profile (not APK).
- `android.package` is set to `com.craftonics.fitzig` in `app.json`.

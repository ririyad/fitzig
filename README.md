# Fitzig

A minimal, fitness‑oriented workout tracker built with React Native + Expo Router.

## What This App Does (Current)
- Create workout session templates (name, sets, cooldown, up to 5 exercises)
- Run timed sessions with exercise + cooldown sequencing
- Pause/resume/stop controls with safe discard flow
- Countdown before start/resume (configurable)
- Resume interrupted sessions from saved snapshot
- Record per‑set counts after completion
- Persist templates and completed sessions locally
- Persist in-progress session snapshot + app settings locally
- Modern dark UI with compact header + Manrope typography

## What’s Been Implemented
- **Home**: templates list + past sessions list
- **Home Resume Card**: resume or discard saved in-progress session
- **Create Session**: form to build a template with exercise durations
- **Run Session**: accurate timer correction, pause/resume/stop, cooldown skip, and interruption recovery
- **Complete Session**: log counts per exercise/set
- **Settings**: haptics/sound/countdown preferences
- **Local Storage**: AsyncStorage-backed persistence
- **Styling**: calm static blue-teal gradients on page/hero surfaces, solid cards for readability, premium typography

## What Still Needs To Be Done
- Optional: session history detail view
- Optional: edit/delete templates
- Optional: cloud backup / Google sign‑in

## Tech Stack
- Expo + React Native
- Expo Router (file-based routing)
- AsyncStorage (local persistence)
- Manrope fonts (`@expo-google-fonts/manrope`)

## Project Structure (Key Files)
- `app/(tabs)/index.tsx`: Home screen
- `app/settings.tsx`: Session settings screen
- `app/session/create.tsx`: Create session screen
- `app/session/run.tsx`: Timer flow
- `app/session/complete.tsx`: Completion logging
- `lib/workout-storage.ts`: Storage layer
- `lib/session-runner.ts`: Session transition and timer correction logic
- `constants/exercises.ts`: Exercise list
- `types/workout.ts`: Types

## Getting Started
1. Install dependencies

   ```bash
   npm install
   ```

2. Start Expo

   ```bash
   npm run start
   ```

3. Run on Android

   ```bash
   npm run android
   ```

## Notes
- Data is stored locally only.
- Fonts load at app start; if fonts fail to load, check `@expo-google-fonts/manrope` and network access.

## Styling System
- The app uses `expo-linear-gradient` for static background and hero gradients.
- Gradient tokens and per-screen variants live in `/Users/rashedulriyad/Documents/codespace/apps/fitzig/constants/gradients.ts`.
- Reusable wrappers:
  - `/Users/rashedulriyad/Documents/codespace/apps/fitzig/components/app-gradient-background.tsx`
  - `/Users/rashedulriyad/Documents/codespace/apps/fitzig/components/gradient-hero.tsx`
- Cards, forms, and tab bar intentionally remain solid for contrast and legibility.

## APK Release Automation
- GitHub Actions workflow: `/Users/rashedulriyad/Documents/codespace/apps/fitzig/.github/workflows/release-apk.yml`
- EAS profile config: `/Users/rashedulriyad/Documents/codespace/apps/fitzig/eas.json`
- Required repository secret: `EXPO_TOKEN`

### Default Trigger
- Push a tag that starts with `v` (example: `v1.0.1`) to build APK and publish a GitHub Release asset.
- Manual trigger is also available via `workflow_dispatch`.

### Quick Usage
```bash
git tag v1.0.1
git push origin v1.0.1
```

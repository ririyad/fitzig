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
- **Styling**: dark theme, tighter spacing, premium typography

## What Still Needs To Be Done
- Update `package-lock.json` by running `npm install` (network required)
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

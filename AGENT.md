# Workout Tracker Outline

## 1) Goals and Scope
- Primary users and use cases
- Platforms (web, mobile, desktop)
- Offline vs online requirements
- Privacy and data retention expectations

## 2) Core Features (MVP)
- User authentication
- Workout logging (exercises, sets, reps, weight, time)
- Exercise library (predefined + custom)
- History view (by date, workout type)
- Basic stats (volume, PRs, streaks)

## 2.1) Baseline Feature To Implement First
- Workout log (single session):
- Add an exercise name.
- Add one or more sets (reps, weight, optional notes).
- Show a list of sets added in the current session.
- Store locally (device storage) so it persists between app launches.

## 3) Data Model
- User
- Workout
- Exercise
- Set/Entry
- Program/Template
- Measurements (optional)

## 4) UX Flow
- Onboarding
- Log workout flow
- Edit workout flow
- View history flow
- View progress/stats flow

## 5) Non-Functional Requirements
- Performance targets
- Data integrity and backups
- Security (auth, encryption)
- Accessibility

## 6) Technical Architecture
- Frontend framework
- Backend/API
- Database
- Hosting/Deployment
- Analytics/Telemetry

## 7) Integrations (Optional)
- HealthKit / Google Fit
- Wearables
- Export (CSV/JSON)

## 8) Milestones
- MVP
- Beta
- V1

## 9) Open Questions
- Target audience (beginners, athletes, coaches)
- Monetization (free, subscription, one-time)
- Platforms and devices
- Data migration needs




### Outline
---

- User Sign in/Sign Up with Google cred (will be used to backup their own data)
- Menu: 'Create New Workout Session'
- Workout Session Contains:
    - Session Name
    - No of Sets
    - Add Wrokout from Pre defined Workout option (Push Up, Pull Up, Sqaut etc) from the dropdown
        - User can select at most 5 workout types (for now). 
    - The way user select workout will be appeared in the workout session sequentially
    - How it will work: For example: If they have only Push up in a workout session, 
        then they can set time (e.g 45 sec), with 3 sets configured, then when the session starts, 
        a stopwatch with the workout name (Push Up) will be appeared and 45 sec timer will be started.
        After 45 seconds goes to 0, there will be 'Cooldown Time' (e.g 20 sec) which can also be set during crearting workout session. After cooldown, again 45 sec timer will be started. Then
        after cooldown timing ends, again, the 3rd time the 45 sec timer will be appeared. Then as three session is completed, the workout session will be completed. After completion, user can input how many pushup they did for each set. The push up count will be recored along with other workout info. If users sets multiple types of workout (2 sets: Push Up and Squat), then when the
        session starts, according to sequence the first workout will be started with timer then cooldown then 2nd workout type will be started then cooldown. 1st set completed. Then 2nd set will be 
        started and repeat like 1st set. After that, the session is completed. All the workout types 
        are quantifiable: user can optionally input the number of pushup. squat etc.

    - I would require a collection of workout types based on above task. For now, I will focus only
    on freehand based home workout- the workout can be done in home without any equipment.
    
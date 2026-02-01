# CLAUDE.md - AI Assistant Guide for Athlete Portal

This document provides guidance for AI assistants working with the Athlete Portal codebase.

## Repository Overview

**Project:** Athlete Portal
**Founder:** Donald Meador
**Status:** MVP Development
**Platform:** iOS-first (React Native/Expo)
**Last Updated:** 2026-02-01

Athlete Portal is a digital platform that connects youth baseball players (8U-14U) with travel teams. Parents can showcase their child's stats and availability, while coaches can find qualified players using filters and auto-matching.

---

## Project Structure

```
Athlete/
├── CLAUDE.md                    # AI assistant guidance (this file)
├── App.tsx                      # Main app entry point
├── app.json                     # Expo configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── babel.config.js              # Babel configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── assets/                      # Static assets (icons, splash)
└── src/
    ├── components/
    │   └── common/
    │       ├── Button.tsx       # Reusable button component
    │       └── Input.tsx        # Reusable input component
    ├── config/
    │   ├── constants.ts         # App constants, colors, positions
    │   └── firebase.ts          # Firebase initialization
    ├── contexts/
    │   └── AuthContext.tsx      # Authentication context provider
    ├── navigation/
    │   ├── RootNavigator.tsx    # Root navigation (auth flow)
    │   ├── ParentTabNavigator.tsx   # Parent user tabs
    │   └── CoachTabNavigator.tsx    # Coach user tabs
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   ├── SignUpScreen.tsx
    │   │   └── RoleSelectionScreen.tsx
    │   ├── parent/
    │   │   ├── PlayerDashboardScreen.tsx
    │   │   ├── PlayerProfileScreen.tsx
    │   │   ├── EditPlayerScreen.tsx
    │   │   ├── AvailabilityScreen.tsx
    │   │   ├── VideosScreen.tsx
    │   │   └── MatchesScreen.tsx
    │   ├── coach/
    │   │   ├── TeamDashboardScreen.tsx
    │   │   ├── TeamProfileScreen.tsx
    │   │   ├── EditTeamScreen.tsx
    │   │   ├── PlayerNeedsScreen.tsx
    │   │   └── PlayerSearchScreen.tsx
    │   └── shared/
    │       ├── PlayerDetailScreen.tsx
    │       ├── TeamDetailScreen.tsx
    │       ├── MessagesScreen.tsx
    │       ├── ConversationScreen.tsx
    │       └── SettingsScreen.tsx
    ├── services/
    │   ├── playerService.ts     # Player CRUD operations
    │   ├── teamService.ts       # Team CRUD operations
    │   ├── matchingService.ts   # Player-team matching engine
    │   └── messagingService.ts  # Real-time messaging
    └── types/
        └── index.ts             # TypeScript type definitions
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native (Expo) |
| Language | TypeScript |
| Backend | Firebase |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Navigation | React Navigation v6 |
| State | React Context + Zustand |
| Styling | StyleSheet (React Native) |

---

## Development Workflow

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Emulator
- Firebase project (see Environment Setup)

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Create a Firebase project at https://console.firebase.google.com
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Add Firebase config values to `.env`

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Branch Naming Conventions

- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Documentation: `docs/<description>`
- Claude AI branches: `claude/<session-id>`

### Commit Message Guidelines

```
<type>: <short description>

[optional body with more details]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Key Concepts

### User Roles

1. **Parent** - Creates player profiles, manages availability, connects with teams
2. **Coach** - Creates team profiles, searches for players, manages player needs

### Core Data Models

| Model | Description |
|-------|-------------|
| `User` | Base user with role (parent/coach) |
| `Player` | Child profile with stats, positions, availability |
| `Team` | Travel team with needs, tournaments, contact info |
| `Match` | Auto-generated player-team compatibility match |
| `Conversation` | Message thread between parent and coach |
| `Message` | Individual chat message |

### Matching Algorithm

The rule-based matching engine (`src/services/matchingService.ts`) calculates compatibility scores:

- **Position match (40 pts)**: Primary position = 40, Secondary = 25
- **Age group match (30 pts)**: Same age group required
- **Location match (20 pts)**: Same state = 20, Same city bonus = 5
- **Availability match (10-15 pts)**: Matching type and date overlap

Minimum score threshold: 50 points

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces and types |
| `src/config/constants.ts` | Colors, positions, age groups, states |
| `src/services/matchingService.ts` | Player-team matching algorithm |
| `src/contexts/AuthContext.tsx` | Authentication state management |
| `src/navigation/RootNavigator.tsx` | Main navigation routing |

---

## Common Tasks for AI Assistants

### When Starting Work

1. Read this CLAUDE.md file first
2. Check `src/types/index.ts` for data models
3. Review `src/config/constants.ts` for app constants
4. Understand the role-based navigation flow

### When Adding Features

1. Check existing services in `src/services/`
2. Follow the screen naming pattern: `<Entity><Action>Screen.tsx`
3. Add types to `src/types/index.ts`
4. Update navigation if adding new screens

### When Fixing Bugs

1. Check Firebase console for auth/database issues
2. Verify service methods handle errors properly
3. Test both parent and coach flows

---

## Firebase Collections

```
/users/{userId}
  - email, role, displayName, phoneNumber, createdAt, updatedAt

/players/{playerId}
  - parentId, firstName, lastName, dateOfBirth, ageGroup
  - location, primaryPosition, secondaryPositions
  - currentTeam, pastTeams, stats, highlightVideos
  - availability[], isActive, createdAt, updatedAt

/teams/{teamId}
  - coachId, name, ageGroup, location, description
  - tournaments[], playerNeeds[], contactEmail
  - contactPhone, website, isActive, createdAt, updatedAt

/matches/{matchId}
  - playerId, teamId, score, matchedOn{}, status, createdAt

/conversations/{conversationId}
  - parentId, coachId, playerId, teamId
  - lastMessage, unreadCount{}, createdAt, updatedAt

/messages/{messageId}
  - conversationId, senderId, senderRole, content
  - read, createdAt
```

---

## Design System

### Colors

```typescript
COLORS = {
  primary: '#1E3A5F',    // Deep navy blue
  secondary: '#E63946',   // Baseball red
  background: '#F8F9FA',
  surface: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}
```

### Component Patterns

- Use `Button` component for all actions
- Use `Input` component for form fields
- Screens end with `Screen.tsx`
- Services export async functions

---

## Future Enhancements (Post-MVP)

- [ ] Video upload to Firebase Storage
- [ ] Push notifications via Expo
- [ ] Premium subscription tiers
- [ ] Reviews/ratings system
- [ ] GameChanger stat syncing
- [ ] ML-enhanced matching
- [ ] Tryout event postings

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Firebase auth fails | Check .env file has correct credentials |
| Navigation error | Ensure screen is registered in navigator |
| TypeScript error | Check types in `src/types/index.ts` |
| Picker not working | Install `@react-native-picker/picker` |

### Debug Commands

```bash
# Clear Metro cache
expo start -c

# Check Expo logs
expo diagnostics
```

---

## Security Notes

- Never commit `.env` file
- Use environment variables for all secrets
- Validate user input before Firestore writes
- Implement Firestore security rules for production

---

## Changelog

- **2026-02-01:** Initial MVP development - complete app structure with authentication, player/team profiles, matching engine, and messaging

---

*Keep this document updated as the project evolves.*

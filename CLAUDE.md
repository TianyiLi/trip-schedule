# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

This is a React + TypeScript travel planning application built with Vite, following a **feature module architecture** based on the Structure.md guidelines.

### Feature Module Structure

Each feature follows a strict modular pattern under `src/features/`:

- **Pages**: Route-mounted components (e.g., `HomePage.tsx`) - no state management, only calls containers
- **Containers**: Business logic layer that orchestrates data and calls view components
- **Components/Views**: Pure UI components that only receive props and use `useState`/`useReducer`
- **API, Hooks, Utils, Constants, Assets, Context, Store**: Supporting modules

### Core Architecture Patterns

1. **Page → Container → View Pattern**:
   - Pages are mounted to routes and simply return containers
   - Containers handle all business logic, API calls, and state management
   - Views are pure components that receive all data/callbacks via props

2. **Feature Modules**: Each feature (`home`, `trip-planning`, `navigation`, `archive`, `settings`) is completely self-contained with its own structure

3. **Shared Resources**: Cross-feature components, contexts, types, and utilities in `src/shared/`

### Key Technologies

- **React Router**: Nested routing with Layout wrapper
- **React i18n**: Multi-language support (en, zh-TW, zh-CN, ja, ko)
- **React Beautiful DnD**: Drag-and-drop for location reordering
- **Google Maps API**: Map integration (requires API key in `.env`)
- **TailwindCSS**: Styling
- **TypeScript**: Type safety
- **Context API**: Global trip state management via `TripContext`

### State Management

- **Global State**: `TripContext` provides trip CRUD operations and persists to localStorage
- **Local State**: Components use `useState`/`useReducer` only
- **No external state libraries**: Uses React Context + localStorage persistence

### Internationalization

- **i18n Structure**: Language files in `src/shared/i18n/locales/`
- **Key Convention**: 
  - `nav.*` for navigation menu items
  - `navigation.*` for navigation feature functionality
  - Avoid duplicate keys across different contexts
- **Usage**: Import `useTranslation` and use `t('key.path')`

### Important Implementation Notes

- **Google Maps**: Requires `VITE_GOOGLE_MAPS_API_KEY` environment variable
- **Component Isolation**: Views must be pure - no context/hooks except `useState`/`useReducer`
- **File Naming**: Pages use `XXXXPage.tsx` convention
- **No Direct API calls**: All data operations go through TripContext
- **i18n Integration**: All user-facing text must use translation keys

### Development Workflow

When adding new features:
1. Create feature module directory structure
2. Implement Page → Container → View pattern
3. Add i18n keys for all user-facing text
4. Use TripContext for data operations
5. Ensure components remain pure (props-only)

The codebase emphasizes separation of concerns, with clear boundaries between presentation, business logic, and data management layers.
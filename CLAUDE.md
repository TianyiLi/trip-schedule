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
- **React Beautiful DnD**: Drag-and-drop for location reordering (StrictMode disabled for compatibility)
- **OpenStreetMap Nominatim API**: Free location search service (Google Maps view temporarily disabled)
- **TailwindCSS**: Styling
- **TypeScript**: Type safety
- **Context API**: Global trip state management via `TripContext`

### State Management

- **Global State**: `TripContext` provides trip CRUD operations and persists to localStorage
- **Local State**: Components use `useState`/`useReducer` only
- **No external state libraries**: Uses React Context + localStorage persistence

### Internationalization

- **i18n Structure**: Language files in `src/shared/i18n/locales/`
- **Supported Languages**: English (en), Traditional Chinese (zh-TW), Simplified Chinese (zh-CN), Japanese (ja), Korean (ko)
- **Key Convention**: 
  - `nav.*` for navigation menu items
  - `navigation.*` for navigation feature functionality
  - `home.*` for home page content
  - `trip.*` for trip-related actions
  - `planning.*` for trip planning page
  - `addLocation.*` for add location modal
  - `location.*` for location card actions (openInGoogleMaps, navigate, remove, etc.)
  - `common.*` for shared UI elements
  - Avoid duplicate keys across different contexts
- **Usage**: Import `useTranslation` and use `t('key.path')`
- **Implementation Status**: ✅ Fully implemented across all components

### Important Implementation Notes

- **Location Search**: Uses OpenStreetMap Nominatim API (free, no API key required)
  - Debounced search with 300ms delay
  - Returns real coordinates for accurate location data
  - Fallback to Taipei coordinates if no search selection
- **Google Maps**: Map view temporarily disabled (Google Maps API integration ready but not active)
- **React StrictMode**: Disabled to ensure React Beautiful DnD compatibility
- **Component Isolation**: Views must be pure - no context/hooks except `useState`/`useReducer`
- **File Naming**: Pages use `XXXXPage.tsx` convention
- **No Direct API calls**: All data operations go through TripContext
- **i18n Integration**: All user-facing text must use translation keys

### Development Workflow

When adding new features:
1. Create feature module directory structure
2. Implement Page → Container → View pattern
3. Add i18n keys for all user-facing text in all 5 language files
4. Use TripContext for data operations
5. Ensure components remain pure (props-only)

### Recent Implementation Status

✅ **Completed Features:**
- Trip CRUD operations (create, read, update, delete)
- Location management with drag-and-drop reordering
- Location removal functionality
- Real-time location search with OpenStreetMap Nominatim API
- Full i18n support across all components
- GitHub Pages deployment with routing fix

🚧 **Temporarily Disabled:**
- Google Maps integration (code exists but commented out)
- Map view in trip planning page

⚠️ **Known Issues:**
- React StrictMode disabled for drag-and-drop compatibility
- Location search requires internet connection

The codebase emphasizes separation of concerns, with clear boundaries between presentation, business logic, and data management layers.
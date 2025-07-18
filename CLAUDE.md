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
- **Google OAuth 2.0**: Authentication via `@react-oauth/google` library
- **Google Drive API**: Cloud storage for trip data synchronization
- **TailwindCSS**: Styling
- **TypeScript**: Type safety
- **Context API**: Global trip state management via `TripContext` + `GoogleAuthContext`

### State Management

- **Global State**: `TripContext` provides trip CRUD operations and persists to localStorage
- **Authentication State**: `GoogleAuthContext` manages OAuth login/logout and user session
- **Cloud Sync**: Automatic sync between local storage and Google Drive
- **Local State**: Components use `useState`/`useReducer` only
- **No external state libraries**: Uses React Context + localStorage + Google Drive persistence

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
  - `auth.*` for authentication UI (signIn, signOut, syncing, etc.)
  - `settings.*` for settings page content (including sync actions)
  - `common.*` for shared UI elements
  - **CRITICAL**: Avoid duplicate keys across different contexts
- **Usage**: Import `useTranslation` and use `t('key.path')`
- **Implementation Status**: ✅ Fully implemented across all components

#### 🚨 **i18n Key Management Protocol**

**BEFORE adding new i18n keys, ALWAYS follow this checklist:**

1. **Check Existing Keys**: Search all language files for similar keys
   ```bash
   # Search for existing keys in all locale files
   grep -r "keyName" src/shared/i18n/locales/
   ```

2. **Verify Key Uniqueness**: Ensure no duplicate keys exist
   - Check if similar functionality already has keys
   - Avoid creating `settings.sync.title` if `sync.title` already exists
   - Avoid creating `auth.loading` if `common.loading` already exists

3. **Use Hierarchical Naming**: Follow consistent hierarchy
   ```
   ✅ GOOD:
   - auth.signIn, auth.signOut, auth.loading
   - settings.sync.title, settings.sync.upload
   - common.loading, common.error, common.success
   
   ❌ BAD:
   - signIn, authSignIn, googleSignIn (inconsistent)
   - syncTitle, uploadButton, downloadAction (flat structure)
   - loading, authLoading, syncLoading (duplicate concepts)
   ```

4. **Reuse Common Keys**: Use existing keys for common concepts
   - Use `common.loading` instead of creating feature-specific loading keys
   - Use `common.error` instead of creating duplicate error keys
   - Use `common.cancel`, `common.save`, `common.delete` for standard actions

5. **Document New Key Categories**: When adding new top-level categories, document them in this file

6. **Multi-language Consistency**: Ensure all 5 language files get the same key structure
   - en.json, zh-TW.json, zh-CN.json, ja.json, ko.json
   - Same key paths in all files
   - Meaningful translations for each language

#### **Current Key Inventory** (as of latest update):
- `app.*` - Application title and metadata
- `nav.*` - Navigation menu items
- `home.*` - Home page content and statistics
- `trip.*` - Trip-related actions and status
- `createTrip.*` - Create trip modal
- `planning.*` - Trip planning page
- `addLocation.*` - Add location modal
- `location.*` - Location card actions
- `auth.*` - Authentication UI
- `settings.*` - Settings page (including sync actions)
- `common.*` - Shared UI elements

**When in doubt, use existing keys rather than creating new ones!**

### Important Implementation Notes

- **Location Search**: Uses OpenStreetMap Nominatim API (free, no API key required)
  - Debounced search with 300ms delay
  - Returns real coordinates for accurate location data
  - Fallback to Taipei coordinates if no search selection
- **Google OAuth**: Uses `@react-oauth/google` with authorization code flow
  - Requires `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_SECRET`, `VITE_GOOGLE_REDIRECT_URI`
  - Scopes: `openid`, `profile`, `email`, `https://www.googleapis.com/auth/drive.file`
- **Google Drive Integration**: Automatic cloud storage sync
  - Creates `TripSchedule` folder in user's Google Drive
  - Stores trip data as `trips.json` with conflict resolution
  - Auto-sync on login and manual sync available
- **Google Maps**: Map view temporarily disabled (Google Maps API integration ready but not active)
- **React StrictMode**: Disabled to ensure React Beautiful DnD compatibility
- **Component Isolation**: Views must be pure - no context/hooks except `useState`/`useReducer`
- **File Naming**: Pages use `XXXXPage.tsx` convention
- **No Direct API calls**: All data operations go through TripContext
- **i18n Integration**: All user-facing text must use translation keys

### Schema Management and Data Validation

**IMPORTANT**: All storage operations must include schema validation to ensure data integrity.

#### Schema Validation Requirements

1. **Trip Data Schema**: Located at `src/shared/schemas/tripDataSchema.ts`
   - Uses AJV with ajv-formats for JSON schema validation
   - Validates trip data structure before storage operations
   - Supports date-time format validation for all date fields
   - Mandatory for all Google Drive sync operations

2. **Storage Operations Protocol**:
   - **Upload to Cloud**: Always validate data before uploading
   - **Download from Cloud**: Always validate data after downloading
   - **Local Storage**: Consider validation for critical operations
   - **Import/Export**: Validate data during import operations

3. **Schema Update Process**:
   - When modifying Trip or Location interfaces, update corresponding schema
   - Test validation with sample data
   - Ensure backward compatibility when possible
   - Document breaking changes

4. **Error Handling**:
   - Schema validation errors should be user-friendly
   - Log detailed validation errors for debugging
   - Provide recovery options when validation fails

#### Current Schema Version: 1.0

The schema validates:
- Trip data structure (id, title, description, dates, locations, status)
- Location data structure (id, name, address, coordinates)
- Metadata (lastModified, version)
- Required fields and data types
- No additional properties allowed

#### Implementation Example

```typescript
import { tripDataValidator } from '../schemas/tripDataSchema';

// Before uploading
const validation = tripDataValidator.validateTripData(data);
if (!validation.isValid) {
  const errors = tripDataValidator.getFormattedErrors(validation.errors);
  throw new Error(`Invalid data: ${errors.join(', ')}`);
}
```

#### Dependencies

- **ajv**: Core JSON schema validation library
- **ajv-formats**: Format validation including date-time support
- Both packages are required for proper schema validation

### Development Workflow

When adding new features:
1. Create feature module directory structure
2. Implement Page → Container → View pattern
3. **🚨 CRITICAL i18n Step**: Before adding ANY new i18n keys:
   - Search existing keys: `grep -r "keyName" src/shared/i18n/locales/`
   - Check Current Key Inventory in this document
   - Reuse existing keys when possible (especially `common.*` keys)
   - Follow hierarchical naming convention
   - Add new keys to ALL 5 language files consistently
4. Use TripContext for data operations
5. Ensure components remain pure (props-only)
6. **🚨 CRITICAL Schema Step**: When working with storage operations:
   - Always validate data with schema before saving
   - Update schema when modifying data structures
   - Test with sample data after schema changes
7. Update Key Inventory in CLAUDE.md if new top-level categories are added

### Recent Implementation Status

✅ **Completed Features:**
- Trip CRUD operations (create, read, update, delete)
- Location management with drag-and-drop reordering
- Location removal functionality
- Real-time location search with OpenStreetMap Nominatim API
- Full i18n support across all components
- GitHub Pages deployment with routing fix
- Google OAuth 2.0 authentication with `@react-oauth/google`
- Google Drive API integration for cloud storage
- Automatic trip data synchronization between local storage and cloud
- Sync status notifications and user authentication UI
- File selection dialog for Google Drive sync operations
- Schema validation with AJV for all storage operations
- Custom filename support for cloud storage
- Data integrity validation for upload/download operations

🚧 **Temporarily Disabled:**
- Google Maps integration (code exists but commented out)
- Map view in trip planning page

⚠️ **Known Issues:**
- React StrictMode disabled for drag-and-drop compatibility
- Location search requires internet connection
- Google OAuth requires proper environment variables configuration
- Google Drive API requires user consent for file access scope

The codebase emphasizes separation of concerns, with clear boundaries between presentation, business logic, and data management layers.
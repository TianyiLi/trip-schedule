# Trip Schedule

A React + TypeScript travel planning application built with Vite, featuring multi-language support and Google Maps integration.

## 🚀 Live Demo

[View Live Application](https://yourusername.github.io/trip-schedule/)

## Features

- **Trip Planning**: Create and manage travel itineraries
- **Location Management**: Add, edit, and reorder locations with drag-and-drop
- **Navigation**: Integrated Google Maps for route planning
- **Multi-language Support**: Available in English, Chinese (Traditional/Simplified), Japanese, and Korean
- **Archive**: Keep track of completed trips
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **Maps**: Google Maps API
- **Internationalization**: react-i18next
- **Drag & Drop**: react-beautiful-dnd
- **Routing**: React Router
- **State Management**: React Context API

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
4. Start the development server: `npm run dev`

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. Every push to the main branch triggers a new deployment.

## Architecture

The project follows a feature module architecture with clear separation of concerns:

- **Feature Modules**: Each feature (`home`, `trip-planning`, `navigation`, `archive`, `settings`) is self-contained
- **Shared Resources**: Common components, contexts, and utilities in `src/shared/`
- **Page → Container → View Pattern**: Clean separation between routing, business logic, and presentation

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md)

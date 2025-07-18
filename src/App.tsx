import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as JotaiProvider } from 'jotai';
import { DevTools as JotaiDevTools } from 'jotai-devtools';
import { TripProvider } from './shared/contexts/TripContext';
import { GoogleAuthProvider } from './shared/contexts/GoogleAuthContext';
import Layout from './pages/layout/Layout';
import HomePage from './features/home/pages/HomePage';
import TripPlanningPage from './features/trip-planning/pages/TripPlanningPage';
import NavigationPage from './features/navigation/pages/NavigationPage';
import ArchivePage from './features/archive/pages/ArchivePage';
import SettingsPage from './features/settings/pages/SettingsPage';
import './shared/i18n';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <GoogleAuthProvider>
          <TripProvider>
            <Router basename="/trip-schedule">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="planning" element={<TripPlanningPage />} />
                  <Route path="navigation" element={<NavigationPage />} />
                  <Route path="archived" element={<ArchivePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Router>
          </TripProvider>
          <Toaster position="top-right" />
        </GoogleAuthProvider>
        {process.env.NODE_ENV === 'development' && (
          <>
            <ReactQueryDevtools initialIsOpen={false} />
            <JotaiDevTools />
          </>
        )}
      </JotaiProvider>
    </QueryClientProvider>
  );
}

export default App;
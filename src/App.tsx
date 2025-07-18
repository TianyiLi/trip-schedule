import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './shared/contexts/TripContext';
import Layout from './pages/layout/Layout';
import HomePage from './features/home/pages/HomePage';
import TripPlanningPage from './features/trip-planning/pages/TripPlanningPage';
import NavigationPage from './features/navigation/pages/NavigationPage';
import ArchivePage from './features/archive/pages/ArchivePage';
import SettingsPage from './features/settings/pages/SettingsPage';
import './shared/i18n';

function App() {
  return (
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
  );
}

export default App;
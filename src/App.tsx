import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './contexts/TripContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TripPlanning from './pages/TripPlanning';
import Navigation from './pages/Navigation';
import ArchivedTrips from './pages/ArchivedTrips';
import Settings from './pages/Settings';

function App() {
  return (
    <TripProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="planning" element={<TripPlanning />} />
            <Route path="navigation" element={<Navigation />} />
            <Route path="archived" element={<ArchivedTrips />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </TripProvider>
  );
}

export default App;
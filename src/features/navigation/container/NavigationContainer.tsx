import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { Location } from '../../../shared/types';
import NavigationView from '../components/NavigationView';

const NavigationContainer: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useTrip();
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [completedLocations, setCompletedLocations] = useState<Set<string>>(new Set());

  // Get active trip (first non-completed trip)
  const currentTrip = useMemo(() => {
    return state.trips.find(trip => !trip.isCompleted && trip.locations.length > 0) || null;
  }, [state.trips]);

  const currentLocation = currentTrip?.locations[currentLocationIndex];
  const nextLocation = currentTrip?.locations[currentLocationIndex + 1];

  const handleMarkComplete = (locationId: string) => {
    setCompletedLocations(prev => new Set(prev).add(locationId));
  };

  const handleNext = () => {
    if (currentTrip && currentLocationIndex < currentTrip.locations.length - 1) {
      setCurrentLocationIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentLocationIndex > 0) {
      setCurrentLocationIndex(prev => prev - 1);
    }
  };

  const openNavigation = (location: Location) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      location.address
    )}`;
    window.open(url, '_blank');
  };

  const openGoogleMaps = (location: Location) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location.address
    )}`;
    window.open(url, '_blank');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const progress = currentTrip 
    ? ((currentLocationIndex + 1) / currentTrip.locations.length) * 100 
    : 0;

  return (
    <NavigationView
      currentTrip={currentTrip}
      currentLocation={currentLocation}
      nextLocation={nextLocation}
      currentLocationIndex={currentLocationIndex}
      completedLocations={completedLocations}
      progress={progress}
      onMarkComplete={handleMarkComplete}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onOpenNavigation={openNavigation}
      onOpenGoogleMaps={openGoogleMaps}
      onGoHome={handleGoHome}
    />
  );
};

export default NavigationContainer;
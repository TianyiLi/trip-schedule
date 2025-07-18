import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { Location, Trip } from '../../../shared/types';
import { DropResult } from 'react-beautiful-dnd';
import TripPlanningView from '../components/TripPlanningView';

const TripPlanningContainer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, reorderLocations, updateTrip } = useTrip();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Get trip ID from URL params
  useEffect(() => {
    const tripId = searchParams.get('tripId');
    if (tripId) {
      const trip = state.trips.find(t => t.id === tripId);
      if (trip) {
        setSelectedTrip(trip);
      }
    }
  }, [state.trips, searchParams]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedTrip) return;

    const items = Array.from(selectedTrip.locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderLocations(selectedTrip.id, items);
    setSelectedTrip({ ...selectedTrip, locations: items });
  };

  const handleAddLocation = (location: Location) => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      locations: [...selectedTrip.locations, location],
      updatedAt: new Date()
    };
    
    updateTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    setShowAddLocation(false);
  };

  const handleSaveTrip = () => {
    if (selectedTrip) {
      updateTrip({ ...selectedTrip, updatedAt: new Date() });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <TripPlanningView
      selectedTrip={selectedTrip}
      viewMode={viewMode}
      showAddLocation={showAddLocation}
      onViewModeChange={setViewMode}
      onShowAddLocation={setShowAddLocation}
      onDragEnd={handleDragEnd}
      onAddLocation={handleAddLocation}
      onSaveTrip={handleSaveTrip}
      onBackToHome={handleBackToHome}
    />
  );
};

export default TripPlanningContainer;
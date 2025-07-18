import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { Location, Trip } from '../../../shared/types';
import { DropResult } from 'react-beautiful-dnd';
import TripPlanningView from '../components/TripPlanningView';

const TripPlanningContainer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, reorderLocations, updateTrip, removeLocation } = useTrip();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Get trip ID from URL params and sync with context state
  useEffect(() => {
    const tripId = searchParams.get('tripId');
    if (tripId) {
      const trip = state.trips.find(t => t.id === tripId);
      if (trip) {
        setSelectedTrip(trip);
      }
    }
  }, [state.trips, searchParams]);

  // Keep selected trip in sync with context state
  useEffect(() => {
    if (selectedTrip) {
      const updatedTrip = state.trips.find(t => t.id === selectedTrip.id);
      if (updatedTrip && updatedTrip !== selectedTrip) {
        setSelectedTrip(updatedTrip);
      }
    }
  }, [state.trips, selectedTrip]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedTrip) return;
    
    // If dropped in the same position, do nothing
    if (result.destination.index === result.source.index) return;

    const items = Array.from(selectedTrip.locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the trip order in context - state will be synced via useEffect
    reorderLocations(selectedTrip.id, items);
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

  const handleRemoveLocation = (locationId: string) => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      locations: selectedTrip.locations.filter(loc => loc.id !== locationId),
      updatedAt: new Date()
    };
    
    updateTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
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
      onRemoveLocation={handleRemoveLocation}
      onSaveTrip={handleSaveTrip}
      onBackToHome={handleBackToHome}
    />
  );
};

export default TripPlanningContainer;
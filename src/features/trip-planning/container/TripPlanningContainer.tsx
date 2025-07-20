import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { useGoogleAuth } from '../../../shared/contexts/GoogleAuthContext';
import { Location, Trip } from '../../../shared/types';
import { DropResult } from 'react-beautiful-dnd';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import TripPlanningView from '../components/TripPlanningView';

const TripPlanningContainer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { state, reorderLocations, updateTrip, uploadToCloud } = useTrip();
  const { isAuthenticated } = useGoogleAuth();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get trip ID from URL params and sync with context state
  useEffect(() => {
    const tripId = searchParams.get('tripId');
    if (tripId) {
      const trip = state.trips.find(t => t.id === tripId && !t.isCompleted);
      if (trip) {
        setSelectedTrip(trip);
        // Store last selected trip in localStorage
        localStorage.setItem('lastSelectedTripId', tripId);
      } else {
        // If trip is completed or not found, redirect to home
        navigate('/');
      }
    } else {
      // No tripId in URL, try to auto-select a trip
      const activeTrips = state.trips.filter(t => !t.isCompleted);
      if (activeTrips.length > 0) {
        // Try to get last selected trip from localStorage
        const lastSelectedTripId = localStorage.getItem('lastSelectedTripId');
        let tripToSelect = null;
        
        if (lastSelectedTripId) {
          tripToSelect = activeTrips.find(t => t.id === lastSelectedTripId);
        }
        
        // If no last selected trip or it's not found, select the most recently updated trip
        if (!tripToSelect) {
          tripToSelect = activeTrips.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
        }
        
        if (tripToSelect) {
          setSelectedTrip(tripToSelect);
          // Update URL with selected trip ID
          navigate(`/planning?tripId=${tripToSelect.id}`, { replace: true });
          localStorage.setItem('lastSelectedTripId', tripToSelect.id);
        }
      }
    }
  }, [state.trips, searchParams, navigate]);

  // Keep selected trip in sync with context state
  useEffect(() => {
    if (selectedTrip) {
      const updatedTrip = state.trips.find(t => t.id === selectedTrip.id);
      if (updatedTrip) {
        if (updatedTrip.isCompleted) {
          // If trip was completed, redirect to home
          navigate('/');
        } else if (updatedTrip !== selectedTrip) {
          setSelectedTrip(updatedTrip);
        }
      } else {
        // If trip was deleted, redirect to home
        navigate('/');
      }
    }
  }, [state.trips, selectedTrip, navigate]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !selectedTrip) return;
    
    // If dropped in the same position, do nothing
    if (result.destination.index === result.source.index) return;

    const items = Array.from(selectedTrip.locations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the trip order in context - state will be synced via useEffect
    reorderLocations(selectedTrip.id, items);
  }, [selectedTrip, reorderLocations]);

  const handleAddLocation = useCallback((location: Location) => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      locations: [...selectedTrip.locations, location],
      updatedAt: new Date()
    };
    
    updateTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
    setShowAddLocation(false);
  }, [selectedTrip, updateTrip]);

  const handleSaveTrip = useCallback(async () => {
    if (!selectedTrip) return;
    
    setIsSaving(true);
    
    try {
      // Update local data first
      updateTrip({ ...selectedTrip, updatedAt: new Date() });
      
      // If authenticated, sync to cloud
      if (isAuthenticated) {
        await uploadToCloud();
        toast.success(t('settings.messages.syncSuccess'));
      } else {
        toast.success(t('planning.save') + ' - ' + t('common.success'));
      }
    } catch (error) {
      console.error('Save/sync error:', error);
      
      // Show different error messages based on context
      if (isAuthenticated) {
        toast.error(`${t('settings.messages.syncFailed')}. ${t('settings.messages.checkConnection')}`);
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedTrip, updateTrip, isAuthenticated, uploadToCloud, t]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleRemoveLocation = useCallback((locationId: string) => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      locations: selectedTrip.locations.filter(loc => loc.id !== locationId),
      updatedAt: new Date()
    };
    
    updateTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
  }, [selectedTrip, updateTrip]);

  const handleUpdateTrip = useCallback((updates: { title?: string; description?: string }) => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      ...updates,
      updatedAt: new Date()
    };
    
    updateTrip(updatedTrip);
    setSelectedTrip(updatedTrip);
  }, [selectedTrip, updateTrip]);

  return (
    <TripPlanningView
      selectedTrip={selectedTrip}
      showAddLocation={showAddLocation}
      onShowAddLocation={setShowAddLocation}
      onDragEnd={handleDragEnd}
      onAddLocation={handleAddLocation}
      onRemoveLocation={handleRemoveLocation}
      onSaveTrip={handleSaveTrip}
      onBackToHome={handleBackToHome}
      onUpdateTrip={handleUpdateTrip}
      isSaving={isSaving}
    />
  );
};

export default TripPlanningContainer;
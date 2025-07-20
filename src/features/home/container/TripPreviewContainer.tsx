import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { Trip } from '../../../shared/types';
import TripPreviewDrawer from '../components/TripPreviewDrawer';

interface TripPreviewContainerProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

const TripPreviewContainer: React.FC<TripPreviewContainerProps> = ({
  trip,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { deleteTrip, completeTrip, uncompleteTrip, updateTrip } = useTrip();

  const handleEdit = (trip: Trip) => {
    // Close drawer and navigate to planning page
    onClose();
    localStorage.setItem('lastSelectedTripId', trip.id);
    navigate(`/planning?tripId=${trip.id}`);
  };

  const handleDelete = (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      deleteTrip(tripId);
      onClose();
    }
  };

  const handleComplete = (tripId: string) => {
    completeTrip(tripId);
    // Keep drawer open to show updated status
  };

  const handleUncomplete = (tripId: string) => {
    uncompleteTrip(tripId);
    // Keep drawer open to show updated status
  };

  const handleNavigate = (trip: Trip) => {
    onClose();
    if (trip.isCompleted) {
      // For completed trips, navigate to archive view
      navigate('/archived');
    } else {
      // For active trips, navigate to planning
      localStorage.setItem('lastSelectedTripId', trip.id);
      navigate(`/planning?tripId=${trip.id}`);
    }
  };

  const handleOpenLocation = (locationId: string) => {
    // Could implement location detail view in the future
    // For now, just scroll to location or show toast
    console.log('Open location:', locationId);
  };

  const handleUpdateTrip = (tripId: string, updates: { title?: string; description?: string }) => {
    updateTrip(tripId, updates);
  };

  return (
    <TripPreviewDrawer
      trip={trip}
      isOpen={isOpen}
      onClose={onClose}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onComplete={handleComplete}
      onUncomplete={handleUncomplete}
      onNavigate={handleNavigate}
      onOpenLocation={handleOpenLocation}
      onUpdateTrip={handleUpdateTrip}
    />
  );
};

export default TripPreviewContainer;
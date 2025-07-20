import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { Trip } from '../../../shared/types';
import HomeView from '../components/HomeView';
import TripPreviewContainer from './TripPreviewContainer';

const HomeContainer: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteTrip, completeTrip, uncompleteTrip } = useTrip();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);

  const filteredTrips = useMemo(() => {
    return state.trips.filter(trip => {
      const matchesSearch = 
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.locations.some(location => 
          location.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFilter = filterType === 'all' || 
        (filterType === 'active' && !trip.isCompleted) ||
        (filterType === 'completed' && trip.isCompleted);
      
      return matchesSearch && matchesFilter;
    });
  }, [state.trips, searchTerm, filterType]);

  const stats = useMemo(() => {
    const activeTrips = state.trips.filter(trip => !trip.isCompleted).length;
    const completedTrips = state.trips.filter(trip => trip.isCompleted).length;
    const totalLocations = state.trips.reduce((total, trip) => total + trip.locations.length, 0);
    
    return {
      activeTrips,
      completedTrips,
      totalLocations
    };
  }, [state.trips]);

  const handleTripSelect = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowPreviewDrawer(true);
  };

  const handleTripEdit = (trip: Trip) => {
    // For editing, navigate directly to planning
    localStorage.setItem('lastSelectedTripId', trip.id);
    navigate(`/planning?tripId=${trip.id}`);
  };

  const handleClosePreview = () => {
    setShowPreviewDrawer(false);
    setSelectedTrip(null);
  };

  return (
    <>
      <HomeView
        trips={filteredTrips}
        stats={stats}
        searchTerm={searchTerm}
        filterType={filterType}
        showCreateModal={showCreateModal}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterType}
        onTripSelect={handleTripSelect}
        onTripEdit={handleTripEdit}
        onTripDelete={deleteTrip}
        onTripComplete={completeTrip}
        onTripUncomplete={uncompleteTrip}
        onShowCreateModal={setShowCreateModal}
      />
      
      <TripPreviewContainer
        trip={selectedTrip}
        isOpen={showPreviewDrawer}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default HomeContainer;
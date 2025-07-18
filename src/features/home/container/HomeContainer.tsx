import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../../shared/contexts/TripContext';
import { Trip } from '../../../shared/types';
import HomeView from '../components/HomeView';

const HomeContainer: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteTrip, completeTrip } = useTrip();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    if (trip.isCompleted) {
      // For completed trips, navigate to archive view
      navigate('/archived');
    } else {
      // For active trips, navigate to planning and store as last selected
      localStorage.setItem('lastSelectedTripId', trip.id);
      navigate(`/planning?tripId=${trip.id}`);
    }
  };

  return (
    <HomeView
      trips={filteredTrips}
      stats={stats}
      searchTerm={searchTerm}
      filterType={filterType}
      showCreateModal={showCreateModal}
      onSearchChange={setSearchTerm}
      onFilterChange={setFilterType}
      onTripSelect={handleTripSelect}
      onTripDelete={deleteTrip}
      onTripComplete={completeTrip}
      onShowCreateModal={setShowCreateModal}
    />
  );
};

export default HomeContainer;
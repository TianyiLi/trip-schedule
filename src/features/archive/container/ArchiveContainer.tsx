import React, { useState, useMemo } from 'react';
import { useTrip } from '../../../shared/contexts/TripContext';
import { format } from 'date-fns';
import { Trip } from '../../../shared/types';
import ArchiveView from '../components/ArchiveView';

const ArchiveContainer: React.FC = () => {
  const { state, deleteTrip } = useTrip();
  const [searchTerm, setSearchTerm] = useState('');

  const completedTrips = useMemo(() => {
    return state.trips.filter(trip => trip.isCompleted);
  }, [state.trips]);
  
  const filteredTrips = useMemo(() => {
    return completedTrips.filter(trip =>
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.locations.some(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [completedTrips, searchTerm]);

  const stats = useMemo(() => {
    const totalLocations = completedTrips.reduce((total, trip) => total + trip.locations.length, 0);
    const totalDays = completedTrips.reduce((total, trip) => {
      const days = Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);

    return {
      completedTrips: completedTrips.length,
      totalLocations,
      totalDays
    };
  }, [completedTrips]);

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this trip?')) {
      deleteTrip(tripId);
    }
  };

  const exportToCSV = (trip: Trip) => {
    // Create CSV content
    const csvContent = [
      ['Trip Name', trip.title],
      ['Description', trip.description],
      ['Start Date', format(trip.startDate, 'yyyy-MM-dd')],
      ['End Date', format(trip.endDate, 'yyyy-MM-dd')],
      [''],
      ['Location', 'Address', 'Visit Time', 'Duration (min)', 'Notes'],
      ...trip.locations.map(loc => [
        loc.name,
        loc.address,
        loc.visitTime || '',
        loc.estimatedDuration?.toString() || '',
        loc.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.title.replace(/[^a-zA-Z0-9]/g, '_')}_trip.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ArchiveView
      trips={filteredTrips}
      stats={stats}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onDeleteTrip={handleDeleteTrip}
      onExportTrip={exportToCSV}
    />
  );
};

export default ArchiveContainer;
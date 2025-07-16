import React, { useState } from 'react';
import { useTrip } from '../contexts/TripContext';
import { Archive, Search, Calendar, MapPin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Trip } from '../types';

const ArchivedTrips: React.FC = () => {
  const { state, deleteTrip } = useTrip();
  const [searchTerm, setSearchTerm] = useState('');

  const completedTrips = state.trips.filter(trip => trip.isCompleted);
  
  const filteredTrips = completedTrips.filter(trip =>
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this trip?')) {
      deleteTrip(tripId);
    }
  };

  const exportToGoogleSheets = (trip: Trip) => {
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Archived Trips</h1>
        <p className="text-gray-600">Your completed travel memories</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search archived trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Trips</p>
              <p className="text-3xl font-bold text-green-600">{completedTrips.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Archive className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Locations Visited</p>
              <p className="text-3xl font-bold text-blue-600">
                {completedTrips.reduce((total, trip) => total + trip.locations.length, 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Travel Days</p>
              <p className="text-3xl font-bold text-purple-600">
                {completedTrips.reduce((total, trip) => 
                  total + Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)), 0
                )}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Trips */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <Archive size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No matching trips found' : 'No archived trips'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search criteria' : 'Complete some trips to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.title}</h3>
                    <p className="text-gray-600 mb-3">{trip.description}</p>
                    
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
                      Completed
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">
                      {format(trip.startDate, 'MMM dd')} - {format(trip.endDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{trip.locations.length} locations visited</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => exportToGoogleSheets(trip)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium"
                  >
                    Export to CSV
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedTrips;
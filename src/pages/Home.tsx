import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTrip } from '../contexts/TripContext';
import { Plus, Search, Filter } from 'lucide-react';
import TripCard from '../components/TripCard';
import CreateTripModal from '../components/CreateTripModal';
import { Trip } from '../types';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { state, deleteTrip, completeTrip } = useTrip();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'completed'>('all');

  const activeTrips = state.trips.filter(trip => !trip.isCompleted);
  const completedTrips = state.trips.filter(trip => trip.isCompleted);

  const filteredTrips = state.trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && !trip.isCompleted) ||
                         (filterType === 'completed' && trip.isCompleted);
    
    return matchesSearch && matchesFilter;
  });

  const handleTripSelect = (trip: Trip) => {
    // Navigate to trip planning page
    window.location.href = `/planning?tripId=${trip.id}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('home.title')}</h1>
        <p className="text-gray-600">{t('home.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('home.stats.activeTrips')}</p>
              <p className="text-3xl font-bold text-blue-600">{activeTrips.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Plus className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('home.stats.completedTrips')}</p>
              <p className="text-3xl font-bold text-green-600">{completedTrips.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Plus className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('home.stats.totalLocations')}</p>
              <p className="text-3xl font-bold text-purple-600">
                {state.trips.reduce((total, trip) => total + trip.locations.length, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Plus className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('home.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-500" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'active' | 'completed')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('home.search.filter.all')}</option>
              <option value="active">{t('home.search.filter.active')}</option>
              <option value="completed">{t('home.search.filter.completed')}</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>{t('home.newTrip')}</span>
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <Plus size={48} className="mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('home.noTrips.title')}</h3>
          <p className="text-gray-500 mb-6">
            <>{searchTerm ? t('home.noTrips.searchMessage') : t('home.noTrips.emptyMessage')}</>
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
          >
            {t('home.noTrips.createButton')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onSelect={handleTripSelect}
              onDelete={deleteTrip}
              onComplete={completeTrip}
            />
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
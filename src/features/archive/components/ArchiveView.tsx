import React from 'react';
import { Archive, Search, Calendar, MapPin, Trash2, ArchiveRestore } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Trip } from '../../../shared/types';

interface ArchiveViewProps {
  trips: Trip[];
  stats: {
    completedTrips: number;
    totalLocations: number;
    totalDays: number;
  };
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onExportTrip: (trip: Trip) => void;
  onUnarchiveTrip: (tripId: string) => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({
  trips,
  stats,
  searchTerm,
  onSearchChange,
  onDeleteTrip,
  onExportTrip,
  onUnarchiveTrip,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('archived.title')}</h1>
        <p className="text-gray-600">{t('archived.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('archived.search.placeholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('archived.stats.completedTrips')}</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedTrips}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Archive className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('archived.stats.totalLocationsVisited')}</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalLocations}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('archived.stats.totalTravelDays')}</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalDays}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Trips */}
      {trips.length === 0 ? (
        <div className="text-center py-12">
          <Archive size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? t('archived.noTrips.searchTitle') : t('archived.noTrips.emptyTitle')}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? t('archived.noTrips.searchMessage') : t('archived.noTrips.emptyMessage')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.title}</h3>
                    <p className="text-gray-600 mb-3">{trip.description}</p>
                    
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
                      {t('trip.completed')}
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
                    <span className="text-sm">{trip.locations.length} {t('archived.locationsVisited')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onUnarchiveTrip(trip.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                  >
                    <ArchiveRestore size={16} />
                    <span>{t('archived.unarchive')}</span>
                  </button>
                  
                  <button
                    onClick={() => onExportTrip(trip)}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium"
                  >
                    {t('archived.export')}
                  </button>
                  
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>{t('archived.delete')}</span>
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

export default ArchiveView;
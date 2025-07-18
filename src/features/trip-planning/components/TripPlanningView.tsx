import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Plus, MapPin, Save, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LocationCard from '../../../shared/components/LocationCard';
import GoogleMapsComponent from '../../../shared/components/GoogleMapsComponent';
import AddLocationModal from './AddLocationModal';
import { Location, Trip } from '../../../shared/types';

interface TripPlanningViewProps {
  selectedTrip: Trip | null;
  viewMode: 'list' | 'map';
  showAddLocation: boolean;
  onViewModeChange: (mode: 'list' | 'map') => void;
  onShowAddLocation: (show: boolean) => void;
  onDragEnd: (result: DropResult) => void;
  onAddLocation: (location: Location) => void;
  onSaveTrip: () => void;
  onBackToHome: () => void;
}

const TripPlanningView: React.FC<TripPlanningViewProps> = ({
  selectedTrip,
  viewMode,
  showAddLocation,
  onViewModeChange,
  onShowAddLocation,
  onDragEnd,
  onAddLocation,
  onSaveTrip,
  onBackToHome,
}) => {
  const { t } = useTranslation();

  if (!selectedTrip) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('planning.noTripSelected.title')}</h2>
        <p className="text-gray-600 mb-6">{t('planning.noTripSelected.message')}</p>
        <button
          onClick={onBackToHome}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          <ArrowLeft className="inline mr-2" size={20} />
          {t('planning.noTripSelected.backButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBackToHome}
              className="text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft size={20} className="inline mr-2" />
              {t('planning.backToHome')}
            </button>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedTrip.title}</h1>
            <p className="text-gray-600">{selectedTrip.description}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('planning.viewMode.list')}
              </button>
              <button
                onClick={() => onViewModeChange('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {t('planning.viewMode.map')}
              </button>
            </div>
            
            <button
              onClick={() => onShowAddLocation(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{t('planning.addLocation')}</span>
            </button>
            
            <button
              onClick={onSaveTrip}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{t('planning.save')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Locations List */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{t('planning.itinerary')}</h2>
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span className="text-sm">{selectedTrip.locations.length} {t('trip.locations')}</span>
              </div>
            </div>

            {selectedTrip.locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('planning.noLocations.title')}</h3>
                <p className="text-gray-500 mb-4">{t('planning.noLocations.message')}</p>
                <button
                  onClick={() => onShowAddLocation(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  {t('planning.noLocations.addButton')}
                </button>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="locations">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {selectedTrip.locations.map((location, index) => (
                        <LocationCard
                          key={location.id}
                          location={location}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('planning.mapView')}</h2>
          {selectedTrip.locations.length > 0 ? (
            <GoogleMapsComponent
              locations={selectedTrip.locations}
              height="600px"
            />
          ) : (
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">{t('planning.noLocations.mapMessage')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Location Modal */}
      {showAddLocation && (
        <AddLocationModal
          onClose={() => onShowAddLocation(false)}
          onAdd={onAddLocation}
        />
      )}
    </div>
  );
};

export default TripPlanningView;
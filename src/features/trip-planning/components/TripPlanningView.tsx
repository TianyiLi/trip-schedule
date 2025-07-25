import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Plus, MapPin, Save, ArrowLeft, Edit, Check, X, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import LocationCard from '../../../shared/components/LocationCard';
import AddLocationModal from './AddLocationModal';
import { Location, Trip } from '../../../shared/types';

interface TripPlanningViewProps {
  selectedTrip: Trip | null;
  showAddLocation: boolean;
  onShowAddLocation: (show: boolean) => void;
  onDragEnd: (result: DropResult) => void;
  onAddLocation: (location: Location) => void;
  onRemoveLocation: (locationId: string) => void;
  onSaveTrip: () => Promise<void>;
  onBackToHome: () => void;
  onUpdateTrip: (updates: { title?: string; description?: string; startDate?: Date; endDate?: Date }) => void;
  isSaving?: boolean;
}

const TripPlanningView: React.FC<TripPlanningViewProps> = ({
  selectedTrip,
  showAddLocation,
  onShowAddLocation,
  onDragEnd,
  onAddLocation,
  onRemoveLocation,
  onSaveTrip,
  onBackToHome,
  onUpdateTrip,
  isSaving = false,
}) => {
  const { t } = useTranslation();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const handleStartEditTitle = () => {
    if (!selectedTrip) return;
    setTempTitle(selectedTrip.title);
    setEditingTitle(true);
  };

  const handleStartEditDescription = () => {
    if (!selectedTrip) return;
    setTempDescription(selectedTrip.description);
    setEditingDescription(true);
  };

  const handleStartEditDates = () => {
    if (!selectedTrip) return;
    setTempStartDate(selectedTrip.startDate.toISOString().split('T')[0]);
    setTempEndDate(selectedTrip.endDate.toISOString().split('T')[0]);
    setEditingDates(true);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim() && tempTitle !== selectedTrip?.title) {
      onUpdateTrip({ title: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (tempDescription !== selectedTrip?.description) {
      onUpdateTrip({ description: tempDescription });
    }
    setEditingDescription(false);
  };

  const handleSaveDates = () => {
    if (!selectedTrip) return;
    
    const startDate = new Date(tempStartDate);
    const endDate = new Date(tempEndDate);
    
    // Validate dates
    if (startDate > endDate) {
      alert(t('createTrip.validation.endDateAfterStart'));
      return;
    }
    
    if (startDate.getTime() !== selectedTrip.startDate.getTime() || 
        endDate.getTime() !== selectedTrip.endDate.getTime()) {
      onUpdateTrip({ 
        startDate,
        endDate
      });
    }
    setEditingDates(false);
  };

  const handleCancelTitle = () => {
    setTempTitle('');
    setEditingTitle(false);
  };

  const handleCancelDescription = () => {
    setTempDescription('');
    setEditingDescription(false);
  };

  const handleCancelDates = () => {
    setTempStartDate('');
    setTempEndDate('');
    setEditingDates(false);
  };

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
          <div className="flex-1">
            <button
              onClick={onBackToHome}
              className="text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft size={20} className="inline mr-2" />
              {t('planning.backToHome')}
            </button>
            
            {/* Editable Title */}
            <div className="mb-2">
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="text-3xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 outline-none flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelTitle();
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={handleCancelTitle}
                    className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-3xl font-bold text-gray-800">{selectedTrip.title}</h1>
                  <button
                    onClick={handleStartEditTitle}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Editable Description */}
            <div className="mb-3">
              {editingDescription ? (
                <div className="flex items-start gap-2">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="text-gray-600 bg-gray-50 border border-gray-300 rounded p-2 flex-1 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                      if (e.key === 'Escape') handleCancelDescription();
                    }}
                    placeholder={t('trip.description')}
                    autoFocus
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={handleSaveDescription}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelDescription}
                      className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 group">
                  <p className="text-gray-600 flex-1">
                    {selectedTrip.description || t('trip.noDescription')}
                  </p>
                  <button
                    onClick={handleStartEditDescription}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all mt-0.5"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Editable Dates */}
            <div>
              {editingDates ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSaveDates}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={handleCancelDates}
                    className="p-1 text-gray-500 hover:bg-gray-50 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-gray-700 font-medium">
                    {format(selectedTrip.startDate, 'MMM dd')} - {format(selectedTrip.endDate, 'MMM dd, yyyy')}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({Math.ceil((selectedTrip.endDate.getTime() - selectedTrip.startDate.getTime()) / (1000 * 60 * 60 * 24))} {t('trip.days')})
                  </span>
                  <button
                    onClick={handleStartEditDates}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View mode toggle temporarily disabled */}
            {/* <div className="flex bg-gray-100 rounded-lg p-1">
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
            </div> */}
            
            <button
              onClick={() => onShowAddLocation(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>{t('planning.addLocation')}</span>
            </button>
            
            <button
              onClick={onSaveTrip}
              disabled={isSaving}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              <Save size={20} className={isSaving ? 'animate-spin' : ''} />
              <span>{isSaving ? t('auth.syncing') : t('planning.save')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
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
                          onDelete={onRemoveLocation}
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

        {/* Map view temporarily disabled */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6">
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
        </div> */}
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
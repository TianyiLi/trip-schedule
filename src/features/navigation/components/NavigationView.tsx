import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation as NavigationIcon, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import GoogleMapsComponent from '../../../shared/components/GoogleMapsComponent';
import { Location, Trip } from '../../../shared/types';

interface NavigationViewProps {
  currentTrip: Trip | null;
  currentLocation?: Location;
  nextLocation?: Location;
  currentLocationIndex: number;
  completedLocations: Set<string>;
  progress: number;
  onMarkComplete: (locationId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onOpenNavigation: (location: Location) => void;
  onOpenGoogleMaps: (location: Location) => void;
  onGoHome: () => void;
}

const NavigationView: React.FC<NavigationViewProps> = ({
  currentTrip,
  currentLocation,
  nextLocation,
  currentLocationIndex,
  completedLocations,
  progress,
  onMarkComplete,
  onNext,
  onPrevious,
  onOpenNavigation,
  onOpenGoogleMaps,
  onGoHome,
}) => {
  const { t } = useTranslation();
  if (!currentTrip) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <NavigationIcon size={64} className="mx-auto text-gray-400 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('navigation.noActiveTrip.title')}</h2>
        <p className="text-gray-600 mb-6">{t('navigation.noActiveTrip.message')}</p>
        <button
          onClick={onGoHome}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
        >
          {t('navigation.noActiveTrip.button')}
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('navigation.title')}</h1>
            <p className="text-gray-600">{currentTrip.title}</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">{t('navigation.progress')}</div>
            <div className="text-2xl font-bold text-blue-600">
              {currentLocationIndex + 1} / {currentTrip.locations.length}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{t('navigation.currentDestination')}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onPrevious}
                  disabled={currentLocationIndex === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('navigation.buttons.previous')}
                </button>
                <button
                  onClick={onNext}
                  disabled={currentLocationIndex === currentTrip.locations.length - 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('navigation.buttons.next')}
                </button>
              </div>
            </div>

            {currentLocation && (
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentLocation.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin size={16} className="mr-2" />
                      <span>{currentLocation.address}</span>
                    </div>
                    
                    {currentLocation.visitTime && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock size={16} className="mr-2" />
                        <span>{t('navigation.scheduled')}: {currentLocation.visitTime}</span>
                      </div>
                    )}
                    
                    {currentLocation.estimatedDuration && (
                      <div className="text-sm text-gray-500 mb-4">
                        {t('navigation.estimatedDuration')}: {currentLocation.estimatedDuration} {t('navigation.minutes')}
                      </div>
                    )}
                    
                    {currentLocation.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">{currentLocation.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {completedLocations.has(currentLocation.id) ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle size={24} className="mr-2" />
                        <span className="font-medium">{t('navigation.completed')}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onMarkComplete(currentLocation.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={16} />
                        <span>{t('navigation.buttons.markComplete')}</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => onOpenNavigation(currentLocation)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <NavigationIcon size={20} />
                    <span>{t('navigation.buttons.navigate')}</span>
                  </button>
                  
                  <button
                    onClick={() => onOpenGoogleMaps(currentLocation)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MapPin size={20} />
                    <span>{t('navigation.buttons.viewOnMap')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Next Location */}
          {nextLocation && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t('navigation.nextDestination')}</h2>
              <div className="border-l-4 border-gray-300 pl-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{nextLocation.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin size={14} className="mr-2" />
                      <span className="text-sm">{nextLocation.address}</span>
                    </div>
                    
                    {nextLocation.visitTime && (
                      <div className="flex items-center text-gray-600">
                        <Clock size={14} className="mr-2" />
                        <span className="text-sm">{t('navigation.scheduled')}: {nextLocation.visitTime}</span>
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight size={24} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{t('navigation.routeOverview')}</h2>
          <GoogleMapsComponent
            locations={currentTrip.locations}
            currentLocation={currentLocation}
            height="600px"
          />
        </div>
      </div>

      {/* Daily Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{t('navigation.todayItinerary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTrip.locations.map((location, index) => (
            <div
              key={location.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                index === currentLocationIndex
                  ? 'border-blue-500 bg-blue-50'
                  : completedLocations.has(location.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                      index === currentLocationIndex
                        ? 'bg-blue-500 text-white'
                        : completedLocations.has(location.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-800">{location.name}</h3>
                  </div>
                  
                  {location.visitTime && (
                    <div className="flex items-center text-gray-600 text-sm ml-9">
                      <Clock size={12} className="mr-1" />
                      <span>{location.visitTime}</span>
                    </div>
                  )}
                </div>
                
                {completedLocations.has(location.id) && (
                  <CheckCircle size={20} className="text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationView;
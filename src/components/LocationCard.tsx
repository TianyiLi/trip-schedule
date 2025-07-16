import React from 'react';
import { Location } from '../types';
import { MapPin, Clock, Navigation, GripVertical } from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';

interface LocationCardProps {
  location: Location;
  index: number;
  onEdit?: (location: Location) => void;
  onDelete?: (locationId: string) => void;
  onNavigate?: (location: Location) => void;
  isDragging?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  index,
  onEdit,
  onDelete,
  onNavigate,
}) => {
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location.address
    )}`;
    window.open(url, '_blank');
  };

  const openNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      location.address
    )}`;
    window.open(url, '_blank');
  };

  return (
    <Draggable draggableId={location.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500 ${
            snapshot.isDragging ? 'shadow-xl scale-105' : ''
          }`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div
                    {...provided.dragHandleProps}
                    className="mr-3 text-gray-400 hover:text-gray-600 cursor-grab"
                  >
                    <GripVertical size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{location.name}</h3>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{location.address}</span>
                </div>
                
                {location.visitTime && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">Scheduled: {location.visitTime}</span>
                  </div>
                )}
                
                {location.estimatedDuration && (
                  <div className="text-sm text-gray-500 mb-2">
                    Duration: {location.estimatedDuration} minutes
                  </div>
                )}
                
                {location.notes && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                    {location.notes}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={openGoogleMaps}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  title="Open in Google Maps"
                >
                  <MapPin size={16} />
                </button>
                
                <button
                  onClick={openNavigation}
                  className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                  title="Navigate"
                >
                  <Navigation size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default LocationCard;
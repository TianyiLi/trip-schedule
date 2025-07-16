import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trip } from '../types';
import { Calendar, MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onSelect?: (trip: Trip) => void;
  onEdit?: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
  onComplete?: (tripId: string) => void;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  onSelect,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.title}</h3>
            <p className="text-gray-600 mb-3">{trip.description}</p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => { onSelect?.(trip); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg"
                >
                  {t('trip.viewDetails')}
                </button>
                <button
                  onClick={() => { onEdit?.(trip); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100"
                >
                  {t('trip.editTrip')}
                </button>
                {!trip.isCompleted && (
                  <button
                    onClick={() => { onComplete?.(trip.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-green-600"
                  >
                    {t('trip.markComplete')}
                  </button>
                )}
                <button
                  onClick={() => { onDelete?.(trip.id); setShowMenu(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg text-red-600"
                >
                  {t('trip.deleteTrip')}
                </button>
              </div>
            )}
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
            <span className="text-sm">{trip.locations.length} {t('trip.locations')}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2" />
            <span className="text-sm">
              {Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24))} {t('trip.days')}
            </span>
          </div>
        </div>

        {trip.isCompleted && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
            {t('trip.completed')}
          </div>
        )}

        <button
          onClick={() => onSelect?.(trip)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
        >
          {trip.isCompleted ? t('trip.viewTrip') : t('trip.continuePlanning')}
        </button>
      </div>
    </div>
  );
};

export default TripCard;
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Clock, Navigation, Edit, Trash2, CheckCircle, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Trip } from '../../../shared/types';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface TripPreviewDrawerProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
  onDelete: (tripId: string) => void;
  onComplete: (tripId: string) => void;
  onUncomplete: (tripId: string) => void;
  onNavigate: (trip: Trip) => void;
  onOpenLocation: (locationId: string) => void;
  onUpdateTrip: (tripId: string, updates: { title?: string; description?: string }) => void;
}

const TripPreviewDrawer: React.FC<TripPreviewDrawerProps> = ({
  trip,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  onNavigate,
  onOpenLocation,
  onUpdateTrip,
}) => {
  const { t } = useTranslation();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  if (!trip) return null;

  const handleStartEditTitle = () => {
    setTempTitle(trip.title);
    setEditingTitle(true);
  };

  const handleStartEditDescription = () => {
    setTempDescription(trip.description);
    setEditingDescription(true);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim() && tempTitle !== trip.title) {
      onUpdateTrip(trip.id, { title: tempTitle.trim() });
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (tempDescription !== trip.description) {
      onUpdateTrip(trip.id, { description: tempDescription });
    }
    setEditingDescription(false);
  };

  const handleCancelTitle = () => {
    setTempTitle('');
    setEditingTitle(false);
  };

  const handleCancelDescription = () => {
    setTempDescription('');
    setEditingDescription(false);
  };

  const totalDays = Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="max-h-[96vh]">
        <DrawerHeader>
          <DrawerTitle>{t('trip.viewDetails')}</DrawerTitle>
          <DrawerDescription className="flex items-center gap-2">
            {editingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelTitle();
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  className="h-6 w-6 p-0"
                >
                  <Check size={12} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelTitle}
                  className="h-6 w-6 p-0"
                >
                  <X size={12} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <span className="flex-1">{trip.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleStartEditTitle}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                >
                  <Edit size={12} />
                </Button>
              </div>
            )}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          {/* Trip Info */}
          <div className="space-y-4">
            <div>
              {editingDescription ? (
                <div className="flex items-start gap-2 mb-4">
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) handleSaveDescription();
                      if (e.key === 'Escape') handleCancelDescription();
                    }}
                    autoFocus
                    placeholder={t('trip.description')}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSaveDescription}
                      className="h-6 w-6 p-0"
                    >
                      <Check size={12} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelDescription}
                      className="h-6 w-6 p-0"
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 mb-4">
                  <p className="text-muted-foreground flex-1">{trip.description || t('trip.noDescription')}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStartEditDescription}
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100 mt-0.5"
                  >
                    <Edit size={12} />
                  </Button>
                </div>
              )}

              {/* Status Badge */}
              {trip.isCompleted && (
                <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <CheckCircle size={16} className="mr-2" />
                  {t('trip.completed')}
                </div>
              )}
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar size={16} className="mr-3 text-blue-500" />
                <div>
                  <span className="font-medium">
                    {format(trip.startDate, 'MMM dd')} - {format(trip.endDate, 'MMM dd, yyyy')}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({totalDays} {t('trip.days')})
                  </span>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin size={16} className="mr-3 text-green-500" />
                <span>
                  {trip.locations.length} {t('trip.locations')}
                </span>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock size={16} className="mr-3 text-purple-500" />
                <span>
                  {t('trip.created')}: {format(trip.createdAt, 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Locations List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {t('trip.itinerary')}
            </h4>
            {trip.locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p>{t('trip.noLocations')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trip.locations.map((location, index) => (
                  <div
                    key={location.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onOpenLocation(location.id)}
                  >
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold mr-3 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800 mb-1">{location.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {location.visitTime && (
                            <div className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              <span>{location.visitTime}</span>
                            </div>
                          )}
                          {location.estimatedDuration && (
                            <div>
                              <span>{location.estimatedDuration} {t('location.minutes')}</span>
                            </div>
                          )}
                        </div>
                        
                        {location.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            {location.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DrawerFooter>
          {!trip.isCompleted && (
            <Button
              onClick={() => onNavigate(trip)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Navigation size={16} className="mr-2" />
              {t('trip.continuePlanning')}
            </Button>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(trip)}
              className="flex-1"
            >
              <Edit size={16} className="mr-2" />
              {t('trip.editTrip')}
            </Button>

            {trip.isCompleted ? (
              <Button
                variant="secondary"
                onClick={() => onUncomplete(trip.id)}
                className="flex-1"
              >
                <CheckCircle size={16} className="mr-2" />
                {t('trip.restore')}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => onComplete(trip.id)}
                className="flex-1"
              >
                <CheckCircle size={16} className="mr-2" />
                {t('trip.markComplete')}
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => onDelete(trip.id)}
              className="flex-1"
            >
              <Trash2 size={16} className="mr-2" />
              {t('trip.deleteTrip')}
            </Button>
          </div>

          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              {t('common.close')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TripPreviewDrawer;
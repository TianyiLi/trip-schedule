import React, { useState, useCallback, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Location } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';

interface AddLocationModalProps {
  onClose: () => void;
  onAdd: (location: Location) => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ onClose, onAdd }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    visitTime: '',
    estimatedDuration: '',
    notes: '',
    coordinates: null as { lat: number; lng: number } | null,
  });

  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    address: string;
    place_id: string;
    lat: number;
    lng: number;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      alert(t('addLocation.validation.requiredFields'));
      return;
    }

    const newLocation: Location = {
      id: uuidv4(),
      name: formData.name,
      address: formData.address,
      coordinates: formData.coordinates || {
        lat: 25.033 + Math.random() * 0.1, // Fallback coordinates (Taipei)
        lng: 121.5654 + Math.random() * 0.1,
      },
      visitTime: formData.visitTime || undefined,
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
      notes: formData.notes || undefined,
    };

    onAdd(newLocation);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      // Clear previous timeout
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Set new timeout
      debounceTimer.current = setTimeout(() => {
        handleSearchLocation(searchTerm);
      }, 300);
    },
    []
  );

  const handleSearchLocation = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TripSchedule/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      const results = data.map((place: Record<string, unknown>) => ({
        name: (place.display_name as string).split(',')[0],
        address: place.display_name as string,
        place_id: (place.place_id as number).toString(),
        lat: parseFloat(place.lat as string),
        lng: parseFloat(place.lon as string)
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: { name: string; address: string; place_id: string; lat: number; lng: number }) => {
    setFormData({
      ...formData,
      name: place.name,
      address: place.address,
      coordinates: { lat: place.lat, lng: place.lng },
    });
    setSearchResults([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{t('addLocation.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addLocation.form.searchLocation')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('addLocation.form.searchPlaceholder')}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="text-gray-400 animate-spin" size={20} />
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-800">{place.name}</div>
                    <div className="text-sm text-gray-600">{place.address}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addLocation.form.locationName')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('addLocation.form.locationNamePlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addLocation.form.address')}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('addLocation.form.addressPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addLocation.form.visitTime')}
              </label>
              <input
                type="time"
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('addLocation.form.duration')}
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                placeholder={t('addLocation.form.durationPlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addLocation.form.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('addLocation.form.notesPlaceholder')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('addLocation.buttons.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
            >
              {t('addLocation.buttons.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationModal;
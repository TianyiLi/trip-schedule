import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
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
  });

  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    address: string;
    place_id: string;
  }>>([]);

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
      coordinates: {
        lat: 25.033 + Math.random() * 0.1, // Mock coordinates
        lng: 121.5654 + Math.random() * 0.1,
      },
      visitTime: formData.visitTime || undefined,
      estimatedDuration: formData.estimatedDuration ? parseInt(formData.estimatedDuration) : undefined,
      notes: formData.notes || undefined,
    };

    onAdd(newLocation);
  };

  const handleSearchLocation = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // Mock search results - in real app, this would use Google Places API
    setTimeout(() => {
      const mockResults = [
        {
          name: `${searchTerm} Restaurant`,
          address: `123 Main St, ${searchTerm}`,
          place_id: '1',
        },
        {
          name: `${searchTerm} Museum`,
          address: `456 Cultural Ave, ${searchTerm}`,
          place_id: '2',
        },
        {
          name: `${searchTerm} Park`,
          address: `789 Nature Blvd, ${searchTerm}`,
          place_id: '3',
        },
      ];
      
      setSearchResults(mockResults);
    }, 500);
  };

  const handleSelectPlace = (place: { name: string; address: string; place_id: string }) => {
    setFormData({
      ...formData,
      name: place.name,
      address: place.address,
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
                onChange={(e) => handleSearchLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
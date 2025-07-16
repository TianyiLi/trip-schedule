import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, User, Shield, Download, Upload, Trash2 } from 'lucide-react';
import { useTrip } from '../contexts/TripContext';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useTrip();
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const handleExportData = () => {
    const data = {
      trips: state.trips,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      // CSV export for all trips
      const csvContent = [
        ['Trip ID', 'Title', 'Description', 'Start Date', 'End Date', 'Status', 'Locations Count'],
        ...state.trips.map(trip => [
          trip.id,
          trip.title,
          trip.description,
          trip.startDate.toISOString().split('T')[0],
          trip.endDate.toISOString().split('T')[0],
          trip.isCompleted ? 'Completed' : 'Active',
          trip.locations.length.toString()
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travel-planner-trips-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.trips && Array.isArray(data.trips)) {
          // Here you would typically dispatch an action to import the data
          console.log('Data imported successfully:', data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('travelPlannerTrips');
      window.location.reload();
    }
  };

  const handleConnectGoogle = () => {
    // This would integrate with Google OAuth
    alert('Google OAuth integration would be implemented here. Please check the configuration guide.');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User className="text-blue-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">{t('settings.account.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.account.displayName')}
                </label>
                <input
                  type="text"
                  placeholder={t('settings.account.displayNamePlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.account.email')}
                </label>
                <input
                  type="email"
                  placeholder={t('settings.account.emailPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">{t('settings.account.googleAccount')}</h3>
                  <p className="text-sm text-gray-600">
                    {isGoogleConnected ? t('settings.account.connected') : t('settings.account.notConnected')}
                  </p>
                </div>
                <button
                  onClick={handleConnectGoogle}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isGoogleConnected
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                >
                  {isGoogleConnected ? t('settings.account.disconnect') : t('settings.account.connect')}
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Shield className="text-green-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">{t('settings.data.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">{t('settings.data.exportFormat')}</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('settings.data.jsonFormat')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('settings.data.csvFormat')}</span>
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleExportData}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>{t('settings.data.exportData')}</span>
                </button>
                
                <label className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 cursor-pointer">
                  <Upload size={16} />
                  <span>{t('settings.data.importData')}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleClearAllData}
                  className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>{t('settings.data.clearAllData')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* App Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <SettingsIcon className="text-purple-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">{t('settings.app.title')}</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.app.version')}</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.app.totalTrips')}</span>
                <span className="font-medium">{state.trips.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.app.activeTrips')}</span>
                <span className="font-medium">{state.trips.filter(t => !t.isCompleted).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.app.completedTrips')}</span>
                <span className="font-medium">{state.trips.filter(t => t.isCompleted).length}</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('settings.help.title')}</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">{t('settings.help.userGuide')}</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">{t('settings.help.faq')}</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">{t('settings.help.contactSupport')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
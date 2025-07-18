import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, User, Shield, Download, Upload, Trash2 } from 'lucide-react';
import LanguageSelector from '../../../shared/components/LanguageSelector';

interface SettingsViewProps {
  isGoogleConnected: boolean;
  exportFormat: 'json' | 'csv';
  appStats: {
    totalTrips: number;
    activeTrips: number;
    completedTrips: number;
  };
  onExportFormatChange: (format: 'json' | 'csv') => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
  onConnectGoogle: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  isGoogleConnected,
  exportFormat,
  appStats,
  onExportFormatChange,
  onExportData,
  onImportData,
  onClearAllData,
  onConnectGoogle,
}) => {
  const { t } = useTranslation();

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
                  onClick={onConnectGoogle}
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

          {/* Language Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <SettingsIcon className="text-blue-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Language Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Language
                </label>
                <LanguageSelector />
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
                      onChange={(e) => onExportFormatChange(e.target.value as 'json' | 'csv')}
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
                      onChange={(e) => onExportFormatChange(e.target.value as 'json' | 'csv')}
                      className="mr-2"
                    />
                    <span className="text-sm">{t('settings.data.csvFormat')}</span>
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={onExportData}
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
                    onChange={onImportData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={onClearAllData}
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
                <span className="font-medium">{appStats.totalTrips}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.app.activeTrips')}</span>
                <span className="font-medium">{appStats.activeTrips}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('settings.app.completedTrips')}</span>
                <span className="font-medium">{appStats.completedTrips}</span>
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

export default SettingsView;
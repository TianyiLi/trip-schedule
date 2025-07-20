import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, User, Shield, Download, Upload, Trash2, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import LanguageSelector from '../../../shared/components/LanguageSelector';
import { GoogleUser } from '../../../shared/contexts/GoogleAuthContext';
import { SyncStatus } from '../../../shared/services/GoogleDriveService';

interface SettingsViewProps {
  isGoogleConnected: boolean;
  googleUser: GoogleUser | null;
  exportFormat: 'json' | 'csv';
  appStats: {
    totalTrips: number;
    activeTrips: number;
    completedTrips: number;
  };
  syncStatus: SyncStatus;
  onExportFormatChange: (format: 'json' | 'csv') => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAllData: () => void;
  onConnectGoogle: () => void;
  onSyncWithCloud: () => void;
  onBackupToCloud: () => void;
  onRestoreFromCloud: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  isGoogleConnected,
  googleUser,
  exportFormat,
  appStats,
  syncStatus,
  onExportFormatChange,
  onExportData,
  onImportData,
  onClearAllData,
  onConnectGoogle,
  onSyncWithCloud,
  onBackupToCloud,
  onRestoreFromCloud,
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
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

                {isGoogleConnected && googleUser && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                      <img
                        src={googleUser.picture}
                        alt={googleUser.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-800">{googleUser.name}</p>
                        <p className="text-sm text-gray-600">{googleUser.email}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-800 mb-3">{t('settings.sync.title')}</h4>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {syncStatus.syncing ? (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                            <span className="text-sm">{t('auth.syncing')}</span>
                          </div>
                        ) : syncStatus.error ? (
                          <div className="flex items-center space-x-2 text-red-600">
                            <CloudOff size={16} />
                            <span className="text-sm">{t('auth.syncError')}: {syncStatus.error}</span>
                          </div>
                        ) : syncStatus.lastSyncTime ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Cloud size={16} />
                            <span className="text-sm">
                              {t('auth.synced')} - {syncStatus.lastSyncTime.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">{t('settings.sync.neverSynced')}</div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={onSyncWithCloud}
                          disabled={syncStatus.syncing}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <RefreshCw size={14} />
                          <span>{t('auth.sync')}</span>
                        </button>
                        <button
                          onClick={onBackupToCloud}
                          disabled={syncStatus.syncing}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Upload size={14} />
                          <span>{t('settings.sync.backup')}</span>
                        </button>
                        <button
                          onClick={onRestoreFromCloud}
                          disabled={syncStatus.syncing}
                          className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download size={14} />
                          <span>{t('settings.sync.restore')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <SettingsIcon className="text-blue-600 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">{t('settings.language.title')}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.language.select')}
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
              <a 
                href="https://github.com/tianyili/trip-schedule/issues" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-decoration-none"
              >
                <span className="font-medium">{t('settings.help.contactSupport')}</span>
              </a>
              <a 
                href="/trip-schedule/privacy.html" 
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-decoration-none"
              >
                <span className="font-medium">{t('settings.help.privacyPolicy')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
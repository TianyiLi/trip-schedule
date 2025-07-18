import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useTrip } from '../../../shared/contexts/TripContext';
import { useGoogleAuth } from '../../../shared/contexts/GoogleAuthContext';
import { GoogleDriveService } from '../../../shared/services/GoogleDriveService';
import SettingsView from '../components/SettingsView';
import FileSelectionDialog from '../../../shared/components/FileSelectionDialog';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';

const SettingsContainer: React.FC = () => {
  const { t } = useTranslation();
  const { state, syncWithCloud, dispatch } = useTrip();
  const { isAuthenticated, user, login, logout } = useGoogleAuth();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDialogMode, setFileDialogMode] = useState<'backup' | 'restore'>('backup');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingRestoreFile, setPendingRestoreFile] = useState<string | null>(null);
  const [clearDataConfirmOpen, setClearDataConfirmOpen] = useState(false);

  const appStats = useMemo(() => {
    const totalTrips = state.trips.length;
    const activeTrips = state.trips.filter(t => !t.isCompleted).length;
    const completedTrips = state.trips.filter(t => t.isCompleted).length;
    
    return {
      totalTrips,
      activeTrips,
      completedTrips
    };
  }, [state.trips]);

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
          toast.success(t('settings.data.importSuccess'));
        } else {
          toast.error(t('settings.data.invalidFormat'));
        }
      } catch {
        toast.error(t('settings.data.importError'));
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    setClearDataConfirmOpen(true);
  };

  const handleConfirmClearData = () => {
    localStorage.removeItem('travelPlannerTrips');
    toast.success(t('settings.data.clearSuccess'));
    window.location.reload();
  };

  const handleConnectGoogle = async () => {
    if (isAuthenticated) {
      logout();
    } else {
      try {
        await login();
      } catch (error) {
        console.error('Google login failed:', error);
        toast.error(t('settings.messages.loginFailed'));
      }
    }
  };

  const handleSyncWithCloud = async () => {
    try {
      await syncWithCloud();
      toast.success(t('settings.messages.syncSuccess'));
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(`${t('settings.messages.syncFailed')}. ${t('settings.messages.checkConnection')}`);
    }
  };

  const handleBackupToCloud = () => {
    setFileDialogMode('backup');
    setFileDialogOpen(true);
  };

  const handleRestoreFromCloud = () => {
    setFileDialogMode('restore');
    setFileDialogOpen(true);
  };

  const handleFileSelected = async (fileName: string) => {
    const accessToken = user?.accessToken;
    
    if (!accessToken) {
      toast.error(t('settings.messages.loginRequired'));
      return;
    }

    try {
      if (fileDialogMode === 'backup') {
        await GoogleDriveService.uploadTripsDataWithFileName(state.trips, accessToken, fileName);
        toast.success(`${t('settings.messages.backupSuccess')}: "${fileName}"`);
      } else if (fileDialogMode === 'restore') {
        // 設定待還原的檔案名稱並開啟確認對話框
        setPendingRestoreFile(fileName);
        setConfirmDialogOpen(true);
      }
    } catch (error) {
      console.error(`${fileDialogMode} failed:`, error);
      const messageKey = fileDialogMode === 'backup' ? 'backupFailed' : 'restoreFailed';
      toast.error(`${t(`settings.messages.${messageKey}`)}. ${error instanceof Error ? error.message : t('settings.messages.checkConnection')}`);
    }
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreFile) return;
    
    const accessToken = user?.accessToken;
    if (!accessToken) {
      toast.error(t('settings.messages.loginRequired'));
      return;
    }

    try {
      const downloadedTrips = await GoogleDriveService.downloadTripsDataFromFile(accessToken, pendingRestoreFile);
      
      // 將下載的資料轉換為正確的 Date 物件
      const processedTrips = downloadedTrips.map(trip => ({
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      }));
      
      // 驗證處理後的資料
      const validTrips = processedTrips.filter(trip => 
        trip.id && trip.title && 
        !isNaN(trip.startDate.getTime()) && 
        !isNaN(trip.endDate.getTime())
      );
      
      // 更新 TripContext 中的資料
      dispatch({ type: 'SET_TRIPS', payload: validTrips });
      
      // 更新 localStorage
      localStorage.setItem('travelPlannerTrips', JSON.stringify(validTrips));
      
      const skippedCount = processedTrips.length - validTrips.length;
      
      // 顯示成功訊息
      toast.success(t('settings.messages.restoreSuccessCount', { count: validTrips.length }));
      
      if (skippedCount > 0) {
        toast.warning(t('settings.messages.restoreSkipped', { count: skippedCount }));
      }
      
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error(`${t('settings.messages.restoreFailed')}. ${error instanceof Error ? error.message : t('settings.messages.checkConnection')}`);
    } finally {
      setPendingRestoreFile(null);
    }
  };

  return (
    <>
      <SettingsView
        isGoogleConnected={isAuthenticated}
        googleUser={user}
        exportFormat={exportFormat}
        appStats={appStats}
        syncStatus={state.syncStatus}
        onExportFormatChange={setExportFormat}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
        onConnectGoogle={handleConnectGoogle}
        onSyncWithCloud={handleSyncWithCloud}
        onBackupToCloud={handleBackupToCloud}
        onRestoreFromCloud={handleRestoreFromCloud}
      />
      <FileSelectionDialog
        isOpen={fileDialogOpen}
        onClose={() => setFileDialogOpen(false)}
        mode={fileDialogMode}
        onFileSelected={handleFileSelected}
      />
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmRestore}
        title={t('settings.messages.restoreConfirmTitle')}
        message={t('settings.messages.restoreConfirmMessage', { fileName: pendingRestoreFile })}
        warning={t('settings.messages.restoreConfirmWarning')}
        variant="destructive"
      />
      <ConfirmDialog
        isOpen={clearDataConfirmOpen}
        onClose={() => setClearDataConfirmOpen(false)}
        onConfirm={handleConfirmClearData}
        title={t('settings.data.clearAllData')}
        message={t('settings.data.clearConfirm')}
        variant="destructive"
      />
    </>
  );
};

export default SettingsContainer;
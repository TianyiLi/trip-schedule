import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { GoogleDriveService } from '../services/GoogleDriveService';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { tripsAtom, syncStatusAtom } from '../atoms/tripAtoms';
import { Trip } from '../types';

export const useCloudSync = () => {
  const { t } = useTranslation();
  const { isAuthenticated, getAccessToken } = useGoogleAuth();
  const [trips, setTrips] = useAtom(tripsAtom);
  const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);

  // Query to download trips from cloud
  const downloadQuery = useQuery({
    queryKey: ['trips', 'cloud'],
    queryFn: async () => {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');
      
      return GoogleDriveService.downloadTripsData(accessToken);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to upload trips to cloud
  const uploadMutation = useMutation({
    mutationFn: async (tripsToUpload: Trip[]) => {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');
      
      await GoogleDriveService.uploadTripsData(tripsToUpload, accessToken);
    },
    onMutate: () => {
      setSyncStatus({ syncing: true, lastSyncTime: null, error: null });
    },
    onSuccess: () => {
      setSyncStatus({ syncing: false, lastSyncTime: new Date(), error: null });
      toast.success(t('settings.messages.syncSuccess'));
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncStatus({ syncing: false, lastSyncTime: null, error: errorMessage });
      toast.error(`${t('settings.messages.syncFailed')}. ${t('settings.messages.checkConnection')}`);
    },
  });

  // Mutation to backup to a specific file
  const backupMutation = useMutation({
    mutationFn: async ({ fileName }: { fileName: string }) => {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');
      
      await GoogleDriveService.uploadTripsDataWithFileName(trips, accessToken, fileName);
    },
    onSuccess: (_, { fileName }) => {
      toast.success(`${t('settings.messages.backupSuccess')}: "${fileName}"`);
    },
    onError: (error) => {
      const messageKey = 'backupFailed';
      toast.error(`${t(`settings.messages.${messageKey}`)}. ${error instanceof Error ? error.message : t('settings.messages.checkConnection')}`);
    },
  });

  // Mutation to restore from a specific file
  const restoreMutation = useMutation({
    mutationFn: async ({ fileName }: { fileName: string }) => {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('Not authenticated');
      
      return GoogleDriveService.downloadTripsDataFromFile(accessToken, fileName);
    },
    onSuccess: (downloadedTrips) => {
      // Convert date strings to Date objects
      const processedTrips = downloadedTrips.map(trip => ({
        ...trip,
        startDate: new Date(trip.startDate),
        endDate: new Date(trip.endDate),
        createdAt: new Date(trip.createdAt),
        updatedAt: new Date(trip.updatedAt)
      }));
      
      // Validate and filter trips
      const validTrips = processedTrips.filter(trip => 
        trip.id && trip.title && 
        !isNaN(trip.startDate.getTime()) && 
        !isNaN(trip.endDate.getTime())
      );
      
      // Update trips
      setTrips(validTrips);
      
      const skippedCount = processedTrips.length - validTrips.length;
      toast.success(t('settings.messages.restoreSuccessCount', { count: validTrips.length }));
      
      if (skippedCount > 0) {
        toast.warning(t('settings.messages.restoreSkipped', { count: skippedCount }));
      }
    },
    onError: (error) => {
      toast.error(`${t('settings.messages.restoreFailed')}. ${error instanceof Error ? error.message : t('settings.messages.checkConnection')}`);
    },
  });

  // Sync function that downloads and then uploads
  const syncWithCloud = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      // First download and merge
      const cloudTrips = await downloadQuery.refetch();
      if (cloudTrips.data) {
        // Merge logic here if needed
        // For now, we'll just upload current state
      }
      
      // Then upload current state
      await uploadMutation.mutateAsync(trips);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, [isAuthenticated, downloadQuery, uploadMutation, trips]);

  return {
    // State
    syncStatus,
    isLoading: uploadMutation.isPending || downloadQuery.isLoading,
    
    // Actions
    syncWithCloud,
    uploadToCloud: () => uploadMutation.mutate(trips),
    downloadFromCloud: downloadQuery.refetch,
    backupToFile: backupMutation.mutate,
    restoreFromFile: restoreMutation.mutate,
    
    // Mutation states
    isUploading: uploadMutation.isPending,
    isDownloading: downloadQuery.isLoading,
    isBackingUp: backupMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
};
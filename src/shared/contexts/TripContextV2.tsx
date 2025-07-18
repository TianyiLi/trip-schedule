import React, { createContext, useContext } from 'react';
import { useTrips } from '../hooks/useTrips';
import { useCloudSync } from '../hooks/useCloudSync';

// Create a context that combines both hooks
const TripContextV2 = createContext<ReturnType<typeof useTrips> & ReturnType<typeof useCloudSync> | null>(null);

export const TripProviderV2: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tripsData = useTrips();
  const cloudSyncData = useCloudSync();

  const value = {
    ...tripsData,
    ...cloudSyncData,
  };

  return <TripContextV2.Provider value={value}>{children}</TripContextV2.Provider>;
};

export const useTripV2 = () => {
  const context = useContext(TripContextV2);
  if (!context) {
    throw new Error('useTripV2 must be used within TripProviderV2');
  }
  return context;
};
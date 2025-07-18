import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Trip, Location } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { GoogleDriveService, SyncStatus } from '../services/GoogleDriveService';
import { useGoogleAuth } from './GoogleAuthContext';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  syncStatus: SyncStatus;
}

type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip | null }
  | { type: 'COMPLETE_TRIP'; payload: string }
  | { type: 'UNCOMPLETE_TRIP'; payload: string }
  | { type: 'REORDER_LOCATIONS'; payload: { tripId: string; locations: Location[] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: SyncStatus }
  | { type: 'MERGE_TRIPS'; payload: Trip[] };

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  isLoading: false,
  syncStatus: {
    syncing: false,
    lastSyncTime: null,
    error: null,
  },
};

const tripReducer = (state: TripState, action: TripAction): TripState => {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.payload };
    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };
    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.id ? action.payload : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.id ? action.payload : state.currentTrip,
      };
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(trip => trip.id !== action.payload),
        currentTrip: state.currentTrip?.id === action.payload ? null : state.currentTrip,
      };
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload };
    case 'COMPLETE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload
            ? { ...trip, isCompleted: true, updatedAt: new Date() }
            : trip
        ),
      };
    case 'UNCOMPLETE_TRIP':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload
            ? { ...trip, isCompleted: false, updatedAt: new Date() }
            : trip
        ),
      };
    case 'REORDER_LOCATIONS':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.tripId
            ? { ...trip, locations: action.payload.locations, updatedAt: new Date() }
            : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.tripId
          ? { ...state.currentTrip, locations: action.payload.locations, updatedAt: new Date() }
          : state.currentTrip,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'MERGE_TRIPS': {
      // Merge trips from cloud with local trips, preferring the most recent
      const mergedTrips = [...state.trips];
      action.payload.forEach(cloudTrip => {
        const existingIndex = mergedTrips.findIndex(t => t.id === cloudTrip.id);
        if (existingIndex >= 0) {
          // Compare updatedAt timestamps to determine which is more recent
          const existing = mergedTrips[existingIndex];
          const existingTime = new Date(existing.updatedAt).getTime();
          const cloudTime = new Date(cloudTrip.updatedAt).getTime();
          
          if (cloudTime > existingTime) {
            mergedTrips[existingIndex] = cloudTrip;
          }
        } else {
          mergedTrips.push(cloudTrip);
        }
      });
      return { ...state, trips: mergedTrips };
    }
    default:
      return state;
  }
};

const TripContext = createContext<{
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  createTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  completeTrip: (id: string) => void;
  uncompleteTrip: (id: string) => void;
  reorderLocations: (tripId: string, locations: Location[]) => void;
  syncWithCloud: () => Promise<void>;
  uploadToCloud: () => Promise<void>;
  downloadFromCloud: () => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  createTrip: () => null,
  updateTrip: () => null,
  deleteTrip: () => null,
  completeTrip: () => null,
  uncompleteTrip: () => null,
  reorderLocations: () => null,
  syncWithCloud: async () => {},
  uploadToCloud: async () => {},
  downloadFromCloud: async () => {},
});

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const { isAuthenticated, getAccessToken } = useGoogleAuth();
  const hasSyncedRef = useRef(false);

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('travelPlannerTrips');
    if (savedTrips) {
      try {
        const trips = JSON.parse(savedTrips).map((trip: Trip) => ({
          ...trip,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          createdAt: new Date(trip.createdAt),
          updatedAt: new Date(trip.updatedAt),
        }));
        dispatch({ type: 'SET_TRIPS', payload: trips });
      } catch (error) {
        console.error('Failed to load trips from localStorage:', error);
      }
    }
  }, []);

  // Save trips to localStorage whenever trips change
  useEffect(() => {
    localStorage.setItem('travelPlannerTrips', JSON.stringify(state.trips));
  }, [state.trips]);

  const createTrip = useCallback((tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_TRIP', payload: newTrip });
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    const updatedTrip = { ...trip, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: id });
    // If the deleted trip was the last selected one, clear it from localStorage
    const lastSelectedTripId = localStorage.getItem('lastSelectedTripId');
    if (lastSelectedTripId === id) {
      localStorage.removeItem('lastSelectedTripId');
    }
  }, []);

  const completeTrip = useCallback((id: string) => {
    dispatch({ type: 'COMPLETE_TRIP', payload: id });
    // If the completed trip was the last selected one, clear it from localStorage
    const lastSelectedTripId = localStorage.getItem('lastSelectedTripId');
    if (lastSelectedTripId === id) {
      localStorage.removeItem('lastSelectedTripId');
    }
  }, []);

  const uncompleteTrip = useCallback((id: string) => {
    dispatch({ type: 'UNCOMPLETE_TRIP', payload: id });
  }, []);

  const reorderLocations = useCallback((tripId: string, locations: Location[]) => {
    dispatch({ type: 'REORDER_LOCATIONS', payload: { tripId, locations } });
  }, []);

  const uploadToCloud = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token');
    }

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: true, lastSyncTime: null, error: null } });
      // Get the current state at the time of upload
      const currentTrips = JSON.parse(localStorage.getItem('travelPlannerTrips') || '[]');
      await GoogleDriveService.uploadTripsData(currentTrips, accessToken);
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSyncTime: new Date(), error: null } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSyncTime: null, error: errorMessage } });
      throw error;
    }
  }, [isAuthenticated, getAccessToken]);

  const downloadFromCloud = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('No access token');
    }

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: true, lastSyncTime: null, error: null } });
      const cloudTrips = await GoogleDriveService.downloadTripsData(accessToken);
      dispatch({ type: 'MERGE_TRIPS', payload: cloudTrips });
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSyncTime: new Date(), error: null } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SET_SYNC_STATUS', payload: { syncing: false, lastSyncTime: null, error: errorMessage } });
      throw error;
    }
  }, [isAuthenticated, getAccessToken]);

  const syncWithCloud = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      // First download and merge any changes from cloud
      await downloadFromCloud();
      // Then upload the merged data back to cloud
      await uploadToCloud();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, [isAuthenticated, downloadFromCloud, uploadToCloud]);

  // Auto-sync when user logs in (only once per session)
  useEffect(() => {
    if (isAuthenticated && state.trips.length > 0 && !hasSyncedRef.current && !state.syncStatus.syncing) {
      hasSyncedRef.current = true;
      syncWithCloud().catch(console.error);
    }
    
    // Reset sync flag when user logs out
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, state.trips.length, syncWithCloud, state.syncStatus.syncing]);

  return (
    <TripContext.Provider
      value={{
        state,
        dispatch,
        createTrip,
        updateTrip,
        deleteTrip,
        completeTrip,
        uncompleteTrip,
        reorderLocations,
        syncWithCloud,
        uploadToCloud,
        downloadFromCloud,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
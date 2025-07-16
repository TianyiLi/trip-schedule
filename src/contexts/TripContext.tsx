import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Trip, Location } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
}

type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip | null }
  | { type: 'COMPLETE_TRIP'; payload: string }
  | { type: 'REORDER_LOCATIONS'; payload: { tripId: string; locations: Location[] } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  isLoading: false,
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
    case 'REORDER_LOCATIONS':
      return {
        ...state,
        trips: state.trips.map(trip =>
          trip.id === action.payload.tripId
            ? { ...trip, locations: action.payload.locations, updatedAt: new Date() }
            : trip
        ),
        currentTrip: state.currentTrip?.id === action.payload.tripId
          ? { ...state.currentTrip, locations: action.payload.locations }
          : state.currentTrip,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
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
  reorderLocations: (tripId: string, locations: Location[]) => void;
}>({
  state: initialState,
  dispatch: () => null,
  createTrip: () => null,
  updateTrip: () => null,
  deleteTrip: () => null,
  completeTrip: () => null,
  reorderLocations: () => null,
});

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem('travelPlannerTrips');
    if (savedTrips) {
      try {
        const trips = JSON.parse(savedTrips).map((trip: any) => ({
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

  const createTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_TRIP', payload: newTrip });
  };

  const updateTrip = (trip: Trip) => {
    const updatedTrip = { ...trip, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_TRIP', payload: updatedTrip });
  };

  const deleteTrip = (id: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: id });
  };

  const completeTrip = (id: string) => {
    dispatch({ type: 'COMPLETE_TRIP', payload: id });
  };

  const reorderLocations = (tripId: string, locations: Location[]) => {
    dispatch({ type: 'REORDER_LOCATIONS', payload: { tripId, locations } });
  };

  return (
    <TripContext.Provider
      value={{
        state,
        dispatch,
        createTrip,
        updateTrip,
        deleteTrip,
        completeTrip,
        reorderLocations,
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
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trip, Location } from '../types';
import { 
  tripsAtom, 
  currentTripAtom, 
  lastSelectedTripIdAtom,
  activeTripsAtom,
  completedTripsAtom
} from '../atoms/tripAtoms';

export const useTrips = () => {
  const [trips, setTrips] = useAtom(tripsAtom);
  const [currentTrip, setCurrentTrip] = useAtom(currentTripAtom);
  const [lastSelectedTripId, setLastSelectedTripId] = useAtom(lastSelectedTripIdAtom);
  const [activeTrips] = useAtom(activeTripsAtom);
  const [completedTrips] = useAtom(completedTripsAtom);

  const createTrip = useCallback((tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrip: Trip = {
      ...tripData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTrips(prev => [...prev, newTrip]);
    return newTrip;
  }, [setTrips]);

  const updateTrip = useCallback((trip: Trip) => {
    const updatedTrip = { ...trip, updatedAt: new Date() };
    setTrips(prev => prev.map(t => t.id === trip.id ? updatedTrip : t));
    return updatedTrip;
  }, [setTrips]);

  const deleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    // Clear last selected trip if it's the deleted one
    if (lastSelectedTripId === id) {
      setLastSelectedTripId(null);
    }
    // Clear current trip if it's the deleted one
    if (currentTrip?.id === id) {
      setCurrentTrip(null);
    }
  }, [setTrips, lastSelectedTripId, setLastSelectedTripId, currentTrip, setCurrentTrip]);

  const completeTrip = useCallback((id: string) => {
    setTrips(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: true, updatedAt: new Date() } : t
    ));
    // Clear last selected trip if it's the completed one
    if (lastSelectedTripId === id) {
      setLastSelectedTripId(null);
    }
  }, [setTrips, lastSelectedTripId, setLastSelectedTripId]);

  const uncompleteTrip = useCallback((id: string) => {
    setTrips(prev => prev.map(t => 
      t.id === id ? { ...t, isCompleted: false, updatedAt: new Date() } : t
    ));
  }, [setTrips]);

  const reorderLocations = useCallback((tripId: string, locations: Location[]) => {
    setTrips(prev => prev.map(t => 
      t.id === tripId 
        ? { ...t, locations, updatedAt: new Date() } 
        : t
    ));
  }, [setTrips]);

  const getTripById = useCallback((id: string) => {
    return trips.find(t => t.id === id);
  }, [trips]);

  return {
    // State
    trips,
    activeTrips,
    completedTrips,
    currentTrip,
    lastSelectedTripId,
    
    // Actions
    createTrip,
    updateTrip,
    deleteTrip,
    completeTrip,
    uncompleteTrip,
    reorderLocations,
    getTripById,
    setCurrentTrip,
    setLastSelectedTripId,
  };
};
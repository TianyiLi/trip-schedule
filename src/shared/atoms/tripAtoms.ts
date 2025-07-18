import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Trip } from '../types';

// Atom for trips stored in localStorage
export const tripsAtom = atomWithStorage<Trip[]>('travelPlannerTrips', [], {
  getItem: (key, initialValue) => {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return initialValue;
    
    try {
      const trips = JSON.parse(storedValue);
      // Convert date strings back to Date objects
      return trips.map((trip: Record<string, unknown>) => ({
        ...trip,
        startDate: new Date(trip.startDate as string),
        endDate: new Date(trip.endDate as string),
        createdAt: new Date(trip.createdAt as string),
        updatedAt: new Date(trip.updatedAt as string),
      }));
    } catch {
      return initialValue;
    }
  },
  setItem: (key, value) => {
    // Convert Date objects to strings for storage
    const serializedTrips = value.map(trip => ({
      ...trip,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
    }));
    localStorage.setItem(key, JSON.stringify(serializedTrips));
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  },
});

// Derived atom for active trips
export const activeTripsAtom = atom<Trip[]>((get) => {
  const trips = get(tripsAtom);
  return trips.filter(trip => !trip.isCompleted);
});

// Derived atom for completed trips
export const completedTripsAtom = atom<Trip[]>((get) => {
  const trips = get(tripsAtom);
  return trips.filter(trip => trip.isCompleted);
});

// Atom for current trip being edited/viewed
export const currentTripAtom = atom<Trip | null>(null);

// Atom for sync status
export const syncStatusAtom = atom({
  syncing: false,
  lastSyncTime: null as Date | null,
  error: null as string | null,
});

// Atom for last selected trip ID
export const lastSelectedTripIdAtom = atomWithStorage<string | null>(
  'lastSelectedTripId',
  null
);
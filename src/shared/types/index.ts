export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  businessHours?: {
    [key: string]: string;
  };
  notes?: string;
  estimatedDuration?: number; // in minutes
  visitTime?: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  locations: Location[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DayItinerary {
  date: string;
  locations: Location[];
}

export interface GoogleAuthConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}
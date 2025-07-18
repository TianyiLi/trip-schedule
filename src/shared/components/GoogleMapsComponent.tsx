import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Location } from '../types';

interface GoogleMapsComponentProps {
  locations: Location[];
  currentLocation?: Location;
  onLocationSelect?: (location: Location) => void;
  height?: string;
}

const GoogleMapsComponent: React.FC<GoogleMapsComponentProps> = ({
  locations,
  currentLocation,
  onLocationSelect,
  height = '400px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (typeof google !== 'undefined' && google.maps) {
          setIsGoogleMapsLoaded(true);
          return;
        }

        // Load Google Maps script
        const script = document.createElement('script');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsGoogleMapsLoaded(true);
        };
        
        script.onerror = () => {
          setLoadError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
      } catch (error) {
        setLoadError('Error loading Google Maps API');
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded || typeof google === 'undefined') return;

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      zoom: 13,
      center: locations.length > 0 ? locations[0].coordinates : { lat: 25.033, lng: 121.5654 },
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    mapInstanceRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each location
    locations.forEach((location, index) => {
      const marker = new google.maps.Marker({
        position: location.coordinates,
        map: map,
        title: location.name,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
        },
        icon: {
          url: currentLocation?.id === location.id 
            ? 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EF4444"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E'
            : 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/%3E%3C/svg%3E',
          scaledSize: new google.maps.Size(30, 30),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${location.name}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.address}</p>
            ${location.visitTime ? `<p style="margin: 0; color: #666; font-size: 12px;">Scheduled: ${location.visitTime}</p>` : ''}
            ${location.notes ? `<p style="margin: 8px 0 0 0; color: #333; font-size: 12px;">${location.notes}</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onLocationSelect?.(location);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (locations.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(location => bounds.extend(location.coordinates));
      map.fitBounds(bounds);
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [locations, currentLocation, onLocationSelect, isGoogleMapsLoaded]);

  if (loadError) {
    return (
      <div 
        style={{ height, width: '100%' }} 
        className="rounded-lg bg-gray-100 flex items-center justify-center"
      >
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">{t('common.error')}: Google Maps</p>
          <p className="text-sm text-gray-600">{loadError}</p>
          <p className="text-xs text-gray-500 mt-2">請檢查網路連線或 API 金鑰設定</p>
        </div>
      </div>
    );
  }

  if (!isGoogleMapsLoaded) {
    return (
      <div 
        style={{ height, width: '100%' }} 
        className="rounded-lg bg-gray-100 flex items-center justify-center"
      >
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />;
};

export default GoogleMapsComponent;
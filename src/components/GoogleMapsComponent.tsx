import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!mapRef.current) return;

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
  }, [locations, currentLocation, onLocationSelect]);

  return <div ref={mapRef} style={{ height, width: '100%' }} className="rounded-lg" />;
};

export default GoogleMapsComponent;
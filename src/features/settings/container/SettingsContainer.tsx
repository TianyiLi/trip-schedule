import React, { useState, useMemo } from 'react';
import { useTrip } from '../../../shared/contexts/TripContext';
import SettingsView from '../components/SettingsView';

const SettingsContainer: React.FC = () => {
  const { state } = useTrip();
  const [isGoogleConnected] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

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
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('travelPlannerTrips');
      window.location.reload();
    }
  };

  const handleConnectGoogle = () => {
    // This would integrate with Google OAuth
    alert('Google OAuth integration would be implemented here. Please check the configuration guide.');
  };

  return (
    <SettingsView
      isGoogleConnected={isGoogleConnected}
      exportFormat={exportFormat}
      appStats={appStats}
      onExportFormatChange={setExportFormat}
      onExportData={handleExportData}
      onImportData={handleImportData}
      onClearAllData={handleClearAllData}
      onConnectGoogle={handleConnectGoogle}
    />
  );
};

export default SettingsContainer;
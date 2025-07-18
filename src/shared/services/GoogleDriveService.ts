import { Trip } from '../types';
import { tripDataValidator } from '../schemas/tripDataSchema';

export interface SyncStatus {
  syncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size: number;
}

export class GoogleDriveService {
  private static readonly FOLDER_NAME = 'TripSchedule';
  private static readonly DEFAULT_FILE_NAME = 'trips.json';

  static async uploadTripsData(trips: Trip[], accessToken: string, fileName?: string): Promise<void> {
    return this.uploadTripsDataWithFileName(trips, accessToken, fileName || this.DEFAULT_FILE_NAME);
  }

  static async uploadTripsDataWithFileName(trips: Trip[], accessToken: string, fileName: string): Promise<void> {
    try {
      const folderId = await this.ensureFolderExists(accessToken);
      const fileId = await this.findFile(fileName, folderId, accessToken);
      
      // Convert Date objects to ISO strings for validation and storage
      const serializedTrips = trips.map(trip => ({
        ...trip,
        startDate: trip.startDate instanceof Date ? trip.startDate.toISOString() : trip.startDate,
        endDate: trip.endDate instanceof Date ? trip.endDate.toISOString() : trip.endDate,
        createdAt: trip.createdAt instanceof Date ? trip.createdAt.toISOString() : trip.createdAt,
        updatedAt: trip.updatedAt instanceof Date ? trip.updatedAt.toISOString() : trip.updatedAt
      }));

      const tripsData = {
        trips: serializedTrips,
        lastModified: new Date().toISOString(),
        version: '1.0'
      };

      // Validate data before uploading
      const validation = tripDataValidator.validateTripData(tripsData);
      if (!validation.isValid) {
        const errorMessages = tripDataValidator.getFormattedErrors(validation.errors);
        throw new Error(`Invalid trip data: ${errorMessages.join(', ')}`);
      }

      const formData = new FormData();
      
      if (fileId) {
        // For updating existing file, only include name in metadata
        const metadata = {
          name: fileName
        };
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      } else {
        // For creating new file, include parents
        const metadata = {
          name: fileName,
          parents: [folderId]
        };
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      }
      
      formData.append('file', new Blob([JSON.stringify(tripsData, null, 2)], { type: 'application/json' }));

      const url = fileId 
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const response = await fetch(url, {
        method: fileId ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload trips data: ${response.statusText}`);
      }

      console.log('Trips data uploaded successfully');
    } catch (error) {
      console.error('Error uploading trips data:', error);
      throw error;
    }
  }

  static async downloadTripsData(accessToken: string, fileName?: string): Promise<Trip[]> {
    return this.downloadTripsDataFromFile(accessToken, fileName || this.DEFAULT_FILE_NAME);
  }

  static async downloadTripsDataFromFile(accessToken: string, fileName: string): Promise<Trip[]> {
    try {
      const folderId = await this.ensureFolderExists(accessToken);
      const fileId = await this.findFile(fileName, folderId, accessToken);
      
      if (!fileId) {
        return []; // No file exists yet
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download trips data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate downloaded data
      const validation = tripDataValidator.validateTripData(data);
      if (!validation.isValid) {
        const errorMessages = tripDataValidator.getFormattedErrors(validation.errors);
        throw new Error(`Invalid trip data in file: ${errorMessages.join(', ')}`);
      }
      
      return data.trips || [];
    } catch (error) {
      console.error('Error downloading trips data:', error);
      throw error;
    }
  }

  static async getFileInfo(accessToken: string, fileName?: string): Promise<GoogleDriveFile | null> {
    return this.getFileInfoByName(accessToken, fileName || this.DEFAULT_FILE_NAME);
  }

  static async getFileInfoByName(accessToken: string, fileName: string): Promise<GoogleDriveFile | null> {
    try {
      const folderId = await this.ensureFolderExists(accessToken);
      const fileId = await this.findFile(fileName, folderId, accessToken);
      
      if (!fileId) {
        return null;
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,modifiedTime,size`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  static async listTripFiles(accessToken: string): Promise<GoogleDriveFile[]> {
    try {
      const folderId = await this.ensureFolderExists(accessToken);
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and name contains '.json'&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing trip files:', error);
      throw error;
    }
  }

  private static async ensureFolderExists(accessToken: string): Promise<string> {
    // Check if folder exists
    const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Failed to search for folder: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // Create folder if it doesn't exist
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create folder: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    return createData.id;
  }

  private static async findFile(fileName: string, folderId: string, accessToken: string): Promise<string | null> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${folderId}' in parents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to find file: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }
}
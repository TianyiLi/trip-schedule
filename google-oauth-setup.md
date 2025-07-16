# Google OAuth Setup Guide for Travel Planner

This guide will help you set up Google OAuth integration for the Travel Planner PWA app.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A project in Google Cloud Console
3. Basic understanding of OAuth 2.0 flow

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" dropdown
3. Click "New Project"
4. Enter project name: "Travel Planner"
5. Click "Create"

## Step 2: Enable Required APIs

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Google Maps JavaScript API
   - Google Places API
   - Google Sheets API
   - Google Drive API

## Step 3: Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (for organization use)
   - App name: "Travel Planner"
   - User support email: Your email
   - App domain: Your domain
   - Developer contact information: Your email
5. Add authorized JavaScript origins:
   - For development: `http://localhost:5173`
   - For production: `https://yourdomain.com`
6. Add authorized redirect URIs:
   - For development: `http://localhost:5173/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Step 5: API Key Configuration

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API key"
3. Copy the API key
4. Click "Restrict key" and configure:
   - Application restrictions: HTTP referrers
   - Add your domain(s)
   - API restrictions: Select the APIs you enabled

## Step 6: OAuth Scopes

The app requires these OAuth scopes:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

## Step 7: Implementation Code

Here's the basic implementation structure:

### Google Auth Service

```typescript
// src/services/googleAuth.ts
export class GoogleAuthService {
  private clientId: string;
  private apiKey: string;
  private scopes: string[];

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    this.scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];
  }

  async initialize() {
    // Initialize Google API client
    await new Promise((resolve) => {
      gapi.load('auth2', resolve);
    });
    
    return gapi.auth2.init({
      client_id: this.clientId,
      scope: this.scopes.join(' ')
    });
  }

  async signIn() {
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.signIn();
  }

  async signOut() {
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.signOut();
  }

  isSignedIn() {
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }

  getCurrentUser() {
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.currentUser.get();
  }
}
```

### Google Sheets Integration

```typescript
// src/services/googleSheets.ts
export class GoogleSheetsService {
  async createSpreadsheet(title: string) {
    const response = await gapi.client.sheets.spreadsheets.create({
      properties: {
        title: title
      }
    });
    return response.result;
  }

  async exportTripToSheet(trip: Trip) {
    const spreadsheet = await this.createSpreadsheet(`${trip.title} - Travel Plan`);
    const spreadsheetId = spreadsheet.spreadsheetId;

    const values = [
      ['Location', 'Address', 'Visit Time', 'Duration', 'Notes'],
      ...trip.locations.map(loc => [
        loc.name,
        loc.address,
        loc.visitTime || '',
        loc.estimatedDuration?.toString() || '',
        loc.notes || ''
      ])
    ];

    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: {
        values: values
      }
    });

    return spreadsheetId;
  }
}
```

## Step 8: HTML Integration

Add the Google API script to your `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Travel Planner</title>
    <script src="https://apis.google.com/js/api.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 9: Testing

1. Start your development server
2. Navigate to the settings page
3. Click "Connect Google" button
4. Complete the OAuth flow
5. Test exporting a trip to Google Sheets

## Security Considerations

1. **Never commit API keys to version control**
2. **Use environment variables for sensitive data**
3. **Implement proper error handling**
4. **Regularly rotate API keys**
5. **Monitor API usage and quotas**

## Troubleshooting

### Common Issues

1. **"Origin not allowed"**: Check authorized JavaScript origins
2. **"Invalid redirect URI"**: Verify redirect URIs in OAuth settings
3. **"API key restrictions"**: Ensure API key has proper restrictions
4. **"Insufficient permissions"**: Check OAuth scopes

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test API endpoints manually
4. Check Google Cloud Console logs

## Production Deployment

1. Update authorized origins with production URLs
2. Set production environment variables
3. Test OAuth flow on production domain
4. Monitor API usage and quotas

## Support

For additional help:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
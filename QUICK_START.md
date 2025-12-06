# Quick Start Guide - Water Tank Monitoring Dashboard

## 🚀 Getting Started

This guide will help you get the premium water tank monitoring dashboard up and running with the backend integration.

## Prerequisites

- Node.js installed
- MongoDB running (or MongoDB Atlas connection string)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Setup Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file with your MongoDB connection string
echo "MONGODB_URI=your_mongodb_connection_string_here" > .env
echo "PORT=3000" >> .env

# Start the backend server
npm start
# or
node server.js
```

The backend will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Option 1: Open directly in browser
# Simply open dashboard.html in your browser

# Option 2: Use a local server (recommended)
# Using Python:
python -m http.server 8000

# Using Node.js (if you have http-server installed):
npx http-server -p 8000

# Using PHP:
php -S localhost:8000
```

Then navigate to `http://localhost:8000/dashboard.html` in your browser.

### 3. Configuration

The dashboard is configured to connect to the backend automatically. If your backend is running on a different port or URL, edit `frontend/dashboard.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change this if needed
const USE_BACKEND = true; // Set to false for simulation-only mode
```

## Features

✅ **Automatic Backend Connection**: The dashboard automatically detects and connects to your backend API

✅ **Fallback Mode**: If the backend is unavailable, the dashboard automatically switches to simulation mode

✅ **Real-time Updates**: Water levels update every 2 seconds from the backend

✅ **Pump Control**: Start/Stop buttons send commands to the backend API

✅ **Historical Data**: Charts are populated from MongoDB data

✅ **Status Indicator**: Header shows connection status (Backend Connected/Offline/Simulation Mode)

## Usage

1. **Login**: Enter any username and password to access the dashboard
2. **Monitor**: Watch real-time water levels, metrics, and charts
3. **Control**: Use Start/Stop buttons to control the pump (sends API requests to backend)
4. **Alerts**: System automatically detects and alerts on critical conditions

## API Endpoints Used

The dashboard uses these backend endpoints:

- `GET /api/water-level` - Get current water level
- `POST /api/fill-water` - Start filling (body: `{ amount: 10 }`)
- `POST /api/reduce-water` - Start reducing (body: `{ amount: 10 }`)
- `GET /api/water-level-history` - Get historical data for charts

## Troubleshooting

### Backend Not Connecting?

1. Make sure backend is running on port 3000
2. Check CORS settings in `backend/server.js` (should include your frontend URL)
3. Check browser console for connection errors
4. Verify MongoDB connection in backend logs

### Charts Not Updating?

1. Ensure you have historical data in MongoDB
2. Check browser console for API errors
3. Try refreshing the page

### Pump Controls Not Working?

1. Verify backend API is responding
2. Check backend logs for POST requests
3. Ensure CORS is properly configured
4. Check browser network tab for failed requests

## Testing Without Backend

To test the dashboard without the backend:

1. Edit `frontend/dashboard.js`
2. Set `const USE_BACKEND = false;`
3. Refresh the page
4. Dashboard will use simulation mode only

## Production Deployment

For production:

1. Update `API_BASE_URL` to your production backend URL
2. Configure proper CORS settings in backend
3. Use HTTPS for secure connections
4. Set up proper authentication/authorization
5. Configure environment variables properly

## Support

- Check the browser console for errors
- Review backend server logs
- Verify MongoDB connection
- Check network tab in browser dev tools

Enjoy your premium water tank monitoring dashboard! 🎉



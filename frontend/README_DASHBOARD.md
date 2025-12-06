# Premium Water Tank Monitoring Dashboard

A beautiful, modern water tank monitoring dashboard built with pure HTML, CSS, and JavaScript featuring glassmorphic design, real-time monitoring, and interactive charts.

## Features

### ✨ Visual Design
- **Glassmorphic UI** with frosted glass effects and backdrop blur
- **Gradient background** (purple to deep violet)
- **Smooth animations** and micro-interactions
- **Responsive grid layout**
- **Floating cards** with soft shadows and border glow effects

### 🎯 Core Features

1. **Animated Water Level Gauge**
   - Circular SVG gauge with smooth animations
   - Real-time percentage display
   - Color transitions: green (good) → yellow (warning) → red (critical)
   - Volume display in liters
   - Wave animations for visual appeal

2. **System Controls Panel**
   - Manual Start/Stop pump buttons with loading states
   - Emergency Stop button (red, prominent with pulse animation)
   - Real-time status indicators with pulse animations
   - Auto-mode toggle switch

3. **Live Metrics Cards**
   - Current water level
   - Groundwater level with trend arrows
   - Flow rate (L/min)
   - Time to empty/fill estimates
   - Each card with icon and hover effects

4. **Interactive Charts** (using Chart.js)
   - Daily consumption bar chart (7 days)
   - Fill/empty time comparison line chart
   - Gradient fills and smooth animations
   - Real-time updates

5. **Smart Alerts System**
   - Dismissible alert cards
   - Color-coded (red=critical, yellow=warning, blue=info)
   - Icon indicators
   - Slide-in animations
   - Auto-detection of critical conditions

6. **Persistent Data Storage**
   - In-memory JavaScript objects for state management
   - Stores: water levels, pump history, consumption data, user settings
   - Simulated real-time updates every 2 seconds

7. **User Authentication UI**
   - Login modal with glassmorphic design
   - Username/password fields
   - Remember me checkbox
   - Logout button in header

8. **Notification System**
   - Toast notifications in top-right corner
   - Auto-dismiss after 5 seconds
   - Stack multiple notifications
   - Types: success, error, warning, info

## Technical Details

- **Pure vanilla JavaScript** (no frameworks)
- **CSS Grid and Flexbox** for layout
- **CSS animations and transitions**
- **Chart.js** for data visualization (loaded via CDN)
- **Font Awesome** icons (loaded via CDN)
- **In-memory storage** only (no localStorage/sessionStorage)
- **Fully functional** without external dependencies except CDN resources

## Interactions

- ✅ **Ripple effects** on button clicks
- ✅ **Hover lift animations** on cards
- ✅ **Smooth color transitions** on state changes
- ✅ **Loading spinners** for async actions
- ✅ **Confirmation dialogs** for critical actions
- ✅ **Smooth gauge animations** with color transitions

## How to Use

1. **Open the dashboard:**
   ```bash
   # Simply open dashboard.html in a web browser
   # Or serve it via a local server:
   python -m http.server 8000
   # Then navigate to http://localhost:8000/dashboard.html
   ```

2. **Login:**
   - Enter any username and password
   - Check "Remember me" if desired
   - Click "Sign In"

3. **Monitor the dashboard:**
   - Watch the animated gauge for real-time water levels
   - Check metrics cards for detailed information
   - View charts for consumption and time comparisons
   - Monitor alerts for system warnings

4. **Control the system:**
   - Use "Start Pump" / "Stop Pump" buttons
   - Activate "EMERGENCY STOP" for immediate shutdown
   - Toggle "Auto Mode" for automatic water level management

5. **Logout:**
   - Click the "Logout" button in the header

## File Structure

```
frontend/
├── dashboard.html    # Main dashboard HTML file
├── dashboard.js      # JavaScript functionality
└── README_DASHBOARD.md  # This file
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

All styling is contained within the `<style>` tag in `dashboard.html`. You can easily customize:
- Colors (via CSS variables in `:root`)
- Update intervals (in `AppState.updateInterval`)
- Tank capacity (in `AppState.tankCapacity`)
- Simulation speed (in `AppState.simulationSpeed`)

## Notes

- The dashboard uses simulated data for demonstration purposes
- All data is stored in memory and will reset on page refresh
- For production use, integrate with your backend API endpoints
- The emergency stop can be reset by clicking it again when active

## Integration with Backend

To integrate with your existing backend (`server.js`), you can:

1. Replace simulated data with API calls to `/api/water-level`
2. Update pump controls to POST to `/api/fill-water` or `/api/reduce-water`
3. Fetch historical data from `/api/water-level-history`

Example integration:
```javascript
// In dashboard.js, replace simulation with:
async function fetchWaterLevel() {
    const response = await fetch('http://localhost:3000/api/water-level');
    const data = await response.json();
    AppState.waterLevel = data.level;
    updateGauge();
}
```

Enjoy your premium water tank monitoring dashboard! 🚀


// Premium Water Tank Monitoring Dashboard - JavaScript
// In-memory data storage (no localStorage)

// Backend API Configuration
const API_BASE_URL = 'http://localhost:3000';
const USE_BACKEND = true; // Set to false to use simulation mode

const AppState = {
    // Authentication
    isAuthenticated: false,
    currentUser: null,
    
    // Water tank data
    waterLevel: 50, // percentage
    tankCapacity: 1000, // liters
    groundwaterLevel: 15.2, // meters
    flowRate: 25.5, // L/min
    
    // Pump status
    pumpStatus: 'stopped', // 'running', 'stopped', 'emergency'
    autoMode: false,
    
    // Historical data
    consumptionData: {
        labels: [],
        values: []
    },
    fillEmptyHistory: {
        fillTimes: [],
        emptyTimes: []
    },
    
    // Alerts
    alerts: [],
    
    // Settings
    updateInterval: 2000, // 2 seconds
    simulationSpeed: 1,
    
    // API connection status
    apiConnected: false
};

// Chart instances
let consumptionChart = null;
let timeChart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
    initializeCharts();
    attachRippleEffects();
    updateAPIStatus(); // Initial status update
    
    // Check backend connection
    if (USE_BACKEND) {
        checkBackendConnection().then(() => {
            initializeData();
            startSimulation();
        }).catch(() => {
            updateAPIStatus();
            showToast('warning', 'Backend Unavailable', 'Using simulation mode. Backend API not connected.');
            initializeData();
            startSimulation();
        });
    } else {
        initializeData();
        startSimulation();
    }
});

// Update API status indicator
function updateAPIStatus() {
    const statusEl = document.getElementById('apiStatus');
    if (!statusEl) return;
    
    if (USE_BACKEND && AppState.apiConnected) {
        statusEl.innerHTML = `
            <i class="fas fa-circle" style="font-size: 8px; color: #22c55e; animation: statusPulse 2s infinite;"></i>
            <span>Backend Connected</span>
        `;
        statusEl.style.background = 'rgba(34, 197, 94, 0.2)';
    } else if (USE_BACKEND && !AppState.apiConnected) {
        statusEl.innerHTML = `
            <i class="fas fa-circle" style="font-size: 8px; color: #f59e0b;"></i>
            <span>Backend Offline</span>
        `;
        statusEl.style.background = 'rgba(245, 158, 11, 0.2)';
    } else {
        statusEl.innerHTML = `
            <i class="fas fa-circle" style="font-size: 8px; color: #6366f1;"></i>
            <span>Simulation Mode</span>
        `;
        statusEl.style.background = 'rgba(99, 102, 241, 0.2)';
    }
}

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (response.ok) {
            AppState.apiConnected = true;
            updateAPIStatus();
            showToast('success', 'Connected', 'Successfully connected to backend API.');
            return true;
        }
    } catch (error) {
        console.error('Backend connection error:', error);
        AppState.apiConnected = false;
        updateAPIStatus();
        throw error;
    }
}

// Fetch water level from backend
async function fetchWaterLevel() {
    if (!USE_BACKEND || !AppState.apiConnected) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/water-level`);
        if (response.ok) {
            const data = await response.json();
            return data.level;
        }
    } catch (error) {
        console.error('Error fetching water level:', error);
        AppState.apiConnected = false;
        updateAPIStatus();
    }
    return null;
}

// Fetch historical data from backend
async function fetchHistoricalData() {
    if (!USE_BACKEND || !AppState.apiConnected) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/water-level-history`);
        if (response.ok) {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Error fetching historical data:', error);
    }
    return null;
}

// Login functionality
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Simple authentication (in production, this would verify with backend)
        if (username && password) {
            AppState.isAuthenticated = true;
            AppState.currentUser = username;
            
            if (rememberMe) {
                AppState.rememberUser = true;
            }
            
            loginModal.classList.remove('active');
            document.getElementById('mainContainer').style.display = 'block';
            document.getElementById('userName').textContent = username;
            
            showToast('success', 'Welcome!', 'Successfully logged in.');
            
            // Generate initial alerts
            setTimeout(() => {
                addAlert('info', 'System Initialized', 'Water tank monitoring system is now active.');
            }, 1000);
        } else {
            showToast('error', 'Login Failed', 'Please enter username and password.');
        }
    });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        AppState.isAuthenticated = false;
        AppState.currentUser = null;
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('loginForm').reset();
        showToast('info', 'Logged Out', 'You have been successfully logged out.');
    }
}

// Initialize charts
function initializeCharts() {
    // Generate initial consumption data (last 7 days)
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const consumptionValues = days.map(() => Math.floor(Math.random() * 300) + 100);
    
    AppState.consumptionData = {
        labels: days,
        values: consumptionValues
    };
    
    // Consumption Chart (Bar Chart)
    const consumptionCtx = document.getElementById('consumptionChart').getContext('2d');
    consumptionChart = new Chart(consumptionCtx, {
        type: 'bar',
        data: {
            labels: AppState.consumptionData.labels,
            datasets: [{
                label: 'Consumption (L)',
                data: AppState.consumptionData.values,
                backgroundColor: [
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(192, 132, 252, 0.6)',
                    'rgba(217, 70, 239, 0.6)',
                    'rgba(236, 72, 153, 0.6)',
                    'rgba(244, 63, 94, 0.6)'
                ],
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Fill/Empty Time Comparison Chart (Line Chart)
    const timeCtx = document.getElementById('timeChart').getContext('2d');
    
    // Generate initial fill/empty times
    const fillTimes = [2.5, 2.8, 2.3, 2.6, 2.4, 2.7, 2.5];
    const emptyTimes = [4.2, 4.0, 4.5, 3.8, 4.3, 3.9, 4.1];
    
    AppState.fillEmptyHistory = {
        fillTimes: fillTimes,
        emptyTimes: emptyTimes
    };
    
    timeChart = new Chart(timeCtx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Fill Time (hrs)',
                    data: fillTimes,
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Empty Time (hrs)',
                    data: emptyTimes,
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Initialize data
async function initializeData() {
    // Fetch initial water level from backend if available
    if (USE_BACKEND && AppState.apiConnected) {
        const level = await fetchWaterLevel();
        if (level !== null) {
            AppState.waterLevel = level;
        }
        
        // Fetch and process historical data
        const history = await fetchHistoricalData();
        if (history && history.length > 0) {
            processHistoricalData(history);
        }
    }
    
    updateGauge();
    updateMetrics();
    updateAlerts();
}

// Process historical data for charts
function processHistoricalData(history) {
    // Process consumption data (last 7 days)
    const recentData = history.slice(0, 7).reverse();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Calculate consumption based on usageRate
    const consumptionValues = recentData.map((entry, index) => {
        // Use usageRate if available, otherwise estimate
        if (entry.usageRate) {
            return Math.round(entry.usageRate * 60 * 24 / 100); // Estimate daily consumption
        }
        return Math.floor(Math.random() * 300) + 100; // Fallback
    });
    
    AppState.consumptionData = {
        labels: days.slice(-recentData.length),
        values: consumptionValues
    };
    
    // Update consumption chart
    if (consumptionChart) {
        consumptionChart.data.labels = AppState.consumptionData.labels;
        consumptionChart.data.datasets[0].data = AppState.consumptionData.values;
        consumptionChart.update('none');
    }
    
    // Process fill/empty times
    const fillTimes = recentData.map(entry => {
        if (entry.tankFillDuration) {
            const parts = entry.tankFillDuration.split(':');
            return parseFloat(parts[0]) + parseFloat(parts[1]) / 60 + parseFloat(parts[2]) / 3600;
        }
        return 2 + Math.random();
    });
    
    const emptyTimes = recentData.map(entry => {
        if (entry.tankDecreaseDuration) {
            const parts = entry.tankDecreaseDuration.split(':');
            return parseFloat(parts[0]) + parseFloat(parts[1]) / 60 + parseFloat(parts[2]) / 3600;
        }
        return 3.5 + Math.random() * 1.5;
    });
    
    AppState.fillEmptyHistory = {
        fillTimes: fillTimes,
        emptyTimes: emptyTimes
    };
    
    // Update time chart
    if (timeChart) {
        timeChart.data.datasets[0].data = AppState.fillEmptyHistory.fillTimes;
        timeChart.data.datasets[1].data = AppState.fillEmptyHistory.emptyTimes;
        timeChart.update('none');
    }
}

// Update water level gauge
function updateGauge() {
    const percentage = AppState.waterLevel;
    const circumference = 2 * Math.PI * 120; // radius = 120
    const offset = circumference - (percentage / 100) * circumference;
    
    const gaugeFill = document.getElementById('gaugeFill');
    gaugeFill.style.strokeDashoffset = offset;
    
    // Change color based on level
    if (percentage >= 70) {
        gaugeFill.style.stroke = '#22c55e'; // green
    } else if (percentage >= 30) {
        gaugeFill.style.stroke = '#f59e0b'; // yellow
    } else {
        gaugeFill.style.stroke = '#ef4444'; // red
    }
    
    document.getElementById('gaugePercentage').textContent = `${Math.round(percentage)}%`;
    const volume = (percentage / 100) * AppState.tankCapacity;
    document.getElementById('gaugeVolume').textContent = `${Math.round(volume)} L`;
}

// Update metrics cards
function updateMetrics() {
    document.getElementById('currentLevel').textContent = `${Math.round(AppState.waterLevel)}%`;
    document.getElementById('groundwaterLevel').textContent = `${AppState.groundwaterLevel.toFixed(1)}m`;
    document.getElementById('flowRate').textContent = AppState.flowRate.toFixed(1);
    
    // Calculate time to empty/fill
    const currentVolume = (AppState.waterLevel / 100) * AppState.tankCapacity;
    if (AppState.pumpStatus === 'running') {
        // Filling
        const remainingVolume = AppState.tankCapacity - currentVolume;
        const timeHours = remainingVolume / (AppState.flowRate * 60);
        const hours = Math.floor(timeHours);
        const minutes = Math.floor((timeHours - hours) * 60);
        document.getElementById('timeEstimate').textContent = `${hours}h ${minutes}m`;
        document.getElementById('timeLabel').textContent = 'Time to Fill';
    } else {
        // Emptying
        const timeHours = currentVolume / (AppState.flowRate * 60);
        const hours = Math.floor(timeHours);
        const minutes = Math.floor((timeHours - hours) * 60);
        document.getElementById('timeEstimate').textContent = `${hours}h ${minutes}m`;
        document.getElementById('timeLabel').textContent = 'Time to Empty';
    }
}

// Pump controls
async function startPump(event) {
    if (AppState.pumpStatus === 'emergency') {
        showToast('error', 'Emergency Stop Active', 'Please reset emergency stop first.');
        return;
    }
    
    const btn = document.getElementById('btnStart');
    btn.classList.add('loading');
    
    if (event) createRipple(event, btn);
    
    try {
        // Call backend API if available
        if (USE_BACKEND && AppState.apiConnected) {
            const response = await fetch(`${API_BASE_URL}/api/fill-water`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: 10 }) // Fill by 10%
            });
            
            if (response.ok) {
                const data = await response.json();
                AppState.waterLevel = Math.min(100, AppState.waterLevel + 10);
                updateGauge();
                updateMetrics();
            }
        } else {
            // Simulation mode
            AppState.waterLevel = Math.min(100, AppState.waterLevel + 10);
            updateGauge();
            updateMetrics();
        }
        
        AppState.pumpStatus = 'running';
        updatePumpStatus();
        btn.classList.remove('loading');
        showToast('success', 'Pump Started', 'Water pump is now running.');
        addAlert('info', 'Pump Started', 'Manual pump activation successful.');
        
    } catch (error) {
        console.error('Error starting pump:', error);
        btn.classList.remove('loading');
        showToast('error', 'Connection Error', 'Failed to communicate with backend. Using local simulation.');
        AppState.pumpStatus = 'running';
        updatePumpStatus();
    }
}

async function stopPump(event) {
    if (AppState.pumpStatus === 'emergency') {
        showToast('error', 'Emergency Stop Active', 'Pump is already stopped.');
        return;
    }
    
    const btn = document.getElementById('btnStop');
    btn.classList.add('loading');
    
    if (event) createRipple(event, btn);
    
    try {
        // Call backend API if available
        if (USE_BACKEND && AppState.apiConnected) {
            const response = await fetch(`${API_BASE_URL}/api/reduce-water`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: 10 }) // Reduce by 10%
            });
            
            if (response.ok) {
                const data = await response.json();
                AppState.waterLevel = Math.max(0, AppState.waterLevel - 10);
                updateGauge();
                updateMetrics();
            }
        } else {
            // Simulation mode
            AppState.waterLevel = Math.max(0, AppState.waterLevel - 10);
            updateGauge();
            updateMetrics();
        }
        
        AppState.pumpStatus = 'stopped';
        updatePumpStatus();
        btn.classList.remove('loading');
        showToast('warning', 'Pump Stopped', 'Water pump has been stopped.');
        addAlert('warning', 'Pump Stopped', 'Manual pump deactivation.');
        
    } catch (error) {
        console.error('Error stopping pump:', error);
        btn.classList.remove('loading');
        showToast('error', 'Connection Error', 'Failed to communicate with backend. Using local simulation.');
        AppState.pumpStatus = 'stopped';
        updatePumpStatus();
    }
}

function emergencyStop(event) {
    if (event) createRipple(event, event.target);
    
    if (AppState.pumpStatus === 'emergency') {
        // Reset emergency stop
        if (confirm('Reset Emergency Stop? System operations will resume.')) {
            AppState.pumpStatus = 'stopped';
            updatePumpStatus();
            showToast('success', 'Emergency Stop Reset', 'System operations can now resume.');
            removeAlert('critical', 'Emergency Stop Activated');
        }
    } else {
        // Activate emergency stop
        if (confirm('Activate EMERGENCY STOP? This will immediately halt all pump operations.')) {
            AppState.pumpStatus = 'emergency';
            updatePumpStatus();
            showToast('error', 'Emergency Stop', 'All pump operations have been halted!');
            addAlert('critical', 'Emergency Stop Activated', 'All system operations have been immediately halted for safety.');
        }
    }
}

function toggleAutoMode() {
    AppState.autoMode = document.getElementById('autoMode').checked;
    if (AppState.autoMode) {
        showToast('success', 'Auto Mode Enabled', 'System will now automatically manage water levels.');
        addAlert('info', 'Auto Mode Active', 'Automatic water level management is now enabled.');
    } else {
        showToast('info', 'Auto Mode Disabled', 'Manual control mode activated.');
    }
}

function updatePumpStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('pumpStatus');
    const btnEmergency = document.querySelector('.btn-emergency');
    
    if (AppState.pumpStatus === 'running') {
        statusDot.className = 'status-dot active';
        statusText.textContent = 'Running';
        statusText.style.color = '';
        if (btnEmergency) {
            btnEmergency.innerHTML = '<i class="fas fa-exclamation-triangle"></i> EMERGENCY STOP';
        }
    } else if (AppState.pumpStatus === 'emergency') {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'EMERGENCY STOP';
        statusText.style.color = '#ef4444';
        if (btnEmergency) {
            btnEmergency.innerHTML = '<i class="fas fa-unlock"></i> RESET EMERGENCY STOP';
            btnEmergency.style.background = 'rgba(239, 68, 68, 0.6)';
        }
    } else {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Stopped';
        statusText.style.color = '';
        if (btnEmergency) {
            btnEmergency.innerHTML = '<i class="fas fa-exclamation-triangle"></i> EMERGENCY STOP';
            btnEmergency.style.background = 'rgba(239, 68, 68, 0.4)';
        }
    }
}

// Simulation and real-time updates
async function startSimulation() {
    setInterval(async () => {
        if (!AppState.isAuthenticated) return;
        
        // Fetch latest water level from backend if connected
        if (USE_BACKEND && AppState.apiConnected) {
            const level = await fetchWaterLevel();
            if (level !== null) {
                AppState.waterLevel = level;
            } else {
                // Fallback to simulation if API fails
                updateWaterLevelSimulation();
            }
        } else {
            // Use simulation mode
            updateWaterLevelSimulation();
        }
        
        // Simulate flow rate variation (or fetch from backend if available)
        AppState.flowRate = 20 + Math.random() * 15;
        
        // Simulate groundwater level variation (or fetch from backend if available)
        AppState.groundwaterLevel = 14.5 + Math.random() * 1.5;
        
        // Update UI
        updateGauge();
        updateMetrics();
        checkAlerts();
        
        // Update charts periodically
        if (Math.random() > 0.9) {
            updateCharts();
            
            // Refresh historical data from backend
            if (USE_BACKEND && AppState.apiConnected) {
                const history = await fetchHistoricalData();
                if (history && history.length > 0) {
                    processHistoricalData(history);
                }
            }
        }
        
    }, AppState.updateInterval);
}

// Update water level simulation (fallback mode)
function updateWaterLevelSimulation() {
    if (AppState.pumpStatus === 'emergency') {
        return; // Don't change level during emergency stop
    }
    
    // Simulate water level changes
    if (AppState.pumpStatus === 'running') {
        // Filling
        AppState.waterLevel = Math.min(100, AppState.waterLevel + (Math.random() * 2 + 1));
    } else if (AppState.pumpStatus === 'stopped' && AppState.autoMode === false) {
        // Natural consumption
        AppState.waterLevel = Math.max(0, AppState.waterLevel - (Math.random() * 0.5 + 0.2));
    } else if (AppState.autoMode) {
        // Auto mode: maintain between 30-80%
        if (AppState.waterLevel < 30) {
            AppState.pumpStatus = 'running';
            AppState.waterLevel = Math.min(100, AppState.waterLevel + (Math.random() * 2 + 1));
        } else if (AppState.waterLevel > 80) {
            AppState.pumpStatus = 'stopped';
            AppState.waterLevel = Math.max(0, AppState.waterLevel - (Math.random() * 0.5 + 0.2));
        } else {
            AppState.waterLevel = Math.max(0, AppState.waterLevel - (Math.random() * 0.3 + 0.1));
        }
        updatePumpStatus();
    } else {
        // Emptying
        AppState.waterLevel = Math.max(0, AppState.waterLevel - (Math.random() * 0.5 + 0.2));
    }
}

function checkAlerts() {
    // Check for critical levels
    if (AppState.waterLevel < 15 && !hasAlert('critical', 'Low Water Level')) {
        addAlert('critical', 'Low Water Level', 'Water level is critically low! Consider filling the tank immediately.');
        showToast('error', 'Critical Alert', 'Water level is critically low!');
    } else if (AppState.waterLevel > 90 && !hasAlert('warning', 'Tank Almost Full')) {
        addAlert('warning', 'Tank Almost Full', 'Water tank is nearly full. Consider stopping the pump.');
    } else if (AppState.waterLevel >= 15 && AppState.waterLevel <= 90) {
        // Remove critical/warning alerts if level is back to normal
        removeAlert('critical', 'Low Water Level');
        removeAlert('warning', 'Tank Almost Full');
    }
}

function hasAlert(type, title) {
    return AppState.alerts.some(alert => alert.type === type && alert.title === title);
}

function removeAlert(type, title) {
    AppState.alerts = AppState.alerts.filter(alert => !(alert.type === type && alert.title === title));
    updateAlerts();
}

// Alerts system
function addAlert(type, title, message) {
    const alert = {
        id: Date.now(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date()
    };
    
    AppState.alerts.unshift(alert);
    
    // Keep only last 5 alerts
    if (AppState.alerts.length > 5) {
        AppState.alerts = AppState.alerts.slice(0, 5);
    }
    
    updateAlerts();
}

function updateAlerts() {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '';
    
    if (AppState.alerts.length === 0) {
        container.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px;">No active alerts</div>';
        return;
    }
    
    AppState.alerts.forEach(alert => {
        const alertCard = document.createElement('div');
        alertCard.className = `alert-card ${alert.type}`;
        
        const icons = {
            critical: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        alertCard.innerHTML = `
            <i class="fas ${icons[alert.type]} alert-icon"></i>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
            <button class="alert-close" onclick="dismissAlert(${alert.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(alertCard);
    });
}

function dismissAlert(id) {
    AppState.alerts = AppState.alerts.filter(alert => alert.id !== id);
    updateAlerts();
}

// Toast notifications
function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div style="font-weight: 600; margin-bottom: 3px;">${title}</div>
            <div style="font-size: 13px; opacity: 0.9;">${message}</div>
        </div>
        <div class="toast-progress"></div>
    `;
    
    container.appendChild(toast);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Ripple effect
function createRipple(event, element) {
    if (!element || !event) return;
    
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple to all buttons
function attachRippleEffects() {
    document.querySelectorAll('.btn, .btn-login, .btn-logout').forEach(button => {
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
}

// Initialize ripple effects after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachRippleEffects);
} else {
    attachRippleEffects();
}

// Update charts with new data
function updateCharts() {
    // Update consumption chart (simulate new day)
    const newValue = Math.floor(Math.random() * 300) + 100;
    AppState.consumptionData.values.push(newValue);
    AppState.consumptionData.values.shift();
    consumptionChart.data.datasets[0].data = AppState.consumptionData.values;
    consumptionChart.update('none');
    
    // Update fill/empty times
    const newFillTime = 2 + Math.random() * 1;
    const newEmptyTime = 3.5 + Math.random() * 1.5;
    AppState.fillEmptyHistory.fillTimes.push(newFillTime);
    AppState.fillEmptyHistory.emptyTimes.push(newEmptyTime);
    AppState.fillEmptyHistory.fillTimes.shift();
    AppState.fillEmptyHistory.emptyTimes.shift();
    
    timeChart.data.datasets[0].data = AppState.fillEmptyHistory.fillTimes;
    timeChart.data.datasets[1].data = AppState.fillEmptyHistory.emptyTimes;
    timeChart.update('none');
}

// Make functions globally available
window.startPump = startPump;
window.stopPump = stopPump;
window.emergencyStop = emergencyStop;
window.toggleAutoMode = toggleAutoMode;
window.logout = logout;
window.dismissAlert = dismissAlert;


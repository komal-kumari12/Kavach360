// AI-based Anomaly Detection Visualization

let anomalyData = [];
let anomalyChart;
let anomalyHeatmap;
let anomalyDetectionActive = false;
let anomalyThreshold = 0.7; // Default threshold (0-1)
let anomalyCategories = {
    'location_jump': { color: '#ff5500', icon: 'fa-map-marker-alt', label: 'Location Anomaly' },
    'time_pattern': { color: '#ffaa00', icon: 'fa-clock', label: 'Time Pattern Anomaly' },
    'geofence': { color: '#ff0000', icon: 'fa-exclamation-triangle', label: 'Geofence Violation' },
    'behavior': { color: '#aa00ff', icon: 'fa-user', label: 'Behavior Anomaly' },
    'group': { color: '#00aaff', icon: 'fa-users', label: 'Group Anomaly' }
};

// Initialize anomaly detection visualization
function initAnomalyDetection() {
    // Set up UI elements
    setupAnomalyUI();
    
    // Initialize visualization components
    initAnomalyChart();
    initAnomalyHeatmap();
    
    // Load initial data
    loadAnomalyData();
    
    // Set up event listeners
    setupAnomalyEventListeners();
    
    console.log('Anomaly detection visualization initialized');
}

// Set up anomaly detection UI elements
function setupAnomalyUI() {
    // Create anomaly control panel if it doesn't exist
    if (!document.getElementById('anomalyControlPanel')) {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'anomalyControlPanel';
        controlPanel.className = 'map-control anomaly-control';
        controlPanel.innerHTML = `
            <div class="control-header">
                <h4><i class="fas fa-robot"></i> AI Anomaly Detection</h4>
                <div class="toggle-switch">
                    <input type="checkbox" id="anomalyToggle">
                    <label for="anomalyToggle"></label>
                </div>
            </div>
            <div class="control-body">
                <div class="form-group">
                    <label for="anomalyThreshold">Detection Threshold</label>
                    <input type="range" id="anomalyThreshold" min="0" max="1" step="0.05" value="${anomalyThreshold}">
                    <span id="thresholdValue">${anomalyThreshold}</span>
                </div>
                <div class="anomaly-categories">
                    <h5>Categories</h5>
                    <div id="anomalyCategoryToggles">
                        ${Object.entries(anomalyCategories).map(([key, category]) => `
                            <div class="category-toggle">
                                <input type="checkbox" id="category_${key}" checked>
                                <label for="category_${key}">
                                    <i class="fas ${category.icon}" style="color: ${category.color}"></i>
                                    ${category.label}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add to map if map exists
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.appendChild(controlPanel);
        } else {
            // Otherwise add to analytics tab
            const analyticsTab = document.getElementById('analytics-tab');
            if (analyticsTab) {
                analyticsTab.appendChild(controlPanel);
            }
        }
    }
    
    // Create anomaly dashboard card if it doesn't exist
    if (!document.getElementById('anomalyDashboard')) {
        const anomalyDashboard = document.createElement('div');
        anomalyDashboard.id = 'anomalyDashboard';
        anomalyDashboard.className = 'card';
        anomalyDashboard.innerHTML = `
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-robot"></i> AI Anomaly Detection</h3>
                <div class="card-actions">
                    <button id="refreshAnomalyData" class="btn btn-icon"><i class="fas fa-sync-alt"></i></button>
                    <button id="exportAnomalyData" class="btn btn-icon"><i class="fas fa-download"></i></button>
                </div>
            </div>
            <div class="card-body">
                <div class="dashboard-grid-2">
                    <div class="anomaly-stats">
                        <div class="stat-card">
                            <div class="stat-icon warning">
                                <i class="fas fa-exclamation-circle"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="totalAnomalies">0</div>
                                <div class="stat-label">Total Anomalies</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon danger">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="criticalAnomalies">0</div>
                                <div class="stat-label">Critical Anomalies</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon primary">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-value" id="affectedTourists">0</div>
                                <div class="stat-label">Affected Tourists</div>
                            </div>
                        </div>
                    </div>
                    <div class="anomaly-chart-container">
                        <canvas id="anomalyChart"></canvas>
                    </div>
                </div>
                <div class="anomaly-heatmap-container">
                    <h4>Anomaly Heatmap</h4>
                    <div id="anomalyHeatmap"></div>
                </div>
                <div class="anomaly-list-container">
                    <h4>Recent Anomalies</h4>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Tourist</th>
                                    <th>Type</th>
                                    <th>Confidence</th>
                                    <th>Location</th>
                                    <th>Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="anomalyTableBody">
                                <tr>
                                    <td colspan="6" class="text-center">No anomalies detected</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Add to analytics tab
        const analyticsTab = document.getElementById('analytics-tab');
        if (analyticsTab) {
            analyticsTab.appendChild(anomalyDashboard);
        }
    }
}

// Initialize anomaly chart
function initAnomalyChart() {
    const chartCanvas = document.getElementById('anomalyChart');
    if (!chartCanvas) return;
    
    // Create chart
    anomalyChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: Object.values(anomalyCategories).map(c => c.label),
            datasets: [{
                label: 'Anomalies by Category',
                data: Array(Object.keys(anomalyCategories).length).fill(0),
                backgroundColor: Object.values(anomalyCategories).map(c => c.color),
                borderColor: Object.values(anomalyCategories).map(c => c.color),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize anomaly heatmap
function initAnomalyHeatmap() {
    const heatmapContainer = document.getElementById('anomalyHeatmap');
    if (!heatmapContainer) return;
    
    // Clear existing heatmap
    heatmapContainer.innerHTML = '';
    
    // Create heatmap
    anomalyHeatmap = h337.create({
        container: heatmapContainer,
        radius: 25,
        maxOpacity: 0.8,
        minOpacity: 0.3,
        blur: 0.8,
        gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
        }
    });
    
    // Add map background
    const mapBackground = document.createElement('div');
    mapBackground.className = 'heatmap-background';
    mapBackground.style.backgroundImage = 'url("https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/77.2090,28.6139,10,0/600x300?access_token=pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNrZHM4ZGNldDFwOGgycm85eGN4aXM4encifQ.8tJiSqgDU-uPHZ5TWKahZw")';
    heatmapContainer.insertBefore(mapBackground, heatmapContainer.firstChild);
}

// Load anomaly data from API
async function loadAnomalyData() {
    try {
        // Show loading
        showLoading('anomalyDashboard');
        
        // Fetch data from API
        const response = await fetch('/api/anomalies');
        if (!response.ok) {
            throw new Error('Failed to fetch anomaly data');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Store data
            anomalyData = data.data;
            
            // Update visualizations
            updateAnomalyVisualizations();
        } else {
            throw new Error(data.message || 'Failed to load anomaly data');
        }
        
        // Hide loading
        hideLoading('anomalyDashboard');
    } catch (error) {
        console.error('Error loading anomaly data:', error);
        showNotification('Error loading anomaly data: ' + error.message, 'error');
        hideLoading('anomalyDashboard');
        
        // Use sample data for demonstration
        useSampleAnomalyData();
    }
}

// Use sample data for demonstration
function useSampleAnomalyData() {
    // Sample anomaly data
    anomalyData = [
        {
            id: 'a1',
            touristId: 't1',
            touristName: 'John Smith',
            type: 'location_jump',
            confidence: 0.85,
            location: {
                latitude: 28.6129,
                longitude: 77.2295
            },
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            details: {
                distance: 8.2,
                previousLocation: {
                    latitude: 28.5621,
                    longitude: 77.1270
                },
                timeDifference: 300 // seconds
            }
        },
        {
            id: 'a2',
            touristId: 't2',
            touristName: 'Emma Johnson',
            type: 'time_pattern',
            confidence: 0.72,
            location: {
                latitude: 28.6356,
                longitude: 77.2217
            },
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            details: {
                expectedTime: '10:00 AM',
                actualTime: '2:30 AM',
                pattern: 'unusual_hour'
            }
        },
        {
            id: 'a3',
            touristId: 't3',
            touristName: 'Michael Chen',
            type: 'geofence',
            confidence: 0.95,
            location: {
                latitude: 28.5535,
                longitude: 77.2588
            },
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            details: {
                zoneName: 'Restricted Area',
                zoneType: 'restricted',
                entryTime: new Date(Date.now() - 8 * 60000).toISOString()
            }
        },
        {
            id: 'a4',
            touristId: 't4',
            touristName: 'Sarah Williams',
            type: 'behavior',
            confidence: 0.68,
            location: {
                latitude: 28.6129,
                longitude: 77.2295
            },
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
            details: {
                pattern: 'erratic_movement',
                duration: 45, // minutes
                severity: 'medium'
            }
        },
        {
            id: 'a5',
            touristId: 't5',
            touristName: 'David Garcia',
            type: 'group',
            confidence: 0.79,
            location: {
                latitude: 28.6356,
                longitude: 77.2217
            },
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
            details: {
                groupSize: 5,
                expectedSize: 12,
                missingMembers: ['Tourist 6', 'Tourist 7', 'Tourist 8']
            }
        }
    ];
    
    // Update visualizations with sample data
    updateAnomalyVisualizations();
}

// Update all anomaly visualizations
function updateAnomalyVisualizations() {
    // Filter anomalies based on threshold
    const filteredAnomalies = anomalyData.filter(a => a.confidence >= anomalyThreshold);
    
    // Update stats
    updateAnomalyStats(filteredAnomalies);
    
    // Update chart
    updateAnomalyChart(filteredAnomalies);
    
    // Update heatmap
    updateAnomalyHeatmap(filteredAnomalies);
    
    // Update table
    updateAnomalyTable(filteredAnomalies);
    
    // Update map markers if map exists
    if (window.map) {
        updateAnomalyMapMarkers(filteredAnomalies);
    }
}

// Update anomaly statistics
function updateAnomalyStats(anomalies) {
    // Update total anomalies
    const totalAnomaliesElement = document.getElementById('totalAnomalies');
    if (totalAnomaliesElement) {
        totalAnomaliesElement.textContent = anomalies.length;
    }
    
    // Update critical anomalies (confidence > 0.8)
    const criticalAnomaliesElement = document.getElementById('criticalAnomalies');
    if (criticalAnomaliesElement) {
        const criticalCount = anomalies.filter(a => a.confidence > 0.8).length;
        criticalAnomaliesElement.textContent = criticalCount;
    }
    
    // Update affected tourists (unique tourist IDs)
    const affectedTouristsElement = document.getElementById('affectedTourists');
    if (affectedTouristsElement) {
        const uniqueTourists = new Set(anomalies.map(a => a.touristId));
        affectedTouristsElement.textContent = uniqueTourists.size;
    }
}

// Update anomaly chart
function updateAnomalyChart(anomalies) {
    if (!anomalyChart) return;
    
    // Count anomalies by type
    const categoryCounts = {};
    Object.keys(anomalyCategories).forEach(key => {
        categoryCounts[key] = 0;
    });
    
    anomalies.forEach(anomaly => {
        if (categoryCounts[anomaly.type] !== undefined) {
            categoryCounts[anomaly.type]++;
        }
    });
    
    // Update chart data
    anomalyChart.data.datasets[0].data = Object.values(categoryCounts);
    anomalyChart.update();
}

// Update anomaly heatmap
function updateAnomalyHeatmap(anomalies) {
    if (!anomalyHeatmap) return;
    
    // Convert anomalies to heatmap data points
    const heatmapContainer = document.getElementById('anomalyHeatmap');
    const width = heatmapContainer.offsetWidth;
    const height = heatmapContainer.offsetHeight;
    
    // Define map bounds (Delhi area)
    const bounds = {
        north: 28.8,
        south: 28.4,
        east: 77.4,
        west: 77.0
    };
    
    // Convert geo coordinates to pixel coordinates
    const geoToPixel = (lat, lng) => {
        const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
        const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height;
        return { x, y };
    };
    
    // Create data points
    const dataPoints = anomalies.map(anomaly => {
        const { latitude, longitude } = anomaly.location;
        const point = geoToPixel(latitude, longitude);
        
        return {
            x: Math.round(point.x),
            y: Math.round(point.y),
            value: anomaly.confidence,
            radius: 20 + (anomaly.confidence * 20) // Size based on confidence
        };
    });
    
    // Update heatmap data
    anomalyHeatmap.setData({
        max: 1,
        data: dataPoints
    });
}

// Update anomaly table
function updateAnomalyTable(anomalies) {
    const tableBody = document.getElementById('anomalyTableBody');
    if (!tableBody) return;
    
    if (anomalies.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No anomalies detected</td></tr>';
        return;
    }
    
    // Sort anomalies by timestamp (newest first)
    const sortedAnomalies = [...anomalies].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Generate table rows
    let html = '';
    
    sortedAnomalies.forEach(anomaly => {
        const { touristName, type, confidence, location, timestamp } = anomaly;
        const category = anomalyCategories[type] || { color: '#999', icon: 'fa-question-circle', label: 'Unknown' };
        const time = new Date(timestamp).toLocaleString();
        const locationStr = `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
        const confidenceClass = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
        
        html += `
            <tr data-id="${anomaly.id}">
                <td>${touristName}</td>
                <td>
                    <span class="anomaly-type" style="color: ${category.color}">
                        <i class="fas ${category.icon}"></i> ${category.label}
                    </span>
                </td>
                <td>
                    <div class="confidence-bar ${confidenceClass}" style="width: ${confidence * 100}%">
                        ${Math.round(confidence * 100)}%
                    </div>
                </td>
                <td>${locationStr}</td>
                <td>${time}</td>
                <td>
                    <button onclick="viewAnomalyDetails('${anomaly.id}')" class="btn btn-sm btn-icon">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="locateTouristFromAnomaly('${anomaly.touristId}')" class="btn btn-sm btn-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update anomaly markers on the map
function updateAnomalyMapMarkers(anomalies) {
    // Check if map and tourist tracking are initialized
    if (!window.map || !window.touristMarkers) return;
    
    // Remove existing anomaly markers
    if (window.anomalyMarkers) {
        Object.values(window.anomalyMarkers).forEach(marker => {
            window.map.removeLayer(marker);
        });
    }
    
    // Initialize anomaly markers object
    window.anomalyMarkers = {};
    
    // Add new anomaly markers
    anomalies.forEach(anomaly => {
        const { id, touristId, type, confidence, location } = anomaly;
        const category = anomalyCategories[type] || { color: '#999', icon: 'fa-question-circle' };
        
        // Create marker icon
        const markerIcon = L.divIcon({
            className: 'anomaly-marker',
            html: `<div class="marker-icon" style="background-color: ${category.color};"><i class="fas ${category.icon}"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Create marker
        const marker = L.marker([location.latitude, location.longitude], { icon: markerIcon });
        
        // Add popup
        marker.bindPopup(createAnomalyPopup(anomaly));
        
        // Add to map
        marker.addTo(window.map);
        
        // Store reference
        window.anomalyMarkers[id] = marker;
        
        // Pulse animation for high confidence anomalies
        if (confidence > 0.8) {
            const markerElement = marker.getElement();
            if (markerElement) {
                markerElement.classList.add('pulse');
            }
        }
    });
}

// Create popup content for anomaly marker
function createAnomalyPopup(anomaly) {
    const { touristName, type, confidence, timestamp, details } = anomaly;
    const category = anomalyCategories[type] || { color: '#999', icon: 'fa-question-circle', label: 'Unknown' };
    const time = new Date(timestamp).toLocaleString();
    
    // Format details based on anomaly type
    let detailsHtml = '';
    
    if (type === 'location_jump') {
        detailsHtml = `
            <p><strong>Distance:</strong> ${details.distance.toFixed(2)} km</p>
            <p><strong>Time Difference:</strong> ${Math.round(details.timeDifference / 60)} minutes</p>
        `;
    } else if (type === 'time_pattern') {
        detailsHtml = `
            <p><strong>Expected Time:</strong> ${details.expectedTime}</p>
            <p><strong>Actual Time:</strong> ${details.actualTime}</p>
            <p><strong>Pattern:</strong> ${details.pattern.replace('_', ' ')}</p>
        `;
    } else if (type === 'geofence') {
        detailsHtml = `
            <p><strong>Zone:</strong> ${details.zoneName}</p>
            <p><strong>Zone Type:</strong> ${details.zoneType}</p>
            <p><strong>Entry Time:</strong> ${new Date(details.entryTime).toLocaleTimeString()}</p>
        `;
    } else if (type === 'behavior') {
        detailsHtml = `
            <p><strong>Pattern:</strong> ${details.pattern.replace('_', ' ')}</p>
            <p><strong>Duration:</strong> ${details.duration} minutes</p>
            <p><strong>Severity:</strong> ${details.severity}</p>
        `;
    } else if (type === 'group') {
        detailsHtml = `
            <p><strong>Group Size:</strong> ${details.groupSize}</p>
            <p><strong>Expected Size:</strong> ${details.expectedSize}</p>
            <p><strong>Missing Members:</strong> ${details.missingMembers.length}</p>
        `;
    }
    
    return `
        <div class="anomaly-popup">
            <h4 style="color: ${category.color};"><i class="fas ${category.icon}"></i> ${category.label}</h4>
            <p><strong>Tourist:</strong> ${touristName}</p>
            <p><strong>Confidence:</strong> ${Math.round(confidence * 100)}%</p>
            <p><strong>Time:</strong> ${time}</p>
            <div class="anomaly-details">
                ${detailsHtml}
            </div>
            <div class="popup-actions">
                <button onclick="viewAnomalyDetails('${anomaly.id}')" class="btn btn-sm btn-primary">Details</button>
                <button onclick="locateTouristFromAnomaly('${anomaly.touristId}')" class="btn btn-sm btn-outline">Locate Tourist</button>
            </div>
        </div>
    `;
}

// View anomaly details
function viewAnomalyDetails(anomalyId) {
    // Find anomaly
    const anomaly = anomalyData.find(a => a.id === anomalyId);
    if (!anomaly) return;
    
    // Create modal content
    const modalHtml = createAnomalyDetailModal(anomaly);
    
    // Show modal
    showModal(modalHtml);
    
    // Initialize detail charts if needed
    initAnomalyDetailCharts(anomaly);
}

// Create anomaly detail modal content
function createAnomalyDetailModal(anomaly) {
    const { touristName, type, confidence, location, timestamp, details } = anomaly;
    const category = anomalyCategories[type] || { color: '#999', icon: 'fa-question-circle', label: 'Unknown' };
    const time = new Date(timestamp).toLocaleString();
    
    // Format details based on anomaly type
    let detailsHtml = '';
    let chartsHtml = '';
    
    if (type === 'location_jump') {
        detailsHtml = `
            <div class="detail-item">
                <strong>Distance:</strong> ${details.distance.toFixed(2)} km
            </div>
            <div class="detail-item">
                <strong>Time Difference:</strong> ${Math.round(details.timeDifference / 60)} minutes
            </div>
            <div class="detail-item">
                <strong>Previous Location:</strong> ${details.previousLocation.latitude.toFixed(6)}, ${details.previousLocation.longitude.toFixed(6)}
            </div>
            <div class="detail-item">
                <strong>Current Location:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </div>
        `;
        
        chartsHtml = `
            <div class="detail-map-container">
                <div id="anomalyDetailMap" style="height: 300px;"></div>
            </div>
        `;
    } else if (type === 'time_pattern') {
        detailsHtml = `
            <div class="detail-item">
                <strong>Expected Time:</strong> ${details.expectedTime}
            </div>
            <div class="detail-item">
                <strong>Actual Time:</strong> ${details.actualTime}
            </div>
            <div class="detail-item">
                <strong>Pattern:</strong> ${details.pattern.replace('_', ' ')}
            </div>
        `;
        
        chartsHtml = `
            <div class="detail-chart-container">
                <canvas id="timePatternChart"></canvas>
            </div>
        `;
    } else if (type === 'geofence') {
        detailsHtml = `
            <div class="detail-item">
                <strong>Zone:</strong> ${details.zoneName}
            </div>
            <div class="detail-item">
                <strong>Zone Type:</strong> ${details.zoneType}
            </div>
            <div class="detail-item">
                <strong>Entry Time:</strong> ${new Date(details.entryTime).toLocaleTimeString()}
            </div>
            <div class="detail-item">
                <strong>Location:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </div>
        `;
        
        chartsHtml = `
            <div class="detail-map-container">
                <div id="geofenceDetailMap" style="height: 300px;"></div>
            </div>
        `;
    } else if (type === 'behavior') {
        detailsHtml = `
            <div class="detail-item">
                <strong>Pattern:</strong> ${details.pattern.replace('_', ' ')}
            </div>
            <div class="detail-item">
                <strong>Duration:</strong> ${details.duration} minutes
            </div>
            <div class="detail-item">
                <strong>Severity:</strong> ${details.severity}
            </div>
            <div class="detail-item">
                <strong>Location:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </div>
        `;
        
        chartsHtml = `
            <div class="detail-chart-container">
                <canvas id="behaviorPatternChart"></canvas>
            </div>
        `;
    } else if (type === 'group') {
        detailsHtml = `
            <div class="detail-item">
                <strong>Group Size:</strong> ${details.groupSize}
            </div>
            <div class="detail-item">
                <strong>Expected Size:</strong> ${details.expectedSize}
            </div>
            <div class="detail-item">
                <strong>Missing Members:</strong> ${details.missingMembers.join(', ')}
            </div>
            <div class="detail-item">
                <strong>Location:</strong> ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
            </div>
        `;
        
        chartsHtml = `
            <div class="detail-chart-container">
                <canvas id="groupSizeChart"></canvas>
            </div>
        `;
    }
    
    return `
        <div class="modal-header">
            <h3 style="color: ${category.color};"><i class="fas ${category.icon}"></i> ${category.label}</h3>
            <button class="close-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="anomaly-detail-header">
                <div class="detail-tourist">
                    <h4>${touristName}</h4>
                    <p><i class="fas fa-clock"></i> ${time}</p>
                </div>
                <div class="detail-confidence">
                    <div class="confidence-label">Confidence</div>
                    <div class="confidence-value">${Math.round(confidence * 100)}%</div>
                    <div class="confidence-bar ${confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low'}" style="width: ${confidence * 100}%"></div>
                </div>
            </div>
            
            <div class="anomaly-detail-content">
                <div class="detail-section">
                    <h5>Details</h5>
                    <div class="detail-items">
                        ${detailsHtml}
                    </div>
                </div>
                
                <div class="detail-section">
                    <h5>Visualization</h5>
                    ${chartsHtml}
                </div>
                
                <div class="detail-section">
                    <h5>Actions</h5>
                    <div class="detail-actions">
                        <button onclick="locateTouristFromAnomaly('${anomaly.touristId}')" class="btn btn-primary">
                            <i class="fas fa-map-marker-alt"></i> Locate Tourist
                        </button>
                        <button onclick="contactTouristFromAnomaly('${anomaly.touristId}')" class="btn btn-outline">
                            <i class="fas fa-phone"></i> Contact Tourist
                        </button>
                        <button onclick="dismissAnomaly('${anomaly.id}')" class="btn btn-outline">
                            <i class="fas fa-check"></i> Dismiss
                        </button>
                        <button onclick="reportFalsePositive('${anomaly.id}')" class="btn btn-outline">
                            <i class="fas fa-times"></i> Report False Positive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize anomaly detail charts
function initAnomalyDetailCharts(anomaly) {
    const { type, details } = anomaly;
    
    if (type === 'location_jump') {
        // Initialize map
        const mapContainer = document.getElementById('anomalyDetailMap');
        if (mapContainer) {
            const detailMap = L.map('anomalyDetailMap').setView([anomaly.location.latitude, anomaly.location.longitude], 12);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(detailMap);
            
            // Add markers
            const prevMarker = L.marker([details.previousLocation.latitude, details.previousLocation.longitude], {
                icon: L.divIcon({
                    className: 'detail-marker',
                    html: '<div class="marker-icon" style="background-color: #00cc00;"><i class="fas fa-map-marker-alt"></i></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(detailMap);
            
            const currMarker = L.marker([anomaly.location.latitude, anomaly.location.longitude], {
                icon: L.divIcon({
                    className: 'detail-marker',
                    html: '<div class="marker-icon" style="background-color: #ff0000;"><i class="fas fa-map-marker-alt"></i></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(detailMap);
            
            // Add line between points
            const line = L.polyline([
                [details.previousLocation.latitude, details.previousLocation.longitude],
                [anomaly.location.latitude, anomaly.location.longitude]
            ], {
                color: '#ff5500',
                weight: 3,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(detailMap);
            
            // Add popups
            prevMarker.bindPopup('Previous Location<br>' + new Date(new Date(anomaly.timestamp).getTime() - details.timeDifference * 1000).toLocaleString());
            currMarker.bindPopup('Current Location<br>' + new Date(anomaly.timestamp).toLocaleString());
            
            // Fit bounds
            detailMap.fitBounds([
                [details.previousLocation.latitude, details.previousLocation.longitude],
                [anomaly.location.latitude, anomaly.location.longitude]
            ]);
        }
    } else if (type === 'time_pattern') {
        // Initialize time pattern chart
        const chartCanvas = document.getElementById('timePatternChart');
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            
            // Sample data for demonstration
            const timePatternChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        {
                            label: 'Expected Pattern',
                            data: [10, 10.5, 9.5, 10, 11, 16, 15],
                            borderColor: '#00cc00',
                            backgroundColor: 'rgba(0, 204, 0, 0.1)',
                            borderWidth: 2,
                            fill: true
                        },
                        {
                            label: 'Actual Pattern',
                            data: [10, 10.5, 9.5, 10, 11, 2.5, 15],
                            borderColor: '#ff0000',
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            borderWidth: 2,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Hour of Day'
                            },
                            min: 0,
                            max: 24
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const hours = Math.floor(value);
                                    const minutes = Math.round((value - hours) * 60);
                                    return `${context.dataset.label}: ${hours}:${minutes.toString().padStart(2, '0')}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    } else if (type === 'geofence') {
        // Initialize map
        const mapContainer = document.getElementById('geofenceDetailMap');
        if (mapContainer) {
            const detailMap = L.map('geofenceDetailMap').setView([anomaly.location.latitude, anomaly.location.longitude], 14);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(detailMap);
            
            // Add marker
            const marker = L.marker([anomaly.location.latitude, anomaly.location.longitude], {
                icon: L.divIcon({
                    className: 'detail-marker',
                    html: '<div class="marker-icon" style="background-color: #ff0000;"><i class="fas fa-exclamation-triangle"></i></div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                })
            }).addTo(detailMap);
            
            // Add geofence zone (sample)
            const geofenceCoords = [
                [anomaly.location.latitude - 0.01, anomaly.location.longitude - 0.01],
                [anomaly.location.latitude - 0.01, anomaly.location.longitude + 0.01],
                [anomaly.location.latitude + 0.01, anomaly.location.longitude + 0.01],
                [anomaly.location.latitude + 0.01, anomaly.location.longitude - 0.01]
            ];
            
            const geofencePolygon = L.polygon(geofenceCoords, {
                color: '#ff0000',
                fillColor: '#ff0000',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(detailMap);
            
            // Add popup
            marker.bindPopup(`Geofence Violation<br>${details.zoneName}<br>${new Date(anomaly.timestamp).toLocaleString()}`);
            geofencePolygon.bindPopup(`${details.zoneName}<br>Type: ${details.zoneType}`);
        }
    } else if (type === 'behavior') {
        // Initialize behavior pattern chart
        const chartCanvas = document.getElementById('behaviorPatternChart');
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            
            // Sample data for demonstration
            const behaviorChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Movement Speed', 'Direction Changes', 'Area Coverage', 'Stop Duration', 'Path Deviation', 'Time of Day'],
                    datasets: [
                        {
                            label: 'Normal Pattern',
                            data: [0.5, 0.3, 0.6, 0.4, 0.2, 0.7],
                            borderColor: '#00cc00',
                            backgroundColor: 'rgba(0, 204, 0, 0.2)',
                            borderWidth: 2,
                            pointBackgroundColor: '#00cc00'
                        },
                        {
                            label: 'Current Pattern',
                            data: [0.8, 0.9, 0.3, 0.2, 0.8, 0.7],
                            borderColor: '#ff0000',
                            backgroundColor: 'rgba(255, 0, 0, 0.2)',
                            borderWidth: 2,
                            pointBackgroundColor: '#ff0000'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            min: 0,
                            max: 1,
                            ticks: {
                                display: false
                            }
                        }
                    }
                }
            });
        }
    } else if (type === 'group') {
        // Initialize group size chart
        const chartCanvas = document.getElementById('groupSizeChart');
        if (chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            
            // Sample data for demonstration
            const groupChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Expected Size', 'Current Size', 'Missing Members'],
                    datasets: [
                        {
                            label: 'Group Members',
                            data: [details.expectedSize, details.groupSize, details.missingMembers.length],
                            backgroundColor: ['#00cc00', '#ffaa00', '#ff0000'],
                            borderColor: ['#00cc00', '#ffaa00', '#ff0000'],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }
    }
}

// Locate tourist from anomaly
function locateTouristFromAnomaly(touristId) {
    // Close modal if open
    closeModal();
    
    // Call locate tourist function from tourist tracking
    if (window.locateTourist) {
        window.locateTourist(touristId);
    } else {
        // Fallback if tourist tracking not initialized
        fetch(`/api/tourists/${touristId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const tourist = data.data;
                    
                    // Center map on tourist location
                    if (window.map) {
                        window.map.setView([tourist.location.latitude, tourist.location.longitude], 15);
                    }
                } else {
                    showNotification('Failed to locate tourist', 'error');
                }
            })
            .catch(error => {
                console.error('Error locating tourist:', error);
                showNotification('Error locating tourist: ' + error.message, 'error');
            });
    }
}

// Contact tourist from anomaly
function contactTouristFromAnomaly(touristId) {
    // Close modal if open
    closeModal();
    
    // Call contact tourist function from tourist tracking
    if (window.contactTourist) {
        window.contactTourist(touristId);
    } else {
        showNotification('Contact functionality not available', 'warning');
    }
}

// Dismiss anomaly
function dismissAnomaly(anomalyId) {
    // Close modal if open
    closeModal();
    
    // Send dismiss request to API
    fetch(`/api/anomalies/${anomalyId}/dismiss`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Anomaly dismissed', 'success');
                
                // Remove from anomaly data
                anomalyData = anomalyData.filter(a => a.id !== anomalyId);
                
                // Update visualizations
                updateAnomalyVisualizations();
            } else {
                throw new Error(data.message || 'Failed to dismiss anomaly');
            }
        })
        .catch(error => {
            console.error('Error dismissing anomaly:', error);
            showNotification('Error dismissing anomaly: ' + error.message, 'error');
            
            // For demonstration, remove from local data anyway
            anomalyData = anomalyData.filter(a => a.id !== anomalyId);
            updateAnomalyVisualizations();
        });
}

// Report false positive
function reportFalsePositive(anomalyId) {
    // Close modal if open
    closeModal();
    
    // Send false positive report to API
    fetch(`/api/anomalies/${anomalyId}/false-positive`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('False positive reported', 'success');
                
                // Remove from anomaly data
                anomalyData = anomalyData.filter(a => a.id !== anomalyId);
                
                // Update visualizations
                updateAnomalyVisualizations();
            } else {
                throw new Error(data.message || 'Failed to report false positive');
            }
        })
        .catch(error => {
            console.error('Error reporting false positive:', error);
            showNotification('Error reporting false positive: ' + error.message, 'error');
            
            // For demonstration, remove from local data anyway
            anomalyData = anomalyData.filter(a => a.id !== anomalyId);
            updateAnomalyVisualizations();
        });
}

// Set up event listeners
function setupAnomalyEventListeners() {
    // Anomaly toggle
    const anomalyToggle = document.getElementById('anomalyToggle');
    if (anomalyToggle) {
        anomalyToggle.addEventListener('change', function() {
            anomalyDetectionActive = this.checked;
            
            if (anomalyDetectionActive) {
                // Enable anomaly detection
                if (window.enableAnomalyDetection) {
                    window.enableAnomalyDetection();
                }
                showNotification('Anomaly detection enabled', 'info');
            } else {
                // Disable anomaly detection
                if (window.disableAnomalyDetection) {
                    window.disableAnomalyDetection();
                }
                showNotification('Anomaly detection disabled', 'info');
            }
            
            // Update UI
            document.getElementById('anomalyControlPanel').classList.toggle('active', anomalyDetectionActive);
        });
    }
    
    // Threshold slider
    const thresholdSlider = document.getElementById('anomalyThreshold');
    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', function() {
            anomalyThreshold = parseFloat(this.value);
            document.getElementById('thresholdValue').textContent = anomalyThreshold.toFixed(2);
            
            // Update visualizations
            updateAnomalyVisualizations();
        });
    }
    
    // Category toggles
    document.querySelectorAll('#anomalyCategoryToggles input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const categoryKey = this.id.replace('category_', '');
            const category = anomalyCategories[categoryKey];
            
            if (category) {
                // Update visualizations to filter by selected categories
                updateAnomalyVisualizations();
            }
        });
    });
    
    // Refresh button
    const refreshButton = document.getElementById('refreshAnomalyData');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            loadAnomalyData();
        });
    }
    
    // Export button
    const exportButton = document.getElementById('exportAnomalyData');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            exportAnomalyData();
        });
    }
}

// Export anomaly data
function exportAnomalyData() {
    // Filter anomalies based on threshold
    const filteredAnomalies = anomalyData.filter(a => a.confidence >= anomalyThreshold);
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Tourist,Type,Confidence,Latitude,Longitude,Timestamp\n';
    
    filteredAnomalies.forEach(anomaly => {
        const row = [
            anomaly.id,
            anomaly.touristName,
            anomalyCategories[anomaly.type]?.label || anomaly.type,
            anomaly.confidence,
            anomaly.location.latitude,
            anomaly.location.longitude,
            new Date(anomaly.timestamp).toISOString()
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `anomaly_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    showNotification('Anomaly data exported successfully', 'success');
}

// Show modal
function showModal(content) {
    // Create modal if it doesn't exist
    let modalContainer = document.getElementById('modalContainer');
    
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        modalContainer.className = 'modal-container';
        document.body.appendChild(modalContainer);
    }
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = content;
    
    // Clear existing content
    modalContainer.innerHTML = '';
    
    // Add new content
    modalContainer.appendChild(modalContent);
    
    // Show modal
    modalContainer.style.display = 'flex';
    
    // Add close event listener
    const closeButton = modalContainer.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // Close on click outside
    modalContainer.addEventListener('click', function(event) {
        if (event.target === modalContainer) {
            closeModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Close modal
function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.style.display = 'none';
    }
}

// Show loading indicator
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    
    if (container) {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = container.querySelector('.loading-overlay');
        
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
            container.appendChild(loadingOverlay);
        } else {
            loadingOverlay.style.display = 'flex';
        }
    }
}

// Hide loading indicator
function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    
    if (container) {
        const loadingOverlay = container.querySelector('.loading-overlay');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if anomaly detection should be initialized
    const analyticsTab = document.getElementById('analytics-tab');
    if (analyticsTab) {
        // Add heatmap.js script if not already loaded
        if (!window.h337) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/heatmap.js@2.0.5/build/heatmap.min.js';
            script.onload = function() {
                initAnomalyDetection();
            };
            document.head.appendChild(script);
        } else {
            initAnomalyDetection();
        }
    }
});
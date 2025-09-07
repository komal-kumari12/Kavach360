// Tourist Tracking and Monitoring System

let map;
let touristMarkers = {};
let selectedTourist = null;
let refreshInterval;
let heatmapLayer;
let clusterGroup;
let anomalyDetectionEnabled = false;

// Initialize the map and tracking system
function initTouristTracking() {
    // Initialize map if it doesn't exist
    if (!map) {
        initMap();
    }
    
    // Load initial tourist locations
    loadTouristLocations();
    
    // Set up real-time updates
    setupRealTimeUpdates();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize tourist list
    updateTouristList();
}

// Initialize the map
function initMap() {
    // Create map centered on a default location (can be adjusted based on tourist locations)
    map = L.map('map').setView([28.6139, 77.2090], 10); // Default to Delhi
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Initialize cluster group for tourist markers
    clusterGroup = L.markerClusterGroup();
    map.addLayer(clusterGroup);
    
    // Add map controls
    addMapControls();
}

// Add custom controls to the map
function addMapControls() {
    // Add layer control
    const baseMaps = {
        "Street": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }),
        "Satellite": L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
        })
    };
    
    const overlayMaps = {
        "Tourists": clusterGroup,
        "Heatmap": createHeatmapLayer()
    };
    
    L.control.layers(baseMaps, overlayMaps).addTo(map);
    
    // Add search control
    const searchControl = L.control({position: 'topleft'});
    searchControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-search-control');
        div.innerHTML = `
            <input type="text" id="touristMapSearch" placeholder="Search tourist..." />
            <button id="clearMapSearch"><i class="fas fa-times"></i></button>
        `;
        return div;
    };
    searchControl.addTo(map);
    
    // Add custom info control
    const infoControl = L.control({position: 'bottomleft'});
    infoControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'map-info-control');
        div.innerHTML = `
            <div id="mapTouristInfo" class="hidden">
                <h4>Tourist Information</h4>
                <div id="selectedTouristInfo">Select a tourist to view details</div>
                <div class="map-info-actions">
                    <button id="trackTourist" class="btn btn-sm btn-primary">Track</button>
                    <button id="contactTourist" class="btn btn-sm btn-outline">Contact</button>
                </div>
            </div>
        `;
        return div;
    };
    infoControl.addTo(map);
}

// Create heatmap layer based on tourist density
function createHeatmapLayer() {
    // Create empty heatmap layer
    heatmapLayer = L.heatLayer([], {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1: 'red'}
    });
    
    return heatmapLayer;
}

// Load tourist locations from the API
async function loadTouristLocations() {
    try {
        showLoading('map');
        
        const response = await fetch('/api/tourists/locations');
        if (!response.ok) {
            throw new Error('Failed to fetch tourist locations');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateTouristMarkers(data.data);
            updateHeatmap(data.data);
            updateTouristStats(data.data);
        } else {
            showNotification('Failed to load tourist locations', 'error');
        }
        
        hideLoading('map');
    } catch (error) {
        console.error('Error loading tourist locations:', error);
        showNotification('Error loading tourist data: ' + error.message, 'error');
        hideLoading('map');
    }
}

// Update tourist markers on the map
function updateTouristMarkers(tourists) {
    // Clear existing markers from cluster group
    clusterGroup.clearLayers();
    
    // Track IDs to remove later
    const currentIds = tourists.map(t => t.id);
    const existingIds = Object.keys(touristMarkers);
    
    // Add or update markers
    tourists.forEach(tourist => {
        const { id, name, location, safetyScore, status } = tourist;
        const position = [location.latitude, location.longitude];
        
        // Create or update marker
        if (touristMarkers[id]) {
            // Update existing marker position
            touristMarkers[id].setLatLng(position);
        } else {
            // Create new marker
            const markerColor = getTouristMarkerColor(safetyScore, status);
            const markerIcon = L.divIcon({
                className: 'tourist-marker',
                html: `<div class="marker-icon" style="background-color: ${markerColor};"><i class="fas fa-user"></i></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker(position, {icon: markerIcon});
            
            // Add popup with tourist info
            marker.bindPopup(createTouristPopup(tourist));
            
            // Add click event
            marker.on('click', () => selectTourist(tourist));
            
            touristMarkers[id] = marker;
        }
        
        // Add to cluster group
        clusterGroup.addLayer(touristMarkers[id]);
    });
    
    // Remove markers for tourists no longer in the data
    existingIds.forEach(id => {
        if (!currentIds.includes(id)) {
            clusterGroup.removeLayer(touristMarkers[id]);
            delete touristMarkers[id];
        }
    });
}

// Create popup content for tourist marker
function createTouristPopup(tourist) {
    const { name, email, location, safetyScore, status } = tourist;
    const lastUpdate = new Date(location.lastUpdate).toLocaleString();
    
    return `
        <div class="tourist-popup">
            <h4>${name}</h4>
            <p><i class="fas fa-envelope"></i> ${email}</p>
            <p><i class="fas fa-map-marker-alt"></i> Last updated: ${lastUpdate}</p>
            <p><i class="fas fa-shield-alt"></i> Safety score: ${safetyScore}</p>
            <p><i class="fas fa-info-circle"></i> Status: ${status}</p>
            <div class="popup-actions">
                <button onclick="selectTourist('${tourist.id}')" class="btn btn-sm btn-primary">Details</button>
            </div>
        </div>
    `;
}

// Get marker color based on safety score and status
function getTouristMarkerColor(safetyScore, status) {
    if (status === 'sos' || status === 'emergency') {
        return '#ff0000'; // Red for emergency
    } else if (status === 'overdue') {
        return '#ff9900'; // Orange for overdue check-in
    } else if (safetyScore < 50) {
        return '#ff9900'; // Orange for low safety score
    } else if (safetyScore < 75) {
        return '#ffff00'; // Yellow for medium safety score
    } else {
        return '#00cc00'; // Green for high safety score
    }
}

// Update heatmap with tourist locations
function updateHeatmap(tourists) {
    const heatmapData = tourists.map(tourist => {
        const intensity = getHeatmapIntensity(tourist);
        return [
            tourist.location.latitude,
            tourist.location.longitude,
            intensity
        ];
    });
    
    heatmapLayer.setLatLngs(heatmapData);
}

// Calculate heatmap intensity based on tourist data
function getHeatmapIntensity(tourist) {
    // Base intensity
    let intensity = 0.5;
    
    // Adjust based on safety score (lower score = higher intensity)
    if (tourist.safetyScore < 50) {
        intensity += (50 - tourist.safetyScore) / 50;
    }
    
    // Adjust based on status
    if (tourist.status === 'sos' || tourist.status === 'emergency') {
        intensity += 1;
    } else if (tourist.status === 'overdue') {
        intensity += 0.5;
    }
    
    return Math.min(intensity, 1); // Cap at 1
}

// Set up real-time updates
function setupRealTimeUpdates() {
    // Clear existing interval if any
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // Set up new interval (every 30 seconds)
    refreshInterval = setInterval(() => {
        loadTouristLocations();
    }, 30000);
    
    // Set up WebSocket for real-time updates if available
    setupWebSocket();
}

// Set up WebSocket connection for real-time updates
function setupWebSocket() {
    // Check if WebSocket is supported
    if ('WebSocket' in window) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/tourists`;
        
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = function() {
            console.log('WebSocket connection established');
        };
        
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            if (data.type === 'location_update') {
                // Handle real-time location update
                handleLocationUpdate(data.tourist);
            } else if (data.type === 'status_change') {
                // Handle status change
                handleStatusChange(data.tourist);
            } else if (data.type === 'emergency') {
                // Handle emergency alert
                handleEmergencyAlert(data.tourist);
            }
        };
        
        socket.onerror = function(error) {
            console.error('WebSocket error:', error);
            // Fall back to polling
        };
        
        socket.onclose = function() {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after a delay
            setTimeout(setupWebSocket, 5000);
        };
    }
}

// Handle real-time location update
function handleLocationUpdate(tourist) {
    if (touristMarkers[tourist.id]) {
        // Update marker position
        const position = [tourist.location.latitude, tourist.location.longitude];
        touristMarkers[tourist.id].setLatLng(position);
        
        // Update popup content
        touristMarkers[tourist.id].setPopupContent(createTouristPopup(tourist));
        
        // Update selected tourist info if this is the selected tourist
        if (selectedTourist && selectedTourist.id === tourist.id) {
            updateSelectedTouristInfo(tourist);
        }
        
        // Check for anomalies if enabled
        if (anomalyDetectionEnabled) {
            detectAnomalies(tourist);
        }
    } else {
        // If marker doesn't exist, refresh all markers
        loadTouristLocations();
    }
}

// Handle status change
function handleStatusChange(tourist) {
    if (touristMarkers[tourist.id]) {
        // Update marker color
        const markerColor = getTouristMarkerColor(tourist.safetyScore, tourist.status);
        const markerIcon = L.divIcon({
            className: 'tourist-marker',
            html: `<div class="marker-icon" style="background-color: ${markerColor};"><i class="fas fa-user"></i></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        touristMarkers[tourist.id].setIcon(markerIcon);
        
        // Update popup content
        touristMarkers[tourist.id].setPopupContent(createTouristPopup(tourist));
        
        // Show notification for important status changes
        if (tourist.status === 'sos' || tourist.status === 'emergency') {
            showNotification(`Emergency: ${tourist.name} has triggered an SOS alert!`, 'error');
            // Play alert sound
            playAlertSound('emergency');
        } else if (tourist.status === 'overdue') {
            showNotification(`Alert: ${tourist.name} has missed their check-in.`, 'warning');
            // Play alert sound
            playAlertSound('warning');
        }
        
        // Update selected tourist info if this is the selected tourist
        if (selectedTourist && selectedTourist.id === tourist.id) {
            updateSelectedTouristInfo(tourist);
        }
    } else {
        // If marker doesn't exist, refresh all markers
        loadTouristLocations();
    }
}

// Handle emergency alert
function handleEmergencyAlert(tourist) {
    // Show notification
    showNotification(`EMERGENCY: ${tourist.name} has triggered an SOS alert at ${new Date().toLocaleTimeString()}!`, 'error');
    
    // Play alert sound
    playAlertSound('emergency');
    
    // Center map on tourist location
    map.setView([tourist.location.latitude, tourist.location.longitude], 15);
    
    // Open popup
    if (touristMarkers[tourist.id]) {
        touristMarkers[tourist.id].openPopup();
    }
    
    // Update marker if exists
    handleStatusChange(tourist);
    
    // Add to emergency list
    addEmergencyAlert(tourist);
}

// Play alert sound
function playAlertSound(type) {
    let sound;
    
    if (type === 'emergency') {
        sound = new Audio('/sounds/emergency-alert.mp3');
    } else if (type === 'warning') {
        sound = new Audio('/sounds/warning-alert.mp3');
    } else {
        sound = new Audio('/sounds/notification.mp3');
    }
    
    sound.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

// Add emergency alert to the list
function addEmergencyAlert(tourist) {
    const alertsContainer = document.getElementById('emergencyAlertsContainer');
    
    if (alertsContainer) {
        const alertElement = document.createElement('div');
        alertElement.className = 'emergency-alert';
        alertElement.innerHTML = `
            <div class="alert-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="alert-content">
                <h4>${tourist.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> Location: ${tourist.location.latitude.toFixed(6)}, ${tourist.location.longitude.toFixed(6)}</p>
                <p><i class="fas fa-clock"></i> Time: ${new Date().toLocaleTimeString()}</p>
            </div>
            <div class="alert-actions">
                <button onclick="locateTourist('${tourist.id}')" class="btn btn-sm btn-primary">Locate</button>
                <button onclick="contactTourist('${tourist.id}')" class="btn btn-sm btn-outline">Contact</button>
            </div>
        `;
        
        // Add to the top of the list
        if (alertsContainer.firstChild) {
            alertsContainer.insertBefore(alertElement, alertsContainer.firstChild);
        } else {
            alertsContainer.appendChild(alertElement);
        }
    }
}

// Select a tourist to display detailed information
function selectTourist(tourist) {
    selectedTourist = tourist;
    
    // Update info panel
    updateSelectedTouristInfo(tourist);
    
    // Show info panel
    const infoPanel = document.getElementById('mapTouristInfo');
    if (infoPanel) {
        infoPanel.classList.remove('hidden');
    }
    
    // Center map on tourist
    map.setView([tourist.location.latitude, tourist.location.longitude], 15);
}

// Update selected tourist info panel
function updateSelectedTouristInfo(tourist) {
    const infoContainer = document.getElementById('selectedTouristInfo');
    
    if (infoContainer) {
        const lastUpdate = new Date(tourist.location.lastUpdate).toLocaleString();
        
        infoContainer.innerHTML = `
            <div class="tourist-info-item">
                <strong>Name:</strong> ${tourist.name}
            </div>
            <div class="tourist-info-item">
                <strong>Email:</strong> ${tourist.email}
            </div>
            <div class="tourist-info-item">
                <strong>Status:</strong> <span class="status-badge ${tourist.status}">${tourist.status}</span>
            </div>
            <div class="tourist-info-item">
                <strong>Safety Score:</strong> ${tourist.safetyScore}
            </div>
            <div class="tourist-info-item">
                <strong>Last Update:</strong> ${lastUpdate}
            </div>
            <div class="tourist-info-item">
                <strong>Location:</strong> ${tourist.location.latitude.toFixed(6)}, ${tourist.location.longitude.toFixed(6)}
            </div>
        `;
    }
}

// Update tourist list in the sidebar
function updateTouristList() {
    const touristListContainer = document.getElementById('touristListContainer');
    
    if (touristListContainer) {
        // Show loading
        touristListContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch tourist data
        fetch('/api/tourists')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    renderTouristList(data.data, touristListContainer);
                } else {
                    touristListContainer.innerHTML = '<p>Failed to load tourist list</p>';
                }
            })
            .catch(error => {
                console.error('Error loading tourist list:', error);
                touristListContainer.innerHTML = '<p>Error loading tourist list</p>';
            });
    }
}

// Render tourist list
function renderTouristList(tourists, container) {
    if (tourists.length === 0) {
        container.innerHTML = '<p>No tourists found</p>';
        return;
    }
    
    // Sort tourists by status (emergency first, then overdue, then others)
    tourists.sort((a, b) => {
        const statusPriority = {
            'sos': 0,
            'emergency': 0,
            'overdue': 1,
            'active': 2,
            'inactive': 3
        };
        
        return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
    });
    
    // Create list HTML
    let html = '<div class="tourist-list">';
    
    tourists.forEach(tourist => {
        const lastUpdate = new Date(tourist.location?.lastUpdate || Date.now()).toLocaleString();
        
        html += `
            <div class="tourist-list-item ${tourist.status}" data-id="${tourist.id}">
                <div class="tourist-list-info">
                    <h4>${tourist.name}</h4>
                    <p><i class="fas fa-map-marker-alt"></i> Last update: ${lastUpdate}</p>
                    <p><i class="fas fa-shield-alt"></i> Safety score: ${tourist.safetyScore}</p>
                </div>
                <div class="tourist-list-status">
                    <span class="status-badge ${tourist.status}">${tourist.status}</span>
                </div>
                <div class="tourist-list-actions">
                    <button onclick="locateTourist('${tourist.id}')" class="btn btn-sm btn-primary">Locate</button>
                    <button onclick="contactTourist('${tourist.id}')" class="btn btn-sm btn-outline">Contact</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add click event to list items
    document.querySelectorAll('.tourist-list-item').forEach(item => {
        item.addEventListener('click', function() {
            const touristId = this.getAttribute('data-id');
            locateTourist(touristId);
        });
    });
}

// Locate a tourist on the map
function locateTourist(touristId) {
    // Fetch tourist data
    fetch(`/api/tourists/${touristId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tourist = data.data;
                
                // Select tourist
                selectTourist(tourist);
                
                // Open popup
                if (touristMarkers[touristId]) {
                    touristMarkers[touristId].openPopup();
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

// Contact a tourist
function contactTourist(touristId) {
    // Fetch tourist data
    fetch(`/api/tourists/${touristId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const tourist = data.data;
                
                // Show contact modal
                showContactModal(tourist);
            } else {
                showNotification('Failed to get tourist contact information', 'error');
            }
        })
        .catch(error => {
            console.error('Error getting tourist contact information:', error);
            showNotification('Error getting tourist contact information: ' + error.message, 'error');
        });
}

// Show contact modal
function showContactModal(tourist) {
    // Create modal HTML
    const modalHtml = `
        <div class="modal-header">
            <h3>Contact ${tourist.name}</h3>
            <button class="close-modal"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="contact-options">
                <button class="btn btn-primary contact-option" data-type="message">
                    <i class="fas fa-comment"></i>
                    <span>Send Message</span>
                </button>
                <button class="btn btn-primary contact-option" data-type="call">
                    <i class="fas fa-phone"></i>
                    <span>Voice Call</span>
                </button>
                <button class="btn btn-primary contact-option" data-type="video">
                    <i class="fas fa-video"></i>
                    <span>Video Call</span>
                </button>
                <button class="btn btn-primary contact-option" data-type="emergency">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Emergency Alert</span>
                </button>
            </div>
            
            <div id="messageForm" class="contact-form hidden">
                <div class="form-group">
                    <label for="messageSubject">Subject</label>
                    <input type="text" id="messageSubject" class="form-control" placeholder="Enter subject">
                </div>
                <div class="form-group">
                    <label for="messageContent">Message</label>
                    <textarea id="messageContent" class="form-control" rows="4" placeholder="Enter your message"></textarea>
                </div>
                <button id="sendMessage" class="btn btn-primary">Send Message</button>
            </div>
            
            <div id="callForm" class="contact-form hidden">
                <p>Initiating voice call to ${tourist.name}...</p>
                <div class="call-status">Connecting...</div>
                <button id="endCall" class="btn btn-danger">End Call</button>
            </div>
            
            <div id="videoForm" class="contact-form hidden">
                <p>Initiating video call to ${tourist.name}...</p>
                <div class="call-status">Connecting...</div>
                <div class="video-container">
                    <div class="video-placeholder">Video stream will appear here</div>
                </div>
                <button id="endVideoCall" class="btn btn-danger">End Call</button>
            </div>
            
            <div id="emergencyForm" class="contact-form hidden">
                <div class="form-group">
                    <label for="emergencyType">Emergency Type</label>
                    <select id="emergencyType" class="form-control">
                        <option value="weather">Weather Alert</option>
                        <option value="security">Security Threat</option>
                        <option value="medical">Medical Emergency</option>
                        <option value="evacuation">Evacuation Order</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="emergencyMessage">Emergency Message</label>
                    <textarea id="emergencyMessage" class="form-control" rows="4" placeholder="Enter emergency details"></textarea>
                </div>
                <button id="sendEmergencyAlert" class="btn btn-danger">Send Emergency Alert</button>
            </div>
        </div>
    `;
    
    // Show modal
    showModal(modalHtml);
    
    // Set up event listeners
    document.querySelectorAll('.contact-option').forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            
            // Hide all forms
            document.querySelectorAll('.contact-form').forEach(form => {
                form.classList.add('hidden');
            });
            
            // Show selected form
            document.getElementById(`${type}Form`).classList.remove('hidden');
        });
    });
    
    // Set up send message
    const sendMessageBtn = document.getElementById('sendMessage');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', function() {
            const subject = document.getElementById('messageSubject').value;
            const content = document.getElementById('messageContent').value;
            
            if (!subject || !content) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            // Send message API call
            fetch(`/api/tourists/${tourist.id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject,
                    content
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Message sent successfully', 'success');
                        closeModal();
                    } else {
                        showNotification('Failed to send message', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    showNotification('Error sending message: ' + error.message, 'error');
                });
        });
    }
    
    // Set up emergency alert
    const sendEmergencyBtn = document.getElementById('sendEmergencyAlert');
    if (sendEmergencyBtn) {
        sendEmergencyBtn.addEventListener('click', function() {
            const type = document.getElementById('emergencyType').value;
            const message = document.getElementById('emergencyMessage').value;
            
            if (!type || !message) {
                showNotification('Please fill in all fields', 'warning');
                return;
            }
            
            // Send emergency alert API call
            fetch(`/api/tourists/${tourist.id}/emergency-alert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    message
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Emergency alert sent successfully', 'success');
                        closeModal();
                    } else {
                        showNotification('Failed to send emergency alert', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error sending emergency alert:', error);
                    showNotification('Error sending emergency alert: ' + error.message, 'error');
                });
        });
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

// Update tourist statistics
function updateTouristStats(tourists) {
    // Update total tourists count
    const totalTouristsElement = document.getElementById('totalTourists');
    if (totalTouristsElement) {
        totalTouristsElement.textContent = tourists.length;
    }
    
    // Update active tourists count
    const activeTouristsElement = document.getElementById('activeTourists');
    if (activeTouristsElement) {
        const activeTourists = tourists.filter(t => t.status === 'active').length;
        activeTouristsElement.textContent = activeTourists;
    }
    
    // Update check-in overdue count
    const checkinOverdueElement = document.getElementById('checkinOverdue');
    if (checkinOverdueElement) {
        const overdueTourists = tourists.filter(t => t.status === 'overdue').length;
        checkinOverdueElement.textContent = overdueTourists;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Map search
    const searchInput = document.getElementById('touristMapSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            // Filter markers based on search term
            Object.keys(touristMarkers).forEach(id => {
                const marker = touristMarkers[id];
                const popup = marker.getPopup();
                const popupContent = popup ? popup.getContent() : '';
                
                // Check if popup content contains search term
                if (popupContent.toLowerCase().includes(searchTerm)) {
                    // Show marker
                    if (!clusterGroup.hasLayer(marker)) {
                        clusterGroup.addLayer(marker);
                    }
                } else {
                    // Hide marker
                    clusterGroup.removeLayer(marker);
                }
            });
        });
    }
    
    // Clear search
    const clearSearchBtn = document.getElementById('clearMapSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            const searchInput = document.getElementById('touristMapSearch');
            if (searchInput) {
                searchInput.value = '';
                
                // Show all markers
                Object.keys(touristMarkers).forEach(id => {
                    const marker = touristMarkers[id];
                    if (!clusterGroup.hasLayer(marker)) {
                        clusterGroup.addLayer(marker);
                    }
                });
            }
        });
    }
    
    // Track tourist button
    const trackTouristBtn = document.getElementById('trackTourist');
    if (trackTouristBtn) {
        trackTouristBtn.addEventListener('click', function() {
            if (selectedTourist) {
                // Toggle tracking class
                this.classList.toggle('tracking');
                
                if (this.classList.contains('tracking')) {
                    // Start tracking
                    this.innerHTML = '<i class="fas fa-eye"></i> Stop Tracking';
                    startTracking(selectedTourist.id);
                } else {
                    // Stop tracking
                    this.innerHTML = '<i class="fas fa-eye"></i> Track';
                    stopTracking();
                }
            }
        });
    }
    
    // Contact tourist button
    const contactTouristBtn = document.getElementById('contactTourist');
    if (contactTouristBtn) {
        contactTouristBtn.addEventListener('click', function() {
            if (selectedTourist) {
                contactTourist(selectedTourist.id);
            }
        });
    }
    
    // Tourist filter
    const touristFilter = document.getElementById('touristFilter');
    if (touristFilter) {
        touristFilter.addEventListener('change', function() {
            const filterValue = this.value;
            
            // Filter markers based on status
            Object.keys(touristMarkers).forEach(id => {
                const marker = touristMarkers[id];
                const popup = marker.getPopup();
                const popupContent = popup ? popup.getContent() : '';
                
                // Check if popup content matches filter
                if (!filterValue || popupContent.toLowerCase().includes(filterValue.toLowerCase())) {
                    // Show marker
                    if (!clusterGroup.hasLayer(marker)) {
                        clusterGroup.addLayer(marker);
                    }
                } else {
                    // Hide marker
                    clusterGroup.removeLayer(marker);
                }
            });
            
            // Update tourist list
            updateTouristList();
        });
    }
}

// Start tracking a tourist
function startTracking(touristId) {
    // Set up tracking interval (every 5 seconds)
    window.trackingInterval = setInterval(() => {
        // Fetch tourist data
        fetch(`/api/tourists/${touristId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const tourist = data.data;
                    
                    // Update selected tourist
                    selectedTourist = tourist;
                    
                    // Update marker
                    if (touristMarkers[touristId]) {
                        // Update position
                        const position = [tourist.location.latitude, tourist.location.longitude];
                        touristMarkers[touristId].setLatLng(position);
                        
                        // Update popup content
                        touristMarkers[touristId].setPopupContent(createTouristPopup(tourist));
                        
                        // Center map on tourist
                        map.setView(position, map.getZoom());
                    }
                    
                    // Update info panel
                    updateSelectedTouristInfo(tourist);
                }
            })
            .catch(error => {
                console.error('Error tracking tourist:', error);
            });
    }, 5000);
}

// Stop tracking
function stopTracking() {
    if (window.trackingInterval) {
        clearInterval(window.trackingInterval);
        window.trackingInterval = null;
    }
}

// Enable anomaly detection
function enableAnomalyDetection() {
    anomalyDetectionEnabled = true;
    showNotification('Anomaly detection enabled', 'info');
}

// Disable anomaly detection
function disableAnomalyDetection() {
    anomalyDetectionEnabled = false;
    showNotification('Anomaly detection disabled', 'info');
}

// Detect anomalies in tourist behavior
function detectAnomalies(tourist) {
    // This is a placeholder for the AI-based anomaly detection
    // In a real implementation, this would use more sophisticated algorithms
    
    // Check for sudden location changes
    if (tourist.previousLocation) {
        const distance = calculateDistance(
            tourist.previousLocation.latitude,
            tourist.previousLocation.longitude,
            tourist.location.latitude,
            tourist.location.longitude
        );
        
        // If distance is more than 5km in a short time (potential teleportation)
        if (distance > 5) {
            reportAnomaly(tourist, 'location_jump', {
                distance,
                previousLocation: tourist.previousLocation,
                currentLocation: tourist.location
            });
        }
    }
    
    // Check for unusual safety score drops
    if (tourist.previousSafetyScore && tourist.safetyScore < tourist.previousSafetyScore - 20) {
        reportAnomaly(tourist, 'safety_score_drop', {
            previousScore: tourist.previousSafetyScore,
            currentScore: tourist.safetyScore
        });
    }
    
    // Check for geofence violations
    if (tourist.status === 'geofence_violation') {
        reportAnomaly(tourist, 'geofence_violation', {
            location: tourist.location
        });
    }
}

// Calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Report anomaly
function reportAnomaly(tourist, type, details) {
    console.log('Anomaly detected:', type, tourist, details);
    
    // Show notification
    showNotification(`Anomaly detected: ${type} for tourist ${tourist.name}`, 'warning');
    
    // Add to anomalies list
    addAnomalyAlert(tourist, type, details);
    
    // Send to server
    fetch('/api/anomalies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            touristId: tourist.id,
            type,
            details
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Anomaly reported:', data);
        })
        .catch(error => {
            console.error('Error reporting anomaly:', error);
        });
}

// Add anomaly alert to the list
function addAnomalyAlert(tourist, type, details) {
    const anomaliesContainer = document.getElementById('anomaliesContainer');
    
    if (anomaliesContainer) {
        const anomalyElement = document.createElement('div');
        anomalyElement.className = 'anomaly-alert';
        
        // Format details based on type
        let detailsHtml = '';
        
        if (type === 'location_jump') {
            detailsHtml = `
                <p><i class="fas fa-map-marker-alt"></i> Unusual movement detected (${details.distance.toFixed(2)} km)</p>
                <p><i class="fas fa-clock"></i> Time: ${new Date().toLocaleTimeString()}</p>
            `;
        } else if (type === 'safety_score_drop') {
            detailsHtml = `
                <p><i class="fas fa-shield-alt"></i> Safety score dropped from ${details.previousScore} to ${details.currentScore}</p>
                <p><i class="fas fa-clock"></i> Time: ${new Date().toLocaleTimeString()}</p>
            `;
        } else if (type === 'geofence_violation') {
            detailsHtml = `
                <p><i class="fas fa-exclamation-triangle"></i> Geofence violation detected</p>
                <p><i class="fas fa-clock"></i> Time: ${new Date().toLocaleTimeString()}</p>
            `;
        } else {
            detailsHtml = `
                <p><i class="fas fa-exclamation-circle"></i> Anomaly type: ${type}</p>
                <p><i class="fas fa-clock"></i> Time: ${new Date().toLocaleTimeString()}</p>
            `;
        }
        
        anomalyElement.innerHTML = `
            <div class="alert-icon"><i class="fas fa-robot"></i></div>
            <div class="alert-content">
                <h4>${tourist.name}</h4>
                ${detailsHtml}
            </div>
            <div class="alert-actions">
                <button onclick="locateTourist('${tourist.id}')" class="btn btn-sm btn-primary">Locate</button>
                <button onclick="dismissAnomaly(this)" class="btn btn-sm btn-outline">Dismiss</button>
            </div>
        `;
        
        // Add to the top of the list
        if (anomaliesContainer.firstChild) {
            anomaliesContainer.insertBefore(anomalyElement, anomaliesContainer.firstChild);
        } else {
            anomaliesContainer.appendChild(anomalyElement);
        }
    }
}

// Dismiss anomaly alert
function dismissAnomaly(button) {
    const alertElement = button.closest('.anomaly-alert');
    if (alertElement) {
        alertElement.remove();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if map container exists
    if (document.getElementById('map')) {
        initTouristTracking();
    }
});
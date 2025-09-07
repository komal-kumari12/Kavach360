/**
 * Geofencing Visualization and Management Interface
 * This module handles the visualization and management of geofences for tourist tracking
 */

// Initialize the geofencing module
document.addEventListener('DOMContentLoaded', function() {
    initGeofencingModule();
});

/**
 * Initialize the geofencing module
 */
function initGeofencingModule() {
    // Initialize map
    initMap();
    
    // Load geofences
    loadGeofences();
    
    // Initialize form handlers
    initFormHandlers();
    
    // Initialize geofence controls
    initGeofenceControls();
    
    // Initialize real-time updates
    initRealTimeUpdates();
}

// Global variables
let map;
let drawingManager;
let selectedGeofence = null;
let geofences = [];
let tourists = [];

/**
 * Initialize the map
 */
function initMap() {
    // Get map container
    const mapContainer = document.getElementById('geofenceMap');
    if (!mapContainer) return;
    
    // Initialize map
    map = L.map(mapContainer).setView([28.6139, 77.2090], 12); // Default to New Delhi
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Initialize drawing controls
    initDrawingControls();
    
    // Add scale control
    L.control.scale().addTo(map);
    
    // Add location control
    L.control.locate({
        position: 'topleft',
        strings: {
            title: 'Show my location'
        },
        locateOptions: {
            enableHighAccuracy: true
        }
    }).addTo(map);
}

/**
 * Initialize drawing controls
 */
function initDrawingControls() {
    // Add Leaflet.draw plugin controls
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polyline: false,
            circle: {
                shapeOptions: {
                    color: '#3388ff',
                    fillOpacity: 0.2
                },
                showRadius: true,
                metric: true
            },
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Error:</strong> Geofence edges cannot cross!'
                },
                shapeOptions: {
                    color: '#3388ff',
                    fillOpacity: 0.2
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#3388ff',
                    fillOpacity: 0.2
                }
            },
            marker: false,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    
    map.addControl(drawControl);
    
    // Handle draw events
    map.on(L.Draw.Event.CREATED, function(event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        // Open form to create new geofence
        openGeofenceForm(layer);
    });
    
    map.on(L.Draw.Event.EDITED, function(event) {
        const layers = event.layers;
        layers.eachLayer(function(layer) {
            // Update geofence in database
            if (layer.geofenceId) {
                updateGeofenceGeometry(layer.geofenceId, layer);
            }
        });
    });
    
    map.on(L.Draw.Event.DELETED, function(event) {
        const layers = event.layers;
        layers.eachLayer(function(layer) {
            // Delete geofence from database
            if (layer.geofenceId) {
                deleteGeofence(layer.geofenceId);
            }
        });
    });
    
    // Store reference for later use
    drawingManager = {
        drawnItems: drawnItems,
        drawControl: drawControl
    };
}

/**
 * Load geofences from the server
 */
async function loadGeofences() {
    try {
        const response = await fetch('/api/geofence');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                geofences = data.data;
                displayGeofences(geofences);
            } else {
                showNotification('Failed to load geofences', 'error');
            }
        } else {
            throw new Error('Failed to fetch geofences');
        }
    } catch (error) {
        console.error('Error loading geofences:', error);
        showNotification('Error loading geofences', 'error');
    }
}

/**
 * Display geofences on the map
 * @param {Array} geofences - Array of geofence objects
 */
function displayGeofences(geofences) {
    // Clear existing geofences
    drawingManager.drawnItems.clearLayers();
    
    // Add geofences to map
    geofences.forEach(geofence => {
        let layer;
        
        // Create layer based on geofence type
        switch (geofence.type) {
            case 'circle':
                layer = L.circle(
                    [geofence.geometry.coordinates[1], geofence.geometry.coordinates[0]],
                    {
                        radius: geofence.radius,
                        color: geofence.color || '#3388ff',
                        fillColor: geofence.fillColor || '#3388ff',
                        fillOpacity: geofence.fillOpacity || 0.2,
                        weight: 3
                    }
                );
                break;
                
            case 'polygon':
                const coordinates = geofence.geometry.coordinates[0].map(coord => [
                    coord[1], coord[0]
                ]);
                layer = L.polygon(coordinates, {
                    color: geofence.color || '#3388ff',
                    fillColor: geofence.fillColor || '#3388ff',
                    fillOpacity: geofence.fillOpacity || 0.2,
                    weight: 3
                });
                break;
                
            case 'rectangle':
                const bounds = [
                    [geofence.geometry.coordinates[0][0][1], geofence.geometry.coordinates[0][0][0]],
                    [geofence.geometry.coordinates[0][2][1], geofence.geometry.coordinates[0][2][0]]
                ];
                layer = L.rectangle(bounds, {
                    color: geofence.color || '#3388ff',
                    fillColor: geofence.fillColor || '#3388ff',
                    fillOpacity: geofence.fillOpacity || 0.2,
                    weight: 3
                });
                break;
                
            default:
                console.warn('Unknown geofence type:', geofence.type);
                return;
        }
        
        // Add geofence ID to layer
        layer.geofenceId = geofence._id;
        
        // Add popup with geofence info
        layer.bindPopup(createGeofencePopup(geofence));
        
        // Add click handler
        layer.on('click', function() {
            selectGeofence(geofence, layer);
        });
        
        // Add layer to map
        drawingManager.drawnItems.addLayer(layer);
    });
    
    // Update geofence list
    updateGeofenceList(geofences);
    
    // Fit map to geofences if any exist
    if (geofences.length > 0) {
        const bounds = drawingManager.drawnItems.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds);
        }
    }
}

/**
 * Create a popup for a geofence
 * @param {Object} geofence - Geofence object
 * @returns {HTMLElement} Popup content
 */
function createGeofencePopup(geofence) {
    const container = document.createElement('div');
    container.className = 'geofence-popup';
    
    const title = document.createElement('h4');
    title.textContent = geofence.name;
    container.appendChild(title);
    
    const type = document.createElement('p');
    type.innerHTML = `<strong>Type:</strong> ${capitalizeFirstLetter(geofence.type)}`;
    container.appendChild(type);
    
    const description = document.createElement('p');
    description.innerHTML = `<strong>Description:</strong> ${geofence.description || 'No description'}`;
    container.appendChild(description);
    
    const status = document.createElement('p');
    status.innerHTML = `<strong>Status:</strong> <span class="status-badge status-${geofence.status.toLowerCase()}">${capitalizeFirstLetter(geofence.status)}</span>`;
    container.appendChild(status);
    
    const touristCount = document.createElement('p');
    touristCount.innerHTML = `<strong>Tourists inside:</strong> <span class="tourist-count" data-geofence-id="${geofence._id}">Loading...</span>`;
    container.appendChild(touristCount);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'popup-buttons';
    
    const editButton = document.createElement('button');
    editButton.className = 'btn-popup btn-edit';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', function() {
        selectGeofence(geofence);
        openGeofenceForm(null, geofence);
    });
    buttonContainer.appendChild(editButton);
    
    const viewButton = document.createElement('button');
    viewButton.className = 'btn-popup btn-view';
    viewButton.textContent = 'View Details';
    viewButton.addEventListener('click', function() {
        selectGeofence(geofence);
        showGeofenceDetails(geofence);
    });
    buttonContainer.appendChild(viewButton);
    
    container.appendChild(buttonContainer);
    
    return container;
}

/**
 * Update the geofence list in the sidebar
 * @param {Array} geofences - Array of geofence objects
 */
function updateGeofenceList(geofences) {
    const geofenceList = document.getElementById('geofenceList');
    if (!geofenceList) return;
    
    // Clear existing list
    geofenceList.innerHTML = '';
    
    // Add geofences to list
    if (geofences.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-list-message';
        emptyMessage.textContent = 'No geofences found. Create one by using the drawing tools.';
        geofenceList.appendChild(emptyMessage);
        return;
    }
    
    geofences.forEach(geofence => {
        const listItem = document.createElement('div');
        listItem.className = 'geofence-list-item';
        listItem.setAttribute('data-geofence-id', geofence._id);
        
        // Add active class if this is the selected geofence
        if (selectedGeofence && selectedGeofence._id === geofence._id) {
            listItem.classList.add('active');
        }
        
        listItem.innerHTML = `
            <div class="geofence-color" style="background-color: ${geofence.color || '#3388ff'}"></div>
            <div class="geofence-info">
                <div class="geofence-name">${geofence.name}</div>
                <div class="geofence-meta">
                    <span class="geofence-type">${capitalizeFirstLetter(geofence.type)}</span>
                    <span class="status-badge status-${geofence.status.toLowerCase()}">${capitalizeFirstLetter(geofence.status)}</span>
                </div>
            </div>
        `;
        
        // Add click handler
        listItem.addEventListener('click', function() {
            // Find the layer for this geofence
            let targetLayer = null;
            drawingManager.drawnItems.eachLayer(layer => {
                if (layer.geofenceId === geofence._id) {
                    targetLayer = layer;
                }
            });
            
            selectGeofence(geofence, targetLayer);
            
            // Pan to geofence
            if (targetLayer) {
                map.fitBounds(targetLayer.getBounds ? targetLayer.getBounds() : targetLayer.getLatLng().toBounds(targetLayer.getRadius()));
            }
        });
        
        geofenceList.appendChild(listItem);
    });
}

/**
 * Select a geofence
 * @param {Object} geofence - Geofence object
 * @param {L.Layer} layer - Leaflet layer for the geofence
 */
function selectGeofence(geofence, layer) {
    // Update selected geofence
    selectedGeofence = geofence;
    
    // Update UI
    const listItems = document.querySelectorAll('.geofence-list-item');
    listItems.forEach(item => {
        if (item.getAttribute('data-geofence-id') === geofence._id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update details panel
    showGeofenceDetails(geofence);
    
    // Highlight layer if provided
    if (layer) {
        // Reset styles for all layers
        drawingManager.drawnItems.eachLayer(l => {
            if (l.setStyle) {
                l.setStyle({
                    weight: 3,
                    dashArray: null
                });
            }
        });
        
        // Highlight selected layer
        if (layer.setStyle) {
            layer.setStyle({
                weight: 5,
                dashArray: '5, 10'
            });
        }
        
        // Open popup
        layer.openPopup();
    }
}

/**
 * Show geofence details in the details panel
 * @param {Object} geofence - Geofence object
 */
function showGeofenceDetails(geofence) {
    const detailsPanel = document.getElementById('geofenceDetails');
    if (!detailsPanel) return;
    
    // Show the panel
    detailsPanel.style.display = 'block';
    
    // Update details
    detailsPanel.innerHTML = `
        <div class="details-header">
            <h3>${geofence.name}</h3>
            <div class="details-actions">
                <button class="btn-icon" id="editGeofence" title="Edit Geofence">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" id="deleteGeofence" title="Delete Geofence">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="btn-icon" id="closeDetails" title="Close Details">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        
        <div class="details-content">
            <div class="details-section">
                <h4>Basic Information</h4>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-label">Type</div>
                        <div class="details-value">${capitalizeFirstLetter(geofence.type)}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-label">Status</div>
                        <div class="details-value">
                            <span class="status-badge status-${geofence.status.toLowerCase()}">${capitalizeFirstLetter(geofence.status)}</span>
                        </div>
                    </div>
                    <div class="details-item full-width">
                        <div class="details-label">Description</div>
                        <div class="details-value">${geofence.description || 'No description'}</div>
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h4>Geofence Properties</h4>
                <div class="details-grid">
                    ${geofence.type === 'circle' ? `
                        <div class="details-item">
                            <div class="details-label">Center</div>
                            <div class="details-value">${geofence.geometry.coordinates[1].toFixed(6)}, ${geofence.geometry.coordinates[0].toFixed(6)}</div>
                        </div>
                        <div class="details-item">
                            <div class="details-label">Radius</div>
                            <div class="details-value">${geofence.radius} meters</div>
                        </div>
                    ` : ''}
                    ${geofence.type === 'polygon' ? `
                        <div class="details-item">
                            <div class="details-label">Vertices</div>
                            <div class="details-value">${geofence.geometry.coordinates[0].length - 1}</div>
                        </div>
                        <div class="details-item">
                            <div class="details-label">Area</div>
                            <div class="details-value" id="geofenceArea">Calculating...</div>
                        </div>
                    ` : ''}
                    ${geofence.type === 'rectangle' ? `
                        <div class="details-item">
                            <div class="details-label">Bounds</div>
                            <div class="details-value">
                                NE: ${geofence.geometry.coordinates[0][2][1].toFixed(6)}, ${geofence.geometry.coordinates[0][2][0].toFixed(6)}<br>
                                SW: ${geofence.geometry.coordinates[0][0][1].toFixed(6)}, ${geofence.geometry.coordinates[0][0][0].toFixed(6)}
                            </div>
                        </div>
                        <div class="details-item">
                            <div class="details-label">Area</div>
                            <div class="details-value" id="geofenceArea">Calculating...</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="details-section">
                <div class="details-header-with-actions">
                    <h4>Tourists Inside</h4>
                    <button class="btn-sm" id="refreshTourists">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div id="touristsInGeofence" class="tourists-list">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Loading tourists...
                    </div>
                </div>
            </div>
            
            <div class="details-section">
                <h4>Alerts & Notifications</h4>
                <div class="form-group">
                    <label class="toggle-switch">
                        <input type="checkbox" id="alertsEnabled" ${geofence.alertsEnabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span class="toggle-label">Enable Alerts</span>
                    </label>
                </div>
                <div class="alert-options ${geofence.alertsEnabled ? '' : 'disabled'}" id="alertOptions">
                    <div class="form-group">
                        <label for="alertType">Alert Type</label>
                        <select id="alertType">
                            <option value="entry" ${geofence.alertType === 'entry' ? 'selected' : ''}>Entry Alert</option>
                            <option value="exit" ${geofence.alertType === 'exit' ? 'selected' : ''}>Exit Alert</option>
                            <option value="both" ${geofence.alertType === 'both' ? 'selected' : ''}>Both Entry & Exit</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="alertMessage">Alert Message</label>
                        <textarea id="alertMessage">${geofence.alertMessage || ''}</textarea>
                    </div>
                    <button class="btn btn-primary" id="saveAlertSettings">
                        <i class="fas fa-save"></i> Save Alert Settings
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Calculate area for polygon and rectangle
    if (geofence.type === 'polygon' || geofence.type === 'rectangle') {
        calculateGeofenceArea(geofence);
    }
    
    // Load tourists in geofence
    loadTouristsInGeofence(geofence._id);
    
    // Add event listeners
    document.getElementById('editGeofence').addEventListener('click', function() {
        openGeofenceForm(null, geofence);
    });
    
    document.getElementById('deleteGeofence').addEventListener('click', function() {
        confirmDeleteGeofence(geofence._id);
    });
    
    document.getElementById('closeDetails').addEventListener('click', function() {
        detailsPanel.style.display = 'none';
        selectedGeofence = null;
        
        // Reset active state in list
        const listItems = document.querySelectorAll('.geofence-list-item');
        listItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Reset layer styles
        drawingManager.drawnItems.eachLayer(layer => {
            if (layer.setStyle) {
                layer.setStyle({
                    weight: 3,
                    dashArray: null
                });
            }
        });
    });
    
    document.getElementById('refreshTourists').addEventListener('click', function() {
        loadTouristsInGeofence(geofence._id);
    });
    
    const alertsEnabledCheckbox = document.getElementById('alertsEnabled');
    const alertOptions = document.getElementById('alertOptions');
    
    alertsEnabledCheckbox.addEventListener('change', function() {
        if (this.checked) {
            alertOptions.classList.remove('disabled');
        } else {
            alertOptions.classList.add('disabled');
        }
        
        // Update geofence alerts enabled status
        updateGeofenceAlertSettings(geofence._id, {
            alertsEnabled: this.checked
        });
    });
    
    document.getElementById('saveAlertSettings').addEventListener('click', function() {
        const alertType = document.getElementById('alertType').value;
        const alertMessage = document.getElementById('alertMessage').value;
        
        updateGeofenceAlertSettings(geofence._id, {
            alertsEnabled: alertsEnabledCheckbox.checked,
            alertType: alertType,
            alertMessage: alertMessage
        });
    });
}

/**
 * Calculate the area of a geofence
 * @param {Object} geofence - Geofence object
 */
function calculateGeofenceArea(geofence) {
    const areaElement = document.getElementById('geofenceArea');
    if (!areaElement) return;
    
    let area = 0;
    let layer;
    
    if (geofence.type === 'polygon') {
        const coordinates = geofence.geometry.coordinates[0].map(coord => [
            coord[1], coord[0]
        ]);
        layer = L.polygon(coordinates);
        area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    } else if (geofence.type === 'rectangle') {
        const bounds = [
            [geofence.geometry.coordinates[0][0][1], geofence.geometry.coordinates[0][0][0]],
            [geofence.geometry.coordinates[0][2][1], geofence.geometry.coordinates[0][2][0]]
        ];
        layer = L.rectangle(bounds);
        area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
    }
    
    // Format area
    let formattedArea;
    if (area < 10000) {
        formattedArea = `${Math.round(area)} sq m`;
    } else {
        formattedArea = `${(area / 1000000).toFixed(2)} sq km`;
    }
    
    areaElement.textContent = formattedArea;
}

/**
 * Load tourists in a geofence
 * @param {string} geofenceId - Geofence ID
 */
async function loadTouristsInGeofence(geofenceId) {
    const touristsContainer = document.getElementById('touristsInGeofence');
    const countElements = document.querySelectorAll(`.tourist-count[data-geofence-id="${geofenceId}"]`);
    
    if (!touristsContainer) return;
    
    touristsContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i> Loading tourists...
        </div>
    `;
    
    try {
        const response = await fetch(`/api/geofence/${geofenceId}/tourists`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const tourists = data.data;
                
                // Update count in popups
                countElements.forEach(element => {
                    element.textContent = tourists.length;
                });
                
                // Display tourists
                if (tourists.length === 0) {
                    touristsContainer.innerHTML = `
                        <div class="empty-list-message">
                            No tourists currently inside this geofence.
                        </div>
                    `;
                    return;
                }
                
                touristsContainer.innerHTML = '';
                tourists.forEach(tourist => {
                    const touristItem = document.createElement('div');
                    touristItem.className = 'tourist-list-item';
                    touristItem.innerHTML = `
                        <div class="tourist-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="tourist-info">
                            <div class="tourist-name">${tourist.name}</div>
                            <div class="tourist-meta">
                                <span class="tourist-id">${tourist.digitalId}</span>
                                <span class="tourist-nationality">${tourist.nationality}</span>
                            </div>
                        </div>
                        <div class="tourist-actions">
                            <button class="btn-icon btn-sm" title="View Tourist Details" data-tourist-id="${tourist._id}">
                                <i class="fas fa-info-circle"></i>
                            </button>
                        </div>
                    `;
                    
                    // Add click handler for tourist details
                    const viewButton = touristItem.querySelector('.tourist-actions button');
                    viewButton.addEventListener('click', function() {
                        window.location.href = `/tourist-details.html?id=${tourist._id}`;
                    });
                    
                    touristsContainer.appendChild(touristItem);
                });
            } else {
                throw new Error(data.message || 'Failed to load tourists');
            }
        } else {
            throw new Error('Failed to fetch tourists');
        }
    } catch (error) {
        console.error('Error loading tourists:', error);
        touristsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i> Error loading tourists: ${error.message}
            </div>
        `;
        
        // Update count in popups
        countElements.forEach(element => {
            element.textContent = 'Error';
        });
    }
}

/**
 * Open the geofence form
 * @param {L.Layer} layer - Leaflet layer for new geofence
 * @param {Object} geofence - Existing geofence for editing
 */
function openGeofenceForm(layer, geofence) {
    const formContainer = document.getElementById('geofenceFormContainer');
    if (!formContainer) return;
    
    // Show the form
    formContainer.style.display = 'block';
    
    // Determine if we're creating or editing
    const isEditing = !!geofence;
    
    // Set form title
    const formTitle = document.getElementById('geofenceFormTitle');
    if (formTitle) {
        formTitle.textContent = isEditing ? 'Edit Geofence' : 'Create New Geofence';
    }
    
    // Get form elements
    const nameInput = document.getElementById('geofenceName');
    const typeInput = document.getElementById('geofenceType');
    const descriptionInput = document.getElementById('geofenceDescription');
    const statusInput = document.getElementById('geofenceStatus');
    const colorInput = document.getElementById('geofenceColor');
    const radiusInput = document.getElementById('geofenceRadius');
    const radiusContainer = document.getElementById('radiusContainer');
    
    // Set form values for editing
    if (isEditing) {
        nameInput.value = geofence.name;
        typeInput.value = geofence.type;
        descriptionInput.value = geofence.description || '';
        statusInput.value = geofence.status;
        colorInput.value = geofence.color || '#3388ff';
        
        // Show/hide radius input based on type
        if (geofence.type === 'circle') {
            radiusContainer.style.display = 'block';
            radiusInput.value = geofence.radius;
        } else {
            radiusContainer.style.display = 'none';
        }
        
        // Disable type input for editing
        typeInput.disabled = true;
    } else {
        // Reset form for new geofence
        nameInput.value = '';
        descriptionInput.value = '';
        statusInput.value = 'active';
        colorInput.value = '#3388ff';
        
        // Set type based on drawn layer
        if (layer instanceof L.Circle) {
            typeInput.value = 'circle';
            radiusContainer.style.display = 'block';
            radiusInput.value = layer.getRadius();
        } else if (layer instanceof L.Polygon) {
            if (layer instanceof L.Rectangle) {
                typeInput.value = 'rectangle';
            } else {
                typeInput.value = 'polygon';
            }
            radiusContainer.style.display = 'none';
        }
        
        // Enable type input for new geofence
        typeInput.disabled = false;
    }
    
    // Add event listener for type change
    typeInput.addEventListener('change', function() {
        if (this.value === 'circle') {
            radiusContainer.style.display = 'block';
        } else {
            radiusContainer.style.display = 'none';
        }
    });
    
    // Add event listener for form submission
    const form = document.getElementById('geofenceForm');
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!nameInput.value) {
            showNotification('Please enter a name for the geofence', 'error');
            return;
        }
        
        if (typeInput.value === 'circle' && (!radiusInput.value || radiusInput.value <= 0)) {
            showNotification('Please enter a valid radius for the circle', 'error');
            return;
        }
        
        // Prepare geofence data
        const geofenceData = {
            name: nameInput.value,
            type: typeInput.value,
            description: descriptionInput.value,
            status: statusInput.value,
            color: colorInput.value
        };
        
        // Add geometry based on type
        if (typeInput.value === 'circle') {
            geofenceData.radius = parseFloat(radiusInput.value);
            
            if (isEditing) {
                geofenceData.geometry = geofence.geometry;
            } else {
                const center = layer.getLatLng();
                geofenceData.geometry = {
                    type: 'Point',
                    coordinates: [center.lng, center.lat]
                };
            }
        } else {
            if (isEditing) {
                geofenceData.geometry = geofence.geometry;
            } else {
                let coordinates;
                
                if (typeInput.value === 'polygon') {
                    coordinates = layer.getLatLngs()[0].map(latLng => [
                        latLng.lng, latLng.lat
                    ]);
                    
                    // Close the polygon
                    if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
                        coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
                        coordinates.push(coordinates[0]);
                    }
                    
                    geofenceData.geometry = {
                        type: 'Polygon',
                        coordinates: [coordinates]
                    };
                } else if (typeInput.value === 'rectangle') {
                    const bounds = layer.getBounds();
                    const nw = bounds.getNorthWest();
                    const ne = bounds.getNorthEast();
                    const se = bounds.getSouthEast();
                    const sw = bounds.getSouthWest();
                    
                    coordinates = [
                        [sw.lng, sw.lat],
                        [nw.lng, nw.lat],
                        [ne.lng, ne.lat],
                        [se.lng, se.lat],
                        [sw.lng, sw.lat] // Close the polygon
                    ];
                    
                    geofenceData.geometry = {
                        type: 'Polygon',
                        coordinates: [coordinates]
                    };
                }
            }
        }
        
        try {
            let response;
            
            if (isEditing) {
                // Update existing geofence
                response = await fetch(`/api/geofence/${geofence._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(geofenceData)
                });
            } else {
                // Create new geofence
                response = await fetch('/api/geofence', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(geofenceData)
                });
            }
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showNotification(
                        isEditing ? 'Geofence updated successfully' : 'Geofence created successfully',
                        'success'
                    );
                    
                    // Close the form
                    closeGeofenceForm();
                    
                    // Reload geofences
                    loadGeofences();
                } else {
                    throw new Error(result.message || 'Operation failed');
                }
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error saving geofence:', error);
            showNotification(`Error: ${error.message}`, 'error');
        }
    };
    
    // Add event listener for cancel button
    const cancelButton = document.getElementById('cancelGeofence');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            closeGeofenceForm();
            
            // Remove the drawn layer if creating new geofence
            if (!isEditing && layer) {
                drawingManager.drawnItems.removeLayer(layer);
            }
        });
    }
}

/**
 * Close the geofence form
 */
function closeGeofenceForm() {
    const formContainer = document.getElementById('geofenceFormContainer');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

/**
 * Update geofence geometry
 * @param {string} geofenceId - Geofence ID
 * @param {L.Layer} layer - Leaflet layer with updated geometry
 */
async function updateGeofenceGeometry(geofenceId, layer) {
    try {
        // Prepare geometry data
        let geometryData;
        let radius;
        
        if (layer instanceof L.Circle) {
            const center = layer.getLatLng();
            geometryData = {
                type: 'Point',
                coordinates: [center.lng, center.lat]
            };
            radius = layer.getRadius();
        } else if (layer instanceof L.Polygon) {
            let coordinates;
            
            if (layer instanceof L.Rectangle) {
                const bounds = layer.getBounds();
                const nw = bounds.getNorthWest();
                const ne = bounds.getNorthEast();
                const se = bounds.getSouthEast();
                const sw = bounds.getSouthWest();
                
                coordinates = [
                    [sw.lng, sw.lat],
                    [nw.lng, nw.lat],
                    [ne.lng, ne.lat],
                    [se.lng, se.lat],
                    [sw.lng, sw.lat] // Close the polygon
                ];
            } else {
                coordinates = layer.getLatLngs()[0].map(latLng => [
                    latLng.lng, latLng.lat
                ]);
                
                // Close the polygon
                if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
                    coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
                    coordinates.push(coordinates[0]);
                }
            }
            
            geometryData = {
                type: 'Polygon',
                coordinates: [coordinates]
            };
        }
        
        // Update geofence
        const response = await fetch(`/api/geofence/${geofenceId}/geometry`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                geometry: geometryData,
                radius: radius
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Geofence geometry updated successfully', 'success');
                
                // Reload geofences to get updated data
                loadGeofences();
            } else {
                throw new Error(result.message || 'Failed to update geometry');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error updating geofence geometry:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Update geofence alert settings
 * @param {string} geofenceId - Geofence ID
 * @param {Object} settings - Alert settings
 */
async function updateGeofenceAlertSettings(geofenceId, settings) {
    try {
        const response = await fetch(`/api/geofence/${geofenceId}/alerts`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Alert settings updated successfully', 'success');
                
                // Update local geofence data
                if (selectedGeofence && selectedGeofence._id === geofenceId) {
                    selectedGeofence = {
                        ...selectedGeofence,
                        ...settings
                    };
                }
                
                // Update geofence in the list
                const index = geofences.findIndex(g => g._id === geofenceId);
                if (index !== -1) {
                    geofences[index] = {
                        ...geofences[index],
                        ...settings
                    };
                }
            } else {
                throw new Error(result.message || 'Failed to update alert settings');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error updating alert settings:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Confirm deletion of a geofence
 * @param {string} geofenceId - Geofence ID
 */
function confirmDeleteGeofence(geofenceId) {
    if (confirm('Are you sure you want to delete this geofence? This action cannot be undone.')) {
        deleteGeofence(geofenceId);
    }
}

/**
 * Delete a geofence
 * @param {string} geofenceId - Geofence ID
 */
async function deleteGeofence(geofenceId) {
    try {
        const response = await fetch(`/api/geofence/${geofenceId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('Geofence deleted successfully', 'success');
                
                // Close details panel if showing the deleted geofence
                if (selectedGeofence && selectedGeofence._id === geofenceId) {
                    const detailsPanel = document.getElementById('geofenceDetails');
                    if (detailsPanel) {
                        detailsPanel.style.display = 'none';
                    }
                    selectedGeofence = null;
                }
                
                // Reload geofences
                loadGeofences();
            } else {
                throw new Error(result.message || 'Failed to delete geofence');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error deleting geofence:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Initialize form handlers
 */
function initFormHandlers() {
    // Add event listener for new geofence button
    const newGeofenceBtn = document.getElementById('newGeofence');
    if (newGeofenceBtn) {
        newGeofenceBtn.addEventListener('click', function() {
            // Show drawing controls message
            showNotification('Use the drawing tools on the right side of the map to create a new geofence', 'info');
        });
    }
    
    // Add event listener for filter form
    const filterForm = document.getElementById('geofenceFilterForm');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterGeofences();
        });
    }
    
    // Add event listener for reset filter button
    const resetFilterBtn = document.getElementById('resetFilter');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            document.getElementById('filterName').value = '';
            document.getElementById('filterType').value = '';
            document.getElementById('filterStatus').value = '';
            
            filterGeofences();
        });
    }
}

/**
 * Filter geofences based on form values
 */
function filterGeofences() {
    const nameFilter = document.getElementById('filterName').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    // Apply filters
    const filteredGeofences = geofences.filter(geofence => {
        // Filter by name
        if (nameFilter && !geofence.name.toLowerCase().includes(nameFilter)) {
            return false;
        }
        
        // Filter by type
        if (typeFilter && geofence.type !== typeFilter) {
            return false;
        }
        
        // Filter by status
        if (statusFilter && geofence.status !== statusFilter) {
            return false;
        }
        
        return true;
    });
    
    // Update UI with filtered geofences
    updateGeofenceList(filteredGeofences);
    
    // Update map to show only filtered geofences
    drawingManager.drawnItems.eachLayer(layer => {
        const geofenceId = layer.geofenceId;
        const isVisible = filteredGeofences.some(g => g._id === geofenceId);
        
        if (isVisible) {
            layer.setStyle({
                opacity: 1,
                fillOpacity: 0.2
            });
        } else {
            layer.setStyle({
                opacity: 0.3,
                fillOpacity: 0.05
            });
        }
    });
}

/**
 * Initialize geofence controls
 */
function initGeofenceControls() {
    // Add event listener for toggle sidebar button
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            
            // Update button icon
            const icon = toggleSidebarBtn.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-right';
            } else {
                icon.className = 'fas fa-chevron-left';
            }
            
            // Trigger map resize to update the view
            setTimeout(() => {
                map.invalidateSize();
            }, 300);
        });
    }
    
    // Add event listener for toggle tourists button
    const toggleTouristsBtn = document.getElementById('toggleTourists');
    if (toggleTouristsBtn) {
        toggleTouristsBtn.addEventListener('click', function() {
            const isActive = this.classList.toggle('active');
            
            if (isActive) {
                loadAndDisplayTourists();
                this.querySelector('span').textContent = 'Hide Tourists';
            } else {
                removeTouristsFromMap();
                this.querySelector('span').textContent = 'Show Tourists';
            }
        });
    }
}

/**
 * Initialize real-time updates
 */
function initRealTimeUpdates() {
    // Connect to Socket.IO for real-time updates
    const socket = io();
    
    // Listen for tourist location updates
    socket.on('touristLocationUpdate', function(data) {
        updateTouristLocation(data);
    });
    
    // Listen for geofence updates
    socket.on('geofenceUpdate', function(data) {
        // Reload geofences when changes occur
        loadGeofences();
    });
    
    // Listen for geofence alerts
    socket.on('geofenceAlert', function(data) {
        showGeofenceAlert(data);
    });
}

/**
 * Load and display tourists on the map
 */
async function loadAndDisplayTourists() {
    try {
        const response = await fetch('/api/tourists/locations');
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                tourists = data.data;
                displayTouristsOnMap(tourists);
            } else {
                throw new Error(data.message || 'Failed to load tourist locations');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error loading tourist locations:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
}

/**
 * Display tourists on the map
 * @param {Array} tourists - Array of tourist objects with location data
 */
function displayTouristsOnMap(tourists) {
    // Create a feature group for tourists if it doesn't exist
    if (!map.touristLayer) {
        map.touristLayer = L.featureGroup().addTo(map);
    } else {
        map.touristLayer.clearLayers();
    }
    
    // Add tourists to map
    tourists.forEach(tourist => {
        if (tourist.lastKnownLocation && 
            tourist.lastKnownLocation.coordinates && 
            tourist.lastKnownLocation.coordinates.length === 2) {
            
            const marker = L.marker(
                [tourist.lastKnownLocation.coordinates[1], tourist.lastKnownLocation.coordinates[0]],
                {
                    icon: L.divIcon({
                        className: 'tourist-marker',
                        html: `<div class="tourist-marker-icon"><i class="fas fa-user"></i></div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    })
                }
            );
            
            // Add popup with tourist info
            marker.bindPopup(createTouristPopup(tourist));
            
            // Add to layer
            map.touristLayer.addLayer(marker);
            
            // Store reference to marker
            tourist.marker = marker;
        }
    });
}

/**
 * Create a popup for a tourist
 * @param {Object} tourist - Tourist object
 * @returns {HTMLElement} Popup content
 */
function createTouristPopup(tourist) {
    const container = document.createElement('div');
    container.className = 'tourist-popup';
    
    const name = document.createElement('h4');
    name.textContent = tourist.name;
    container.appendChild(name);
    
    const details = document.createElement('div');
    details.className = 'tourist-popup-details';
    details.innerHTML = `
        <p><strong>Digital ID:</strong> ${tourist.digitalId}</p>
        <p><strong>Nationality:</strong> ${tourist.nationality}</p>
        <p><strong>Last Updated:</strong> ${new Date(tourist.lastKnownLocation.timestamp).toLocaleString()}</p>
    `;
    container.appendChild(details);
    
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-primary';
    button.textContent = 'View Details';
    button.addEventListener('click', function() {
        window.location.href = `/tourist-details.html?id=${tourist._id}`;
    });
    container.appendChild(button);
    
    return container;
}

/**
 * Remove tourists from the map
 */
function removeTouristsFromMap() {
    if (map.touristLayer) {
        map.touristLayer.clearLayers();
    }
}

/**
 * Update tourist location on the map
 * @param {Object} data - Tourist location update data
 */
function updateTouristLocation(data) {
    // Find tourist in the list
    const touristIndex = tourists.findIndex(t => t._id === data.touristId);
    
    if (touristIndex !== -1) {
        // Update tourist data
        tourists[touristIndex].lastKnownLocation = data.location;
        
        // Update marker if it exists and tourists are being displayed
        if (map.touristLayer && tourists[touristIndex].marker) {
            const marker = tourists[touristIndex].marker;
            marker.setLatLng([data.location.coordinates[1], data.location.coordinates[0]]);
            
            // Update popup content
            marker.setPopupContent(createTouristPopup(tourists[touristIndex]));
            
            // Highlight the marker briefly
            const icon = marker.getElement();
            if (icon) {
                icon.classList.add('marker-updated');
                setTimeout(() => {
                    icon.classList.remove('marker-updated');
                }, 2000);
            }
        }
        
        // Reload tourists in geofence if details panel is open
        if (selectedGeofence) {
            loadTouristsInGeofence(selectedGeofence._id);
        }
    } else {
        // Tourist not in list, reload all tourists
        if (map.touristLayer) {
            loadAndDisplayTourists();
        }
    }
}

/**
 * Show a geofence alert
 * @param {Object} data - Geofence alert data
 */
function showGeofenceAlert(data) {
    // Create alert notification
    const notification = document.createElement('div');
    notification.className = `geofence-alert ${data.type === 'entry' ? 'alert-entry' : 'alert-exit'}`;
    
    notification.innerHTML = `
        <div class="alert-icon">
            <i class="fas ${data.type === 'entry' ? 'fa-sign-in-alt' : 'fa-sign-out-alt'}"></i>
        </div>
        <div class="alert-content">
            <div class="alert-title">
                ${data.type === 'entry' ? 'Geofence Entry' : 'Geofence Exit'}
            </div>
            <div class="alert-message">
                ${data.touristName} has ${data.type === 'entry' ? 'entered' : 'exited'} the "${data.geofenceName}" geofence.
            </div>
            <div class="alert-time">
                ${new Date().toLocaleTimeString()}
            </div>
        </div>
        <button class="alert-close">&times;</button>
    `;
    
    // Add to alerts container
    const alertsContainer = document.getElementById('alertsContainer');
    if (alertsContainer) {
        alertsContainer.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.alert-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                notification.remove();
            });
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            notification.classList.add('alert-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 10000);
    }
    
    // Play alert sound
    playAlertSound(data.type);
    
    // Highlight the geofence on the map
    highlightGeofence(data.geofenceId);
}

/**
 * Play an alert sound
 * @param {string} type - Alert type ('entry' or 'exit')
 */
function playAlertSound(type) {
    const sound = new Audio(type === 'entry' ? '/sounds/entry-alert.mp3' : '/sounds/exit-alert.mp3');
    sound.play().catch(error => {
        console.warn('Could not play alert sound:', error);
    });
}

/**
 * Highlight a geofence on the map
 * @param {string} geofenceId - Geofence ID
 */
function highlightGeofence(geofenceId) {
    // Find the layer for this geofence
    let targetLayer = null;
    drawingManager.drawnItems.eachLayer(layer => {
        if (layer.geofenceId === geofenceId) {
            targetLayer = layer;
        }
    });
    
    if (targetLayer) {
        // Save original style
        const originalStyle = {
            color: targetLayer.options.color,
            weight: targetLayer.options.weight,
            dashArray: targetLayer.options.dashArray
        };
        
        // Highlight the layer
        targetLayer.setStyle({
            color: '#ff4136',
            weight: 5,
            dashArray: '5, 10'
        });
        
        // Restore original style after 3 seconds
        setTimeout(() => {
            targetLayer.setStyle(originalStyle);
        }, 3000);
        
        // Pan to the geofence
        map.fitBounds(targetLayer.getBounds ? targetLayer.getBounds() : targetLayer.getLatLng().toBounds(targetLayer.getRadius()));
    }
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            ${getNotificationIcon(type)}
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Get notification icon based on type
 * @param {string} type - Notification type
 * @returns {string} Icon HTML
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle"></i>';
        case 'error':
            return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        case 'info':
        default:
            return '<i class="fas fa-info-circle"></i>';
    }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
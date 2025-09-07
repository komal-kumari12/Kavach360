/**
 * Automated E-FIR Generation for Missing Persons
 * This module handles the generation of electronic First Information Reports
 * for missing tourists based on their digital IDs and tracking data.
 */

// Initialize the E-FIR module
document.addEventListener('DOMContentLoaded', function() {
    initEFIRModule();
});

/**
 * Initialize the E-FIR module
 */
function initEFIRModule() {
    // Initialize form handlers
    const efirForm = document.getElementById('efirForm');
    if (efirForm) {
        efirForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateEFIR();
        });
    }

    // Initialize tourist search
    initTouristSearch();
    
    // Initialize template selection
    initTemplateSelection();
    
    // Initialize preview functionality
    initPreview();
    
    // Initialize submission handlers
    initSubmissionHandlers();
}

/**
 * Initialize tourist search functionality
 */
function initTouristSearch() {
    const touristSearchInput = document.getElementById('touristSearch');
    const searchResultsContainer = document.getElementById('searchResults');
    
    if (!touristSearchInput || !searchResultsContainer) return;
    
    // Add input event listener for search
    touristSearchInput.addEventListener('input', debounce(async function(e) {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length < 3) {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch(`/api/tourists/search?term=${encodeURIComponent(searchTerm)}`);
            if (response.ok) {
                const data = await response.json();
                displaySearchResults(data.data, searchResultsContainer);
            } else {
                console.error('Search failed:', await response.text());
            }
        } catch (error) {
            console.error('Error searching tourists:', error);
        }
    }, 300));
}

/**
 * Display search results
 * @param {Array} results - Array of tourist search results
 * @param {HTMLElement} container - Container to display results in
 */
function displaySearchResults(results, container) {
    if (!results || results.length === 0) {
        container.innerHTML = '<p class="no-results">No tourists found</p>';
        container.style.display = 'block';
        return;
    }
    
    container.innerHTML = '';
    results.forEach(tourist => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="tourist-info">
                <div class="tourist-name">${tourist.name}</div>
                <div class="tourist-details">${tourist.nationality} | ID: ${tourist.digitalId}</div>
            </div>
        `;
        
        resultItem.addEventListener('click', function() {
            selectTourist(tourist);
            container.style.display = 'none';
        });
        
        container.appendChild(resultItem);
    });
    
    container.style.display = 'block';
}

/**
 * Select a tourist for E-FIR generation
 * @param {Object} tourist - Tourist object
 */
function selectTourist(tourist) {
    const selectedTouristContainer = document.getElementById('selectedTourist');
    const touristIdInput = document.getElementById('touristId');
    const touristSearchInput = document.getElementById('touristSearch');
    
    if (!selectedTouristContainer || !touristIdInput) return;
    
    // Update UI
    selectedTouristContainer.innerHTML = `
        <div class="selected-tourist-card">
            <div class="tourist-header">
                <h3>${tourist.name}</h3>
                <span class="digital-id-badge">${tourist.digitalId}</span>
            </div>
            <div class="tourist-details-grid">
                <div class="detail-item">
                    <div class="detail-label">Nationality</div>
                    <div class="detail-value">${tourist.nationality}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Passport</div>
                    <div class="detail-value">${tourist.passportNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Age</div>
                    <div class="detail-value">${tourist.age || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Gender</div>
                    <div class="detail-value">${tourist.gender || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${tourist.phone || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${tourist.email || 'N/A'}</div>
                </div>
            </div>
            <button type="button" class="btn-remove" id="removeTourist">Remove</button>
        </div>
    `;
    
    // Show the selected tourist container
    selectedTouristContainer.style.display = 'block';
    
    // Set the tourist ID in the hidden input
    touristIdInput.value = tourist._id;
    
    // Clear the search input
    if (touristSearchInput) touristSearchInput.value = '';
    
    // Add event listener to remove button
    const removeBtn = document.getElementById('removeTourist');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            selectedTouristContainer.innerHTML = '';
            selectedTouristContainer.style.display = 'none';
            touristIdInput.value = '';
        });
    }
    
    // Load last known location
    loadLastKnownLocation(tourist._id);
    
    // Enable the form sections that depend on tourist selection
    enableFormSections();
}

/**
 * Load the last known location of a tourist
 * @param {string} touristId - Tourist ID
 */
async function loadLastKnownLocation(touristId) {
    const locationContainer = document.getElementById('lastKnownLocation');
    if (!locationContainer) return;
    
    try {
        const response = await fetch(`/api/tourists/${touristId}/location`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                const location = data.data;
                locationContainer.innerHTML = `
                    <div class="location-card">
                        <h4>Last Known Location</h4>
                        <div class="location-details">
                            <div class="location-coordinates">
                                <i class="fas fa-map-marker-alt"></i>
                                ${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}
                            </div>
                            <div class="location-time">
                                <i class="fas fa-clock"></i>
                                ${new Date(location.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div id="locationMap" class="location-map"></div>
                    </div>
                `;
                
                // Initialize map
                setTimeout(() => {
                    initLocationMap(location.coordinates);
                }, 100);
            } else {
                locationContainer.innerHTML = `
                    <div class="location-card location-unknown">
                        <h4>Last Known Location</h4>
                        <p>No location data available for this tourist</p>
                    </div>
                `;
            }
        } else {
            throw new Error('Failed to fetch location');
        }
    } catch (error) {
        console.error('Error loading location:', error);
        locationContainer.innerHTML = `
            <div class="location-card location-error">
                <h4>Last Known Location</h4>
                <p>Error loading location data</p>
            </div>
        `;
    }
}

/**
 * Initialize a map to display the tourist's last known location
 * @param {Array} coordinates - [longitude, latitude] coordinates
 */
function initLocationMap(coordinates) {
    const mapElement = document.getElementById('locationMap');
    if (!mapElement) return;
    
    // Create map
    const map = L.map(mapElement).setView([coordinates[1], coordinates[0]], 15);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker
    L.marker([coordinates[1], coordinates[0]]).addTo(map)
        .bindPopup('Last known location')
        .openPopup();
}

/**
 * Initialize template selection functionality
 */
function initTemplateSelection() {
    const templateSelector = document.getElementById('templateSelector');
    if (!templateSelector) return;
    
    templateSelector.addEventListener('change', function(e) {
        const templateId = e.target.value;
        if (templateId) {
            loadTemplate(templateId);
        }
    });
}

/**
 * Load an E-FIR template
 * @param {string} templateId - Template ID
 */
async function loadTemplate(templateId) {
    const templateContainer = document.getElementById('templatePreview');
    if (!templateContainer) return;
    
    try {
        const response = await fetch(`/api/efir/templates/${templateId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                const template = data.data;
                
                // Update form fields with template data
                const descriptionInput = document.getElementById('incidentDescription');
                if (descriptionInput) {
                    descriptionInput.value = template.description || '';
                }
                
                // Update preview
                updatePreview();
            }
        } else {
            throw new Error('Failed to fetch template');
        }
    } catch (error) {
        console.error('Error loading template:', error);
        showNotification('Error loading template', 'error');
    }
}

/**
 * Enable form sections after tourist selection
 */
function enableFormSections() {
    const sections = document.querySelectorAll('.form-section.disabled');
    sections.forEach(section => {
        section.classList.remove('disabled');
    });
}

/**
 * Initialize preview functionality
 */
function initPreview() {
    const previewBtn = document.getElementById('previewBtn');
    const formInputs = document.querySelectorAll('#efirForm input, #efirForm textarea, #efirForm select');
    
    if (!previewBtn) return;
    
    // Add click event to preview button
    previewBtn.addEventListener('click', function() {
        updatePreview();
    });
    
    // Update preview when form inputs change
    formInputs.forEach(input => {
        input.addEventListener('change', debounce(updatePreview, 500));
    });
}

/**
 * Update the E-FIR preview
 */
function updatePreview() {
    const previewContainer = document.getElementById('efirPreview');
    const touristIdInput = document.getElementById('touristId');
    const incidentDateInput = document.getElementById('incidentDate');
    const incidentTimeInput = document.getElementById('incidentTime');
    const incidentLocationInput = document.getElementById('incidentLocation');
    const descriptionInput = document.getElementById('incidentDescription');
    
    if (!previewContainer || !touristIdInput || !touristIdInput.value) return;
    
    // Get form values
    const touristId = touristIdInput.value;
    const incidentDate = incidentDateInput ? incidentDateInput.value : '';
    const incidentTime = incidentTimeInput ? incidentTimeInput.value : '';
    const incidentLocation = incidentLocationInput ? incidentLocationInput.value : '';
    const description = descriptionInput ? descriptionInput.value : '';
    
    // Get selected tourist data
    const touristName = document.querySelector('.selected-tourist-card h3')?.textContent || '';
    const touristDigitalId = document.querySelector('.digital-id-badge')?.textContent || '';
    
    // Format date and time
    let formattedDateTime = 'Not specified';
    if (incidentDate) {
        formattedDateTime = new Date(incidentDate).toLocaleDateString();
        if (incidentTime) {
            formattedDateTime += ' ' + incidentTime;
        }
    }
    
    // Update preview
    previewContainer.innerHTML = `
        <div class="efir-preview-container">
            <div class="efir-header">
                <div class="efir-logo">
                    <img src="/images/police-logo.png" alt="Police Logo" onerror="this.src='/favicon.ico'; this.onerror=null;">
                </div>
                <div class="efir-title">
                    <h2>ELECTRONIC FIRST INFORMATION REPORT</h2>
                    <h3>MISSING PERSON REPORT</h3>
                </div>
                <div class="efir-id">
                    <div class="efir-number">E-FIR #: ${generateEFIRNumber()}</div>
                    <div class="efir-date">Date: ${new Date().toLocaleDateString()}</div>
                </div>
            </div>
            
            <div class="efir-section">
                <h4>1. MISSING PERSON DETAILS</h4>
                <div class="efir-details-grid">
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Name</div>
                        <div class="efir-detail-value">${touristName}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Digital ID</div>
                        <div class="efir-detail-value">${touristDigitalId}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Nationality</div>
                        <div class="efir-detail-value">${document.querySelector('.detail-value:nth-of-type(1)')?.textContent || 'N/A'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Passport Number</div>
                        <div class="efir-detail-value">${document.querySelector('.detail-value:nth-of-type(2)')?.textContent || 'N/A'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Age</div>
                        <div class="efir-detail-value">${document.querySelector('.detail-value:nth-of-type(3)')?.textContent || 'N/A'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Gender</div>
                        <div class="efir-detail-value">${document.querySelector('.detail-value:nth-of-type(4)')?.textContent || 'N/A'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Contact Number</div>
                        <div class="efir-detail-value">${document.querySelector('.detail-value:nth-of-type(5)')?.textContent || 'N/A'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Email</div>
                        <div class="efir-detail-value">${document.querySelector('.detail-value:nth-of-type(6)')?.textContent || 'N/A'}</div>
                    </div>
                </div>
            </div>
            
            <div class="efir-section">
                <h4>2. INCIDENT DETAILS</h4>
                <div class="efir-details-grid">
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Date & Time of Disappearance</div>
                        <div class="efir-detail-value">${formattedDateTime}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Last Known Location</div>
                        <div class="efir-detail-value">${incidentLocation || 'Not specified'}</div>
                    </div>
                </div>
                <div class="efir-detail-item full-width">
                    <div class="efir-detail-label">Description of Incident</div>
                    <div class="efir-detail-value description">${description || 'No description provided'}</div>
                </div>
            </div>
            
            <div class="efir-section">
                <h4>3. LAST TRACKED LOCATION</h4>
                <div class="efir-map-container" id="efirMap"></div>
                <div class="efir-location-details">
                    ${document.querySelector('.location-coordinates')?.innerHTML || 'No location data available'}
                    <br>
                    ${document.querySelector('.location-time')?.innerHTML || ''}
                </div>
            </div>
            
            <div class="efir-section">
                <h4>4. REPORT SUBMISSION</h4>
                <div class="efir-details-grid">
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Reported By</div>
                        <div class="efir-detail-value">${getCurrentUser()?.name || 'System User'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Designation</div>
                        <div class="efir-detail-value">${getCurrentUser()?.role || 'System Operator'}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Report Date & Time</div>
                        <div class="efir-detail-value">${new Date().toLocaleString()}</div>
                    </div>
                    <div class="efir-detail-item">
                        <div class="efir-detail-label">Status</div>
                        <div class="efir-detail-value"><span class="status-badge status-pending">Pending</span></div>
                    </div>
                </div>
            </div>
            
            <div class="efir-footer">
                <div class="efir-verification">
                    <div class="verification-text">This is an electronically generated report. Digital signature verification available at:</div>
                    <div class="verification-url">https://kavach360.gov.in/verify-efir</div>
                </div>
                <div class="efir-qrcode" id="efirQRCode"></div>
            </div>
        </div>
    `;
    
    // Show the preview container
    previewContainer.style.display = 'block';
    
    // Initialize map in preview if coordinates are available
    const locationCoordinates = document.querySelector('.location-coordinates');
    if (locationCoordinates) {
        const text = locationCoordinates.textContent.trim();
        const matches = text.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
        if (matches && matches.length === 3) {
            const lat = parseFloat(matches[1]);
            const lng = parseFloat(matches[2]);
            setTimeout(() => {
                initEFIRMap([lng, lat]);
            }, 100);
        }
    }
    
    // Generate QR code for verification
    generateEFIRQRCode();
}

/**
 * Initialize a map in the E-FIR preview
 * @param {Array} coordinates - [longitude, latitude] coordinates
 */
function initEFIRMap(coordinates) {
    const mapElement = document.getElementById('efirMap');
    if (!mapElement) return;
    
    // Create map
    const map = L.map(mapElement).setView([coordinates[1], coordinates[0]], 15);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker
    L.marker([coordinates[1], coordinates[0]]).addTo(map)
        .bindPopup('Last known location')
        .openPopup();
}

/**
 * Generate a QR code for E-FIR verification
 */
function generateEFIRQRCode() {
    const qrContainer = document.getElementById('efirQRCode');
    if (!qrContainer) return;
    
    // Generate a unique verification URL
    const verificationId = generateVerificationId();
    const verificationUrl = `https://kavach360.gov.in/verify-efir/${verificationId}`;
    
    // Generate QR code
    new QRCode(qrContainer, {
        text: verificationUrl,
        width: 100,
        height: 100
    });
}

/**
 * Generate a unique E-FIR number
 * @returns {string} E-FIR number
 */
function generateEFIRNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `EFIR-${year}${month}${day}-${random}`;
}

/**
 * Generate a verification ID for E-FIR
 * @returns {string} Verification ID
 */
function generateVerificationId() {
    return 'v-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Initialize submission handlers
 */
function initSubmissionHandlers() {
    const submitBtn = document.getElementById('submitEFIR');
    const downloadBtn = document.getElementById('downloadEFIR');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', async function() {
            if (validateForm()) {
                await submitEFIR();
            }
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (validateForm()) {
                downloadEFIR();
            }
        });
    }
}

/**
 * Validate the E-FIR form
 * @returns {boolean} Whether the form is valid
 */
function validateForm() {
    const touristIdInput = document.getElementById('touristId');
    const incidentDateInput = document.getElementById('incidentDate');
    const incidentLocationInput = document.getElementById('incidentLocation');
    const descriptionInput = document.getElementById('incidentDescription');
    
    let isValid = true;
    
    // Check if tourist is selected
    if (!touristIdInput || !touristIdInput.value) {
        showNotification('Please select a tourist', 'error');
        isValid = false;
    }
    
    // Check if incident date is provided
    if (incidentDateInput && !incidentDateInput.value) {
        showNotification('Please provide the incident date', 'error');
        isValid = false;
    }
    
    // Check if incident location is provided
    if (incidentLocationInput && !incidentLocationInput.value) {
        showNotification('Please provide the incident location', 'error');
        isValid = false;
    }
    
    // Check if description is provided
    if (descriptionInput && !descriptionInput.value) {
        showNotification('Please provide an incident description', 'error');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Submit the E-FIR to the server
 */
async function submitEFIR() {
    const efirForm = document.getElementById('efirForm');
    if (!efirForm) return;
    
    const formData = new FormData(efirForm);
    const efirData = Object.fromEntries(formData.entries());
    
    // Show loading state
    const submitBtn = document.getElementById('submitEFIR');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    }
    
    try {
        const response = await fetch('/api/efir/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(efirData)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showNotification('E-FIR submitted successfully', 'success');
                
                // Redirect to the E-FIR details page
                setTimeout(() => {
                    window.location.href = `/efir/details/${result.data.efirId}`;
                }, 2000);
            } else {
                throw new Error(result.message || 'Failed to submit E-FIR');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error submitting E-FIR:', error);
        showNotification(error.message || 'Failed to submit E-FIR', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit E-FIR';
        }
    }
}

/**
 * Download the E-FIR as PDF
 */
function downloadEFIR() {
    const previewContainer = document.getElementById('efirPreview');
    if (!previewContainer) return;
    
    // Show loading state
    const downloadBtn = document.getElementById('downloadEFIR');
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    }
    
    // Use html2canvas to capture the preview
    html2canvas(previewContainer, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`EFIR-${generateEFIRNumber()}.pdf`);
        
        // Reset button state
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = 'Download PDF';
        }
        
        showNotification('E-FIR downloaded successfully', 'success');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        showNotification('Failed to generate PDF', 'error');
        
        // Reset button state
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = 'Download PDF';
        }
    });
}

/**
 * Get the current logged-in user
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
    // This would typically come from a global state or session
    // For demo purposes, return a mock user
    return {
        name: 'John Doe',
        role: 'Security Officer',
        id: 'user123'
    };
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
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
 * Get the appropriate icon for a notification type
 * @param {string} type - Notification type
 * @returns {string} HTML for the icon
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle"></i>';
        case 'error':
            return '<i class="fas fa-exclamation-circle"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle"></i>';
        default:
            return '<i class="fas fa-info-circle"></i>';
    }
}
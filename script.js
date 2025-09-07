// Import multilingual support
import { initLanguageSelector, initVoiceRecognition } from './multilingual.js';

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const dashboardHeader = document.querySelector('.dashboard-header');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            dashboardHeader.classList.toggle('expanded');
        });
        
        // Close menu when clicking outside on mobile
        document.addEventListener('click', function(event) {
            const isMobile = window.innerWidth < 768;
            const isOutsideSidebar = !sidebar.contains(event.target);
            const isNotMenuToggle = event.target !== menuToggle;
            
            if (isMobile && isOutsideSidebar && isNotMenuToggle && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
                dashboardHeader.classList.add('expanded');
            }
        });
        
        // Close menu when pressing Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
                dashboardHeader.classList.add('expanded');
            }
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            // Handle tab switching
            if (this.classList.contains('menu-item')) {
                // Remove active class from all menu items and tab contents
                document.querySelectorAll('.menu-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to clicked menu item
                this.classList.add('active');
                
                // Show corresponding tab content
                const tabId = this.getAttribute('data-tab');
                const tabContent = document.getElementById(tabId);
                
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            }
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.dashboard-header');
        
        if (header) {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Form submission handling
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            this.classList.add('loading');
            
            // Simulate API call
            setTimeout(() => {
                this.classList.remove('loading');
                
                // Show success message
                const formContent = this.innerHTML;
                this.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <p>Thank you for contacting us. We will get back to you shortly.</p>
                    </div>
                `;
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    this.reset();
                    this.innerHTML = formContent;
                }, 5000);
                
            }, 2000);
        });
    });

    // Animated counters for statistics (if added later)
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        if (counters.length === 0) return;
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const step = Math.ceil(target / (duration / 16)); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current >= target) {
                    counter.textContent = target.toLocaleString();
                    return;
                }
                
                counter.textContent = current.toLocaleString();
                requestAnimationFrame(updateCounter);
            };
            
            updateCounter();
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
                
                // If this is the stats section, animate counters
                if (entry.target.classList.contains('stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.feature-card, .step, .about-content, .download-card').forEach(el => {
        observer.observe(el);
    });

    // Add animation classes to elements
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Safety score simulation (for demo purposes)
    const safetyScoreDemo = document.querySelector('.safety-score-demo');
    if (safetyScoreDemo) {
        const scoreValue = safetyScoreDemo.querySelector('.score-value');
        const scoreBar = safetyScoreDemo.querySelector('.score-bar-fill');
        
        if (scoreValue && scoreBar) {
            let score = 65; // Starting score
            
            // Update score display
            function updateScore() {
                scoreValue.textContent = score;
                scoreBar.style.width = `${score}%`;
                
                // Update color based on score
                if (score < 50) {
                    scoreBar.style.backgroundColor = '#ff4d4d'; // Red
                } else if (score < 75) {
                    scoreBar.style.backgroundColor = '#ffaa00'; // Orange
                } else {
                    scoreBar.style.backgroundColor = '#00c853'; // Green
                }
            }
            
            // Simulate score changes
            updateScore();
            
            // Simulate score changes every 5 seconds
            setInterval(() => {
                // Random score change between -5 and +5
                const change = Math.floor(Math.random() * 11) - 5;
                score += change;
                
                // Keep score within 0-100 range
                score = Math.max(0, Math.min(100, score));
                
                updateScore();
            }, 5000);
        }
    }

    // Geofencing demo animation (if added later)
    const geofencingDemo = document.querySelector('.geofencing-demo');
    if (geofencingDemo) {
        const tourist = geofencingDemo.querySelector('.tourist-marker');
        const safeZone = geofencingDemo.querySelector('.safe-zone');
        const alertBox = geofencingDemo.querySelector('.alert-box');
        
        if (tourist && safeZone && alertBox) {
            let isInSafeZone = true;
            let touristX = 50; // Starting position (percentage)
            let touristY = 50;
            let direction = { x: 1, y: 1 };
            
            // Update tourist position
            function updatePosition() {
                // Move tourist
                touristX += direction.x * 0.5;
                touristY += direction.y * 0.5;
                
                // Bounce off edges
                if (touristX <= 10 || touristX >= 90) direction.x *= -1;
                if (touristY <= 10 || touristY >= 90) direction.y *= -1;
                
                // Update position
                tourist.style.left = `${touristX}%`;
                tourist.style.top = `${touristY}%`;
                
                // Check if tourist is in safe zone
                const safeZoneRect = safeZone.getBoundingClientRect();
                const touristRect = tourist.getBoundingClientRect();
                
                const inSafeZone = (
                    touristRect.left >= safeZoneRect.left &&
                    touristRect.right <= safeZoneRect.right &&
                    touristRect.top >= safeZoneRect.top &&
                    touristRect.bottom <= safeZoneRect.bottom
                );
                
                // Show/hide alert if status changes
                if (inSafeZone !== isInSafeZone) {
                    isInSafeZone = inSafeZone;
                    
                    if (!isInSafeZone) {
                        alertBox.classList.add('active');
                        tourist.classList.add('danger');
                    } else {
                        alertBox.classList.remove('active');
                        tourist.classList.remove('danger');
                    }
                }
            }
            
            // Update position every 50ms
            setInterval(updatePosition, 50);
        }
    }

    // Digital ID Generation
    const digitalIdForm = document.getElementById('digitalIdForm');
    const qrCodeElement = document.getElementById('qrCode');
    
    if (digitalIdForm && qrCodeElement) {
        digitalIdForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            this.classList.add('loading');
            
            // Get form data
            const formData = {
                fullName: document.getElementById('touristName').value,
                passportNumber: document.getElementById('passportNumber').value,
                nationality: document.getElementById('nationality').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                contactNumber: document.getElementById('contactNumber').value,
                email: document.getElementById('email').value
            };
            
            try {
                // Call API to create digital ID
                const response = await fetch('/api/digital-id', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // Update ID preview
                    document.getElementById('idName').textContent = formData.fullName;
                    document.getElementById('idPassport').textContent = `ID: ${data.data.digitalId.idNumber}`;
                    document.getElementById('idNationality').textContent = formData.nationality;
                    document.getElementById('idDob').textContent = new Date(formData.dateOfBirth).toLocaleDateString();
                    document.getElementById('idIssueDate').textContent = new Date(data.data.digitalId.issueDate).toLocaleDateString();
                    document.getElementById('idValidUntil').textContent = new Date(data.data.digitalId.expiryDate).toLocaleDateString();
                    
                    // Generate QR code
                    QRCode.toCanvas(qrCodeElement, data.data.digitalId.qrData, function(error) {
                        if (error) console.error('QR Code error:', error);
                    });
                    
                    // Show success message
                    showNotification('Digital ID created successfully!', 'success');
                    
                    // Update recent IDs table
                    updateRecentIdsTable();
                } else {
                    showNotification(data.message || 'Failed to create Digital ID', 'error');
                }
            } catch (error) {
                console.error('Digital ID creation error:', error);
                showNotification('Failed to create Digital ID', 'error');
            } finally {
                this.classList.remove('loading');
            }
        });
    }
    
    // Function to download Digital ID
    window.downloadDigitalID = function() {
        const digitalIdCard = document.querySelector('.digital-id-card');
        
        if (digitalIdCard) {
            html2canvas(digitalIdCard).then(canvas => {
                const link = document.createElement('a');
                link.download = 'digital-id.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        }
    };
    
    // Function to share Digital ID
    window.shareDigitalID = function() {
        const digitalIdCard = document.querySelector('.digital-id-card');
        
        if (digitalIdCard && navigator.share) {
            html2canvas(digitalIdCard).then(canvas => {
                canvas.toBlob(async function(blob) {
                    const file = new File([blob], 'digital-id.png', { type: 'image/png' });
                    
                    try {
                        await navigator.share({
                            title: 'My Digital Tourist ID',
                            text: 'Here is my Digital Tourist ID from Kavach360',
                            files: [file]
                        });
                        showNotification('ID shared successfully!', 'success');
                    } catch (error) {
                        console.error('Share error:', error);
                        showNotification('Failed to share ID', 'error');
                    }
                });
            });
        } else {
            showNotification('Sharing not supported on this device', 'warning');
        }
    };
    
    // Function to regenerate QR code
    window.regenerateQRCode = async function() {
        try {
            const response = await fetch('/api/digital-id/regenerate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Update QR code
                QRCode.toCanvas(document.getElementById('qrCode'), data.data.qrData, function(error) {
                    if (error) console.error('QR Code error:', error);
                });
                
                showNotification('QR code regenerated successfully!', 'success');
            } else {
                showNotification(data.message || 'Failed to regenerate QR code', 'error');
            }
        } catch (error) {
            console.error('QR regeneration error:', error);
            showNotification('Failed to regenerate QR code', 'error');
        }
    };
    
    // Function to open verification page
    window.openVerificationPage = function() {
        // Redirect to verification page or open modal
        document.querySelector('a[href="#verification"]').click();
    };
    
    // Function to update recent IDs table
    async function updateRecentIdsTable() {
        try {
            const response = await fetch('/api/digital-id/recent', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success' && data.data.ids.length > 0) {
                const tableBody = document.querySelector('#digital-id-tab .table tbody');
                
                if (tableBody) {
                    tableBody.innerHTML = '';
                    
                    data.data.ids.forEach(id => {
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${id.fullName}</td>
                            <td>${id.idNumber}</td>
                            <td>${new Date(id.issueDate).toLocaleDateString()}</td>
                            <td>${new Date(id.expiryDate).toLocaleDateString()}</td>
                            <td><span class="status ${id.status.toLowerCase()}">${id.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewDigitalId('${id.id}')">View</button>
                                <button class="btn btn-sm btn-danger" onclick="revokeDigitalId('${id.id}')">Revoke</button>
                            </td>
                        `;
                        
                        tableBody.appendChild(row);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch recent IDs:', error);
        }
    }
    
    // Function to view digital ID
    window.viewDigitalId = async function(id) {
        try {
            const response = await fetch(`/api/digital-id/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                // Update ID preview with fetched data
                document.getElementById('idName').textContent = data.data.digitalId.fullName;
                document.getElementById('idPassport').textContent = `ID: ${data.data.digitalId.idNumber}`;
                document.getElementById('idNationality').textContent = data.data.digitalId.nationality;
                document.getElementById('idDob').textContent = new Date(data.data.digitalId.dateOfBirth).toLocaleDateString();
                document.getElementById('idIssueDate').textContent = new Date(data.data.digitalId.issueDate).toLocaleDateString();
                document.getElementById('idValidUntil').textContent = new Date(data.data.digitalId.expiryDate).toLocaleDateString();
                
                // Generate QR code
                QRCode.toCanvas(document.getElementById('qrCode'), data.data.digitalId.qrData, function(error) {
                    if (error) console.error('QR Code error:', error);
                });
            } else {
                showNotification(data.message || 'Failed to fetch Digital ID', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch Digital ID:', error);
            showNotification('Failed to fetch Digital ID', 'error');
        }
    };
    
    // Function to revoke digital ID
    window.revokeDigitalId = async function(id) {
        if (confirm('Are you sure you want to revoke this Digital ID? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/digital-id/${id}/revoke`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    showNotification('Digital ID revoked successfully!', 'success');
                    updateRecentIdsTable();
                } else {
                    showNotification(data.message || 'Failed to revoke Digital ID', 'error');
                }
            } catch (error) {
                console.error('Failed to revoke Digital ID:', error);
                showNotification('Failed to revoke Digital ID', 'error');
            }
        }
    };
    
    // Function to show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // Load initial data
    updateRecentIdsTable();
});

// Geofencing Management
const geofenceForm = document.getElementById('geofenceForm');
const geofenceMap = document.getElementById('geofenceMap');
const mapCoordinates = document.getElementById('mapCoordinates');
const mapLoading = document.getElementById('mapLoading');

// Map initialization
let map;
let markers = [];
let geofenceCircles = [];
let selectedCoordinates = null;

// Initialize map when geofencing tab is active
document.querySelector('a[data-tab="geofencing-tab"]').addEventListener('click', initializeMap);

function initializeMap() {
    if (map) return; // Map already initialized
    
    mapLoading.style.display = 'flex';
    
    // Initialize the map (using Leaflet.js)
    map = L.map('geofenceMap').setView([26.1445, 91.7362], 13); // Default to Guwahati
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);
        
        // Update form fields
        document.getElementById('zoneLatitude').value = lat;
        document.getElementById('zoneLongitude').value = lng;
        
        // Update coordinates display
        mapCoordinates.textContent = `Selected: ${lat}, ${lng}`;
        
        // Add temporary marker
        if (selectedCoordinates) {
            map.removeLayer(selectedCoordinates);
        }
        
        selectedCoordinates = L.marker([lat, lng]).addTo(map);
        selectedCoordinates.bindPopup('Selected Location').openPopup();
    });
    
    // Load existing geofence zones
    loadGeofenceZones();
    
    mapLoading.style.display = 'none';
}

// Load geofence zones from API
async function loadGeofenceZones() {
    try {
        const response = await fetch('/api/geofence', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Clear existing markers and circles
            clearGeofenceMarkers();
            
            // Add zones to map
            data.data.zones.forEach(zone => {
                addZoneToMap(zone);
            });
            
            // Update table
            updateGeofenceTable(data.data.zones);
        } else {
            showNotification(data.message || 'Failed to load geofence zones', 'error');
        }
    } catch (error) {
        console.error('Failed to load geofence zones:', error);
        showNotification('Failed to load geofence zones', 'error');
    }
}

// Add zone to map
function addZoneToMap(zone) {
    if (!map) return;
    
    // Add marker
    const marker = L.marker([zone.latitude, zone.longitude]).addTo(map);
    marker.bindPopup(`
        <strong>${zone.name}</strong><br>
        Type: ${zone.type}<br>
        Radius: ${zone.radius}m<br>
        ${zone.description || ''}
    `);
    
    // Add circle
    const circleColor = zone.type === 'safe' ? '#00c853' : 
                        zone.type === 'warning' ? '#ffaa00' : '#ff4d4d';
    
    const circle = L.circle([zone.latitude, zone.longitude], {
        radius: zone.radius,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.2
    }).addTo(map);
    
    // Store references
    markers.push(marker);
    geofenceCircles.push(circle);
}

// Clear all geofence markers and circles
function clearGeofenceMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    geofenceCircles.forEach(circle => map.removeLayer(circle));
    
    markers = [];
    geofenceCircles = [];
}

// Update geofence table
function updateGeofenceTable(zones) {
    const tableBody = document.querySelector('#geofenceTable tbody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        zones.forEach(zone => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${zone.name}</td>
                <td><span class="status ${zone.type}">${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)}</span></td>
                <td>${zone.latitude}, ${zone.longitude}</td>
                <td>${zone.radius}m</td>
                <td>${zone.description || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewGeofenceZone('${zone.id}')">View</button>
                    <button class="btn btn-sm btn-warning" onclick="editGeofenceZone('${zone.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteGeofenceZone('${zone.id}')">Delete</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

// Refresh geofence map
window.refreshGeofenceMap = function() {
    loadGeofenceZones();
};

// Clear all highlights
window.clearAllHighlights = function() {
    if (selectedCoordinates) {
        map.removeLayer(selectedCoordinates);
        selectedCoordinates = null;
    }
    
    document.getElementById('zoneLatitude').value = '';
    document.getElementById('zoneLongitude').value = '';
    mapCoordinates.textContent = 'Click on map to select coordinates';
};

// View geofence zone
window.viewGeofenceZone = function(id) {
    // Find zone in map and highlight it
    fetch(`/api/geofence/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const zone = data.data.zone;
            
            // Center map on zone
            map.setView([zone.latitude, zone.longitude], 15);
            
            // Highlight zone
            const marker = markers.find(m => m.getLatLng().lat === parseFloat(zone.latitude) && 
                                       m.getLatLng().lng === parseFloat(zone.longitude));
            
            if (marker) {
                marker.openPopup();
            }
        }
    })
    .catch(error => {
        console.error('Failed to fetch zone details:', error);
        showNotification('Failed to fetch zone details', 'error');
    });
};

// Edit geofence zone
window.editGeofenceZone = function(id) {
    fetch(`/api/geofence/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const zone = data.data.zone;
            
            // Populate form
            document.getElementById('zoneName').value = zone.name;
            document.getElementById('zoneType').value = zone.type;
            document.getElementById('zoneLatitude').value = zone.latitude;
            document.getElementById('zoneLongitude').value = zone.longitude;
            document.getElementById('zoneRadius').value = zone.radius;
            document.getElementById('zoneDescription').value = zone.description || '';
            
            // Update form for edit mode
            const form = document.getElementById('geofenceForm');
            form.dataset.mode = 'edit';
            form.dataset.zoneId = id;
            
            // Update button text
            form.querySelector('button[type="submit"]').textContent = 'Update Zone';
            
            // Add cancel button if not exists
            if (!form.querySelector('.btn-cancel')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.type = 'button';
                cancelBtn.className = 'btn btn-outline btn-cancel';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.addEventListener('click', resetGeofenceForm);
                
                form.querySelector('button[type="submit"]').insertAdjacentElement('afterend', cancelBtn);
            }
            
            // Center map on zone
            map.setView([zone.latitude, zone.longitude], 15);
            
            // Add temporary marker
            if (selectedCoordinates) {
                map.removeLayer(selectedCoordinates);
            }
            
            selectedCoordinates = L.marker([zone.latitude, zone.longitude]).addTo(map);
            selectedCoordinates.bindPopup('Selected Location').openPopup();
            
            // Update coordinates display
            mapCoordinates.textContent = `Selected: ${zone.latitude}, ${zone.longitude}`;
        }
    })
    .catch(error => {
        console.error('Failed to fetch zone details:', error);
        showNotification('Failed to fetch zone details', 'error');
    });
};

// Delete geofence zone
window.deleteGeofenceZone = function(id) {
    if (confirm('Are you sure you want to delete this geofence zone? This action cannot be undone.')) {
        fetch(`/api/geofence/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification('Geofence zone deleted successfully!', 'success');
                loadGeofenceZones();
            } else {
                showNotification(data.message || 'Failed to delete geofence zone', 'error');
            }
        })
        .catch(error => {
            console.error('Failed to delete geofence zone:', error);
            showNotification('Failed to delete geofence zone', 'error');
        });
    }
};

// Reset geofence form
function resetGeofenceForm() {
    const form = document.getElementById('geofenceForm');
    form.reset();
    
    // Reset form mode
    form.dataset.mode = 'create';
    delete form.dataset.zoneId;
    
    // Update button text
    form.querySelector('button[type="submit"]').textContent = 'Create Zone';
    
    // Remove cancel button if exists
    const cancelBtn = form.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.remove();
    }
    
    // Clear selected coordinates
    if (selectedCoordinates) {
        map.removeLayer(selectedCoordinates);
        selectedCoordinates = null;
    }
    
    mapCoordinates.textContent = 'Click on map to select coordinates';
}

// Handle geofence form submission
if (geofenceForm) {
    geofenceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        this.classList.add('loading');
        
        // Get form data
        const formData = {
            name: document.getElementById('zoneName').value,
            type: document.getElementById('zoneType').value,
            latitude: document.getElementById('zoneLatitude').value,
            longitude: document.getElementById('zoneLongitude').value,
            radius: document.getElementById('zoneRadius').value,
            description: document.getElementById('zoneDescription').value
        };
        
        try {
            const isEditMode = this.dataset.mode === 'edit';
            const url = isEditMode ? `/api/geofence/${this.dataset.zoneId}` : '/api/geofence';
            const method = isEditMode ? 'PUT' : 'POST';
            
            // Call API to create/update geofence zone
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                showNotification(`Geofence zone ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
                
                // Reset form
                resetGeofenceForm();
                
                // Reload zones
                loadGeofenceZones();
            } else {
                showNotification(data.message || `Failed to ${isEditMode ? 'update' : 'create'} geofence zone`, 'error');
            }
        } catch (error) {
            console.error(`Geofence zone ${this.dataset.mode === 'edit' ? 'update' : 'creation'} error:`, error);
            showNotification(`Failed to ${this.dataset.mode === 'edit' ? 'update' : 'create'} geofence zone`, 'error');
        } finally {
            this.classList.remove('loading');
        }
    });
}

// Search geofence zones
const geofenceSearch = document.getElementById('geofenceSearch');
if (geofenceSearch) {
    geofenceSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#geofenceTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Alert Management System
const alertsTable = document.getElementById('alertsTable');
const alertsContainer = document.getElementById('alertsContainer');
const alertsCount = document.getElementById('alertsCount');
const alertsTab = document.querySelector('a[data-tab="alerts-tab"]');

// Initialize alerts when alerts tab is active
if (alertsTab) {
    alertsTab.addEventListener('click', loadAlerts);
}

// Load alerts from API
async function loadAlerts() {
    try {
        const response = await fetch('/api/alerts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateAlertsTable(data.data.alerts);
            updateAlertsCount(data.data.alerts.filter(alert => !alert.read).length);
        } else {
            showNotification(data.message || 'Failed to load alerts', 'error');
        }
    } catch (error) {
        console.error('Failed to load alerts:', error);
        showNotification('Failed to load alerts', 'error');
    }
}

// Update alerts table
function updateAlertsTable(alerts) {
    if (!alertsTable) return;
    
    const tableBody = alertsTable.querySelector('tbody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        if (alerts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">No alerts found</td>';
            tableBody.appendChild(row);
            return;
        }
        
        alerts.forEach(alert => {
            const row = document.createElement('tr');
            row.className = alert.read ? '' : 'unread';
            
            // Format date
            const date = new Date(alert.createdAt);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            row.innerHTML = `
                <td>${alert.title}</td>
                <td>${alert.message}</td>
                <td><span class="status ${alert.type}">${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</span></td>
                <td>${alert.location || '-'}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-sm ${alert.read ? 'btn-outline' : 'btn-primary'}" 
                            onclick="markAlertAsRead('${alert.id}')">
                        ${alert.read ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="respondToAlert('${alert.id}')">Respond</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

// Update alerts count
function updateAlertsCount(count) {
    if (alertsCount) {
        alertsCount.textContent = count;
        alertsCount.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Update sidebar badge
    const sidebarBadge = document.querySelector('.sidebar-menu a[data-tab="alerts-tab"] .badge');
    if (sidebarBadge) {
        sidebarBadge.textContent = count;
        sidebarBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Mark alert as read
window.markAlertAsRead = function(id) {
    fetch(`/api/alerts/${id}/read`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ read: true })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification('Alert status updated', 'success');
            loadAlerts();
        } else {
            showNotification(data.message || 'Failed to update alert status', 'error');
        }
    })
    .catch(error => {
        console.error('Failed to update alert status:', error);
        showNotification('Failed to update alert status', 'error');
    });
};

// Mark all alerts as read
window.markAllAlertsAsRead = function() {
    fetch('/api/alerts/read/all', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification('All alerts marked as read', 'success');
            loadAlerts();
        } else {
            showNotification(data.message || 'Failed to mark all alerts as read', 'error');
        }
    })
    .catch(error => {
        console.error('Failed to mark all alerts as read:', error);
        showNotification('Failed to mark all alerts as read', 'error');
    });
};

// Respond to alert
window.respondToAlert = function(id) {
    fetch(`/api/alerts/${id}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const alert = data.data.alert;
            
            // Show response modal
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Respond to Alert</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="alert-details">
                            <p><strong>Title:</strong> ${alert.title}</p>
                            <p><strong>Message:</strong> ${alert.message}</p>
                            <p><strong>Type:</strong> ${alert.type}</p>
                            <p><strong>Location:</strong> ${alert.location || 'Not specified'}</p>
                            <p><strong>Date:</strong> ${new Date(alert.createdAt).toLocaleString()}</p>
                        </div>
                        <form id="alertResponseForm">
                            <div class="form-group">
                                <label for="responseStatus">Status</label>
                                <select id="responseStatus" class="form-control" required>
                                    <option value="pending" ${alert.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="in_progress" ${alert.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="resolved" ${alert.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                    <option value="false_alarm" ${alert.status === 'false_alarm' ? 'selected' : ''}>False Alarm</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="responseNotes">Response Notes</label>
                                <textarea id="responseNotes" class="form-control" rows="4" placeholder="Enter your response notes here...">${alert.responseNotes || ''}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">Submit Response</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close modal on click
            modal.querySelector('.close-modal').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            // Close modal on outside click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
            
            // Handle form submission
            modal.querySelector('#alertResponseForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const status = document.getElementById('responseStatus').value;
                const responseNotes = document.getElementById('responseNotes').value;
                
                fetch(`/api/alerts/${id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        status,
                        responseNotes
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showNotification('Alert response submitted successfully', 'success');
                        document.body.removeChild(modal);
                        loadAlerts();
                    } else {
                        showNotification(data.message || 'Failed to submit alert response', 'error');
                    }
                })
                .catch(error => {
                    console.error('Failed to submit alert response:', error);
                    showNotification('Failed to submit alert response', 'error');
                });
            });
        } else {
            showNotification(data.message || 'Failed to fetch alert details', 'error');
        }
    })
    .catch(error => {
        console.error('Failed to fetch alert details:', error);
        showNotification('Failed to fetch alert details', 'error');
    });
};

// Create alert (for testing)
window.createTestAlert = function() {
    const alertTypes = ['warning', 'danger', 'info'];
    const alertTitles = [
        'Tourist entered restricted area',
        'SOS signal received',
        'Tourist left designated route',
        'Prolonged inactivity detected',
        'Unusual movement pattern detected'
    ];
    
    const randomAlert = {
        title: alertTitles[Math.floor(Math.random() * alertTitles.length)],
        message: 'This is a test alert message for demonstration purposes.',
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        location: 'Lat: 26.1445, Long: 91.7362'
    };
    
    fetch('/api/alerts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(randomAlert)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showNotification('Test alert created successfully', 'success');
            loadAlerts();
        } else {
            showNotification(data.message || 'Failed to create test alert', 'error');
        }
    })
    .catch(error => {
        console.error('Failed to create test alert:', error);
        showNotification('Failed to create test alert', 'error');
    });
};

// Check for new alerts periodically
setInterval(function() {
    if (document.querySelector('.tab-content.active') === document.getElementById('alerts-tab')) {
        loadAlerts();
    }
}, 30000); // Check every 30 seconds

// Load alerts on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initial load of alerts
    loadAlerts();
});

// Anomaly Detection
const anomalyContainer = document.getElementById('anomalyContainer');
const anomalyChart = document.getElementById('anomalyChart');
const anomalyTable = document.getElementById('anomalyTable');
const anomalyTab = document.querySelector('a[data-tab="anomaly-tab"]');

// Initialize anomaly detection when tab is active
if (anomalyTab) {
    anomalyTab.addEventListener('click', initializeAnomalyDetection);
}

// Initialize anomaly detection
function initializeAnomalyDetection() {
    loadAnomalyData();
    initializeAnomalyChart();
}

// Load anomaly data from API
async function loadAnomalyData() {
    try {
        const response = await fetch('/api/anomalies', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            updateAnomalyTable(data.data.anomalies);
            updateAnomalyChart(data.data.anomalies);
        } else {
            showNotification(data.message || 'Failed to load anomaly data', 'error');
        }
    } catch (error) {
        console.error('Failed to load anomaly data:', error);
        showNotification('Failed to load anomaly data', 'error');
        
        // For demonstration, load sample data
        loadSampleAnomalyData();
    }
}

// Load sample anomaly data for demonstration
function loadSampleAnomalyData() {
    const sampleAnomalies = [
        {
            id: 'anom1',
            touristId: 'T12345',
            touristName: 'John Smith',
            type: 'location_dropout',
            description: 'Sudden location signal loss',
            confidence: 0.89,
            location: 'Lat: 26.1842, Long: 91.7384',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            status: 'pending'
        },
        {
            id: 'anom2',
            touristId: 'T23456',
            touristName: 'Emma Johnson',
            type: 'route_deviation',
            description: 'Significant deviation from planned route',
            confidence: 0.76,
            location: 'Lat: 26.1645, Long: 91.7662',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'investigating'
        },
        {
            id: 'anom3',
            touristId: 'T34567',
            touristName: 'Michael Chen',
            type: 'prolonged_inactivity',
            description: 'No movement detected for 2 hours',
            confidence: 0.92,
            location: 'Lat: 26.1245, Long: 91.7162',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            status: 'resolved'
        },
        {
            id: 'anom4',
            touristId: 'T45678',
            touristName: 'Sarah Williams',
            type: 'unusual_pattern',
            description: 'Erratic movement pattern detected',
            confidence: 0.68,
            location: 'Lat: 26.1545, Long: 91.7262',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            status: 'false_alarm'
        },
        {
            id: 'anom5',
            touristId: 'T56789',
            touristName: 'David Kumar',
            type: 'geofence_breach',
            description: 'Entered restricted area',
            confidence: 0.95,
            location: 'Lat: 26.1745, Long: 91.7462',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'pending'
        }
    ];
    
    updateAnomalyTable(sampleAnomalies);
    updateAnomalyChart(sampleAnomalies);
}

// Update anomaly table
function updateAnomalyTable(anomalies) {
    if (!anomalyTable) return;
    
    const tableBody = anomalyTable.querySelector('tbody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        if (anomalies.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">No anomalies detected</td>';
            tableBody.appendChild(row);
            return;
        }
        
        anomalies.forEach(anomaly => {
            const row = document.createElement('tr');
            
            // Format date
            const date = new Date(anomaly.timestamp);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            // Status class
            const statusClass = 
                anomaly.status === 'pending' ? 'warning' :
                anomaly.status === 'investigating' ? 'info' :
                anomaly.status === 'resolved' ? 'success' :
                anomaly.status === 'false_alarm' ? 'danger' : 'default';
            
            row.innerHTML = `
                <td>${anomaly.touristName}</td>
                <td>${anomaly.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td>${anomaly.description}</td>
                <td>${(anomaly.confidence * 100).toFixed(1)}%</td>
                <td>${anomaly.location || '-'}</td>
                <td>${formattedDate}</td>
                <td>
                    <span class="status ${statusClass}">${anomaly.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewTouristDetails('${anomaly.touristId}')">View Tourist</button>
                    <button class="btn btn-sm btn-warning" onclick="investigateAnomaly('${anomaly.id}')">Investigate</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
}

// Initialize anomaly chart
function initializeAnomalyChart() {
    if (!anomalyChart) return;
    
    // Create chart using Chart.js
    window.anomalyChartInstance = new Chart(anomalyChart.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Location Dropout', 'Route Deviation', 'Prolonged Inactivity', 'Unusual Pattern', 'Geofence Breach'],
            datasets: [{
                label: 'Anomalies Detected (Last 24 Hours)',
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update anomaly chart
function updateAnomalyChart(anomalies) {
    if (!window.anomalyChartInstance) {
        initializeAnomalyChart();
    }
    
    // Count anomalies by type
    const counts = {
        'location_dropout': 0,
        'route_deviation': 0,
        'prolonged_inactivity': 0,
        'unusual_pattern': 0,
        'geofence_breach': 0
    };
    
    anomalies.forEach(anomaly => {
        if (counts[anomaly.type] !== undefined) {
            counts[anomaly.type]++;
        }
    });
    
    // Update chart data
    window.anomalyChartInstance.data.datasets[0].data = [
        counts['location_dropout'],
        counts['route_deviation'],
        counts['prolonged_inactivity'],
        counts['unusual_pattern'],
        counts['geofence_breach']
    ];
    
    window.anomalyChartInstance.update();
}

// View tourist details
window.viewTouristDetails = function(touristId) {
    // Redirect to tourist details page or show modal
    showNotification('Viewing tourist details: ' + touristId, 'info');
    
    // For demonstration, show a modal with tourist details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Tourist Details</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="tourist-details">
                    <p><strong>Tourist ID:</strong> ${touristId}</p>
                    <p><strong>Loading details...</strong></p>
                </div>
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on click
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Simulate loading tourist details
    setTimeout(function() {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="tourist-details">
                <div class="tourist-profile">
                    <img src="https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg" alt="Tourist Photo" class="tourist-photo">
                    <div>
                        <h4>${['John Smith', 'Emma Johnson', 'Michael Chen', 'Sarah Williams', 'David Kumar'][Math.floor(Math.random() * 5)]}</h4>
                        <p>ID: ${touristId}</p>
                        <p>Nationality: ${['American', 'British', 'Chinese', 'Indian', 'Australian'][Math.floor(Math.random() * 5)]}</p>
                    </div>
                </div>
                <div class="tourist-info">
                    <p><strong>Age:</strong> ${20 + Math.floor(Math.random() * 50)}</p>
                    <p><strong>Contact:</strong> +${Math.floor(Math.random() * 10000000000)}</p>
                    <p><strong>Email:</strong> tourist${Math.floor(Math.random() * 1000)}@example.com</p>
                    <p><strong>Check-in Date:</strong> ${new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toLocaleDateString()}</p>
                    <p><strong>Check-out Date:</strong> ${new Date(Date.now() + Math.floor(Math.random() * 10) * 86400000).toLocaleDateString()}</p>
                    <p><strong>Safety Score:</strong> ${Math.floor(Math.random() * 40) + 60}/100</p>
                </div>
                <div class="tourist-location">
                    <h4>Last Known Location</h4>
                    <p>Latitude: 26.${Math.floor(Math.random() * 2000)}</p>
                    <p>Longitude: 91.${Math.floor(Math.random() * 2000)}</p>
                    <p>Last Updated: ${new Date(Date.now() - Math.floor(Math.random() * 120) * 60000).toLocaleString()}</p>
                </div>
                <div class="tourist-actions">
                    <button class="btn btn-primary" onclick="showNotification('Contacting tourist...', 'info')">Contact Tourist</button>
                    <button class="btn btn-warning" onclick="showNotification('Sending emergency alert...', 'warning')">Send Alert</button>
                    <button class="btn btn-danger" onclick="showNotification('Initiating emergency response...', 'danger')">Emergency Response</button>
                </div>
            </div>
        `;
    }, 1500);
};

// Investigate anomaly
window.investigateAnomaly = function(anomalyId) {
    // For demonstration, show a modal with investigation options
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Investigate Anomaly</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="anomaly-investigation">
                    <p><strong>Anomaly ID:</strong> ${anomalyId}</p>
                    <form id="anomalyInvestigationForm">
                        <div class="form-group">
                            <label for="investigationStatus">Update Status</label>
                            <select id="investigationStatus" class="form-control" required>
                                <option value="pending">Pending</option>
                                <option value="investigating" selected>Investigating</option>
                                <option value="resolved">Resolved</option>
                                <option value="false_alarm">False Alarm</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="investigationNotes">Investigation Notes</label>
                            <textarea id="investigationNotes" class="form-control" rows="4" placeholder="Enter your investigation notes here..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-warning" onclick="generateEFIR('${anomalyId}')">Generate E-FIR</button>
                            <button type="submit" class="btn btn-primary">Update Status</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on click
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Handle form submission
    modal.querySelector('#anomalyInvestigationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const status = document.getElementById('investigationStatus').value;
        const notes = document.getElementById('investigationNotes').value;
        
        // For demonstration, just show notification and close modal
        showNotification(`Anomaly ${anomalyId} status updated to ${status}`, 'success');
        document.body.removeChild(modal);
        
        // Reload anomaly data
        loadAnomalyData();
    });
};

// Generate E-FIR for missing person
window.generateEFIR = function(anomalyId) {
    // For demonstration, show a modal with E-FIR form
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h3>Generate E-FIR for Missing Person</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="efir-form">
                    <form id="efirForm">
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="efirTouristName">Tourist Name</label>
                                <input type="text" id="efirTouristName" class="form-control" value="John Smith" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="efirTouristId">Tourist ID</label>
                                <input type="text" id="efirTouristId" class="form-control" value="T12345" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="efirNationality">Nationality</label>
                                <input type="text" id="efirNationality" class="form-control" value="American" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="efirPassport">Passport Number</label>
                                <input type="text" id="efirPassport" class="form-control" value="US123456789" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="efirLastSeen">Last Seen Date/Time</label>
                                <input type="datetime-local" id="efirLastSeen" class="form-control" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="efirLastLocation">Last Known Location</label>
                                <input type="text" id="efirLastLocation" class="form-control" value="Lat: 26.1842, Long: 91.7384" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="efirDescription">Physical Description</label>
                            <textarea id="efirDescription" class="form-control" rows="3" placeholder="Height, weight, clothing, distinguishing features, etc."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="efirCircumstances">Circumstances of Disappearance</label>
                            <textarea id="efirCircumstances" class="form-control" rows="3" placeholder="Describe the circumstances leading to the disappearance"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="efirEmergencyContact">Emergency Contact</label>
                            <input type="text" id="efirEmergencyContact" class="form-control" placeholder="Name and contact information">
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-danger">Generate E-FIR</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Set default last seen time to current time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('efirLastSeen').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Close modal on click
    modal.querySelector('.close-modal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Handle form submission
    modal.querySelector('#efirForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // For demonstration, show success notification and close modal
        showNotification('E-FIR generated successfully and sent to local police', 'success');
        
        // Show E-FIR confirmation
        const efirNumber = 'FIR' + Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        
        // Replace form with confirmation
        modal.querySelector('.modal-body').innerHTML = `
            <div class="efir-confirmation">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h4>E-FIR Generated Successfully</h4>
                <p>E-FIR Number: <strong>${efirNumber}</strong></p>
                <p>Date & Time: ${new Date().toLocaleString()}</p>
                <p>The E-FIR has been automatically sent to:</p>
                <ul>
                    <li>Local Police Station</li>
                    <li>Tourism Department</li>
                    <li>Emergency Contact</li>
                </ul>
                <div class="form-actions">
                    <button type="button" class="btn btn-primary" onclick="window.print()">Print E-FIR</button>
                    <button type="button" class="btn btn-outline" onclick="document.body.removeChild(modal)">Close</button>
                </div>
            </div>
        `;
    });
};

// Check for new anomalies periodically
setInterval(function() {
    if (document.querySelector('.tab-content.active') === document.getElementById('anomaly-tab')) {
        loadAnomalyData();
    }
}, 60000); // Check every minute
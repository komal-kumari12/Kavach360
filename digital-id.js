/**
 * Digital Tourist ID Generation Module
 * Handles creation, display, and management of digital tourist IDs
 */

// Initialize the Digital ID module
document.addEventListener('DOMContentLoaded', function() {
    initDigitalIDModule();
});

/**
 * Initialize the Digital ID module
 */
function initDigitalIDModule() {
    // Initialize form handlers
    const digitalIdForm = document.getElementById('digitalIdForm');
    if (digitalIdForm) {
        digitalIdForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateDigitalID();
        });
    }

    // Initialize QR scanner
    initQRScanner();
    
    // Load existing digital ID on page load
    loadDigitalID();
    
    // Initialize download and share buttons
    initButtons();
}

/**
 * Initialize QR scanner for digital ID verification
 */
function initQRScanner() {
    const qrScannerElement = document.getElementById('qrScanner');
    if (!qrScannerElement) return;
    
    let html5QrCode;
    let isScanning = false;
    
    // Start QR Scanner button
    const startScanBtn = document.getElementById('startScanBtn');
    if (startScanBtn) {
        startScanBtn.addEventListener('click', function() {
            if (!isScanning) {
                // Initialize scanner if not already done
                if (!html5QrCode) {
                    html5QrCode = new Html5Qrcode("qrScanner");
                }
                
                // Start scanning
                const qrConfig = { fps: 10, qrbox: 250 };
                html5QrCode.start(
                    { facingMode: "environment" },
                    qrConfig,
                    onQrCodeSuccess,
                    onQrCodeError
                ).then(() => {
                    isScanning = true;
                    startScanBtn.textContent = "Stop Camera";
                }).catch((err) => {
                    console.error("Error starting QR scanner:", err);
                    showNotification("Could not start camera. Please check permissions.", 'error');
                });
            } else {
                // Stop scanning
                if (html5QrCode) {
                    html5QrCode.stop().then(() => {
                        isScanning = false;
                        startScanBtn.textContent = "Start Camera";
                    }).catch((err) => {
                        console.error("Error stopping QR scanner:", err);
                    });
                }
            }
        });
    }
    
    // QR Code success callback
    function onQrCodeSuccess(decodedText, decodedResult) {
        // Stop scanning after successful scan
        if (html5QrCode && isScanning) {
            html5QrCode.stop().then(() => {
                isScanning = false;
                if (startScanBtn) startScanBtn.textContent = "Start Camera";
                
                // Process the QR code data
                try {
                    const qrData = JSON.parse(decodedText);
                    
                    // Check if we're in verification mode (verify.html)
                    const qrDataInput = document.getElementById('qrDataInput');
                    if (qrDataInput) {
                        // We're in verification page, populate the input field
                        qrDataInput.value = decodedText;
                        // Trigger verification button click if it exists
                        const verifyBtn = document.getElementById('verifyBtn');
                        if (verifyBtn) {
                            verifyBtn.click();
                        }
                        showNotification("QR code scanned successfully! Verifying...", 'info');
                    } else {
                        // We're in the digital ID page, display tourist data
                        displayTouristData(qrData);
                        showNotification("QR code scanned successfully!", 'success');
                    }
                } catch (error) {
                    console.error("QR code parsing error:", error);
                    showNotification("Invalid QR code format", 'error');
                }
            });
        }
    }
    
    // QR Code error callback
    function onQrCodeError(error) {
        // We don't need to do anything here as this is called frequently during scanning
    }
    
    // File input for QR code upload
    const qrFileInput = document.getElementById('qrFileInput');
    if (qrFileInput) {
        qrFileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                // Initialize scanner if not already done
                if (!html5QrCode) {
                    html5QrCode = new Html5Qrcode("qrScanner");
                }
                
                // Scan the uploaded file
                html5QrCode.scanFile(file, true)
                    .then(decodedText => {
                        try {
                            const qrData = JSON.parse(decodedText);
                            
                            // Check if we're in verification mode (verify.html)
                            const qrDataInput = document.getElementById('qrDataInput');
                            if (qrDataInput) {
                                // We're in verification page, populate the input field
                                qrDataInput.value = decodedText;
                                // Trigger verification button click if it exists
                                const verifyBtn = document.getElementById('verifyBtn');
                                if (verifyBtn) {
                                    verifyBtn.click();
                                }
                                showNotification("QR code scanned successfully! Verifying...", 'info');
                            } else {
                                // We're in the digital ID page, display tourist data
                                displayTouristData(qrData);
                                showNotification("QR code scanned successfully!", 'success');
                            }
                        } catch (error) {
                            console.error("QR code parsing error:", error);
                            showNotification("Invalid QR code format", 'error');
                        }
                    })
                    .catch(err => {
                        console.error("QR code scanning error:", err);
                        showNotification("Could not read QR code from image", 'error');
                    });
            }
        });
    }
}

/**
 * Display Tourist Data from QR code
 */
function displayTouristData(data) {
    // Show verification result
    const resultPlaceholder = document.querySelector('.result-placeholder');
    const resultDetails = document.querySelector('.result-details');
    
    if (resultPlaceholder && resultDetails) {
        resultPlaceholder.style.display = "none";
        resultDetails.style.display = "block";
        
        // Set verification time
        const verificationTime = document.getElementById('verificationTime');
        if (verificationTime) {
            const now = new Date();
            verificationTime.textContent = now.toLocaleString();
        }
        
        // Set tourist info
        const touristName = document.getElementById('touristName');
        const touristIdNumber = document.getElementById('touristIdNumber');
        const touristNationality = document.getElementById('touristNationality');
        const idIssueDate = document.getElementById('idIssueDate');
        const idExpiryDate = document.getElementById('idExpiryDate');
        
        if (touristName) touristName.textContent = data.fullName || "Not Available";
        if (touristIdNumber) touristIdNumber.textContent = data.id || "Not Available";
        if (touristNationality) touristNationality.textContent = data.nationality || "Not Available";
        if (idIssueDate) idIssueDate.textContent = formatDate(data.issueDate) || "Not Available";
        if (idExpiryDate) idExpiryDate.textContent = formatDate(data.expiryDate) || "Not Available";
        
        // Check if ID is expired
        if (data.expiryDate) {
            const expiry = new Date(data.expiryDate);
            const now = new Date();
            
            if (expiry < now) {
                // Show expired status
                const statusIcon = document.querySelector('.status-icon i');
                const statusText = document.querySelector('.status-text h4');
                
                if (statusIcon) {
                    statusIcon.className = "fas fa-exclamation-circle";
                    statusIcon.style.color = "var(--warning-color)";
                }
                
                if (statusText) {
                    statusText.textContent = "Expired";
                }
            }
        }
    }
}

/**
 * Generate Digital ID
 */
async function generateDigitalID() {
    const name = document.getElementById('touristName').value.trim();
    const passport = document.getElementById('passportNumber').value.trim();
    const nationality = document.getElementById('nationality').value.trim();
    const dob = document.getElementById('dateOfBirth').value;
    const contact = document.getElementById('contactNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!name || !passport || !nationality || !dob) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please log in to create digital ID', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#digitalIdForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Digital ID...';
        submitBtn.disabled = true;

        // First try to get from API
        try {
            const response = await fetch('http://localhost:3000/api/digital-id', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: name,
                    nationality: nationality,
                    passportNumber: passport,
                    dateOfBirth: dob,
                    contactNumber: contact,
                    email: email
                })
            });

            if (response.ok) {
                const result = await response.json();
                const digitalIdData = result.data;
                updateIDPreview(digitalIdData, name, nationality, dob);
                return;
            }
        } catch (error) {
            console.warn("API call failed, falling back to client-side generation", error);
            // Continue with client-side generation
        }

        // Client-side fallback for QR code generation
        const digitalIdData = generateDigitalIDLocally(name, passport, nationality, dob);
        updateIDPreview(digitalIdData, name, nationality, dob);
        
    } catch (error) {
        console.error('Error creating digital ID:', error);
        showNotification('Error while creating digital ID', 'error');
    } finally {
        // Reset button state
        const submitBtn = document.querySelector('#digitalIdForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Generate Digital ID';
            submitBtn.disabled = false;
        }
    }
}

/**
 * Generate Digital ID locally (client-side fallback)
 */
function generateDigitalIDLocally(name, passport, nationality, dob) {
    // Generate a unique ID
    const uniqueId = 'KV-' + Date.now().toString().slice(-8);
    
    // Generate a mock blockchain hash
    const blockchainHash = '0x' + Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Set issue date to today
    const issueDate = new Date();
    
    // Set expiry date to 1 year from now
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Create digital ID data
    const digitalIdData = {
        digitalId: uniqueId,
        blockchainHash: blockchainHash,
        fullName: name,
        nationality: nationality,
        passportNumber: passport,
        issueDate: issueDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        status: 'active'
    };
    
    // Store digital ID data
    localStorage.setItem('digitalId', JSON.stringify(digitalIdData));
    
    return digitalIdData;
}

/**
 * Update ID Preview with data
 */
function updateIDPreview(digitalIdData, name, nationality, dob) {
    // Update ID preview with real data
    document.getElementById('idName').textContent = name;
    document.getElementById('idPassport').textContent = `ID: ${digitalIdData.digitalId}`;
    document.getElementById('idNationality').textContent = nationality;
    document.getElementById('idDob').textContent = formatDate(dob);
    
    // Set issue date and expiry date
    const issueDate = new Date(digitalIdData.issueDate);
    const expiryDate = new Date(digitalIdData.expiryDate);
    
    document.getElementById('idIssueDate').textContent = formatDate(issueDate);
    document.getElementById('idValidUntil').textContent = formatDate(expiryDate);
    
    // Generate QR code
    generateQRCode(digitalIdData);
    
    showNotification('Digital ID created successfully!', 'success');
}

/**
 * Generate QR Code
 */
function generateQRCode(digitalIdData) {
    const qrCode = document.getElementById('qrCode');
    if (!qrCode) return;
    
    qrCode.innerHTML = '';
    
    // If we have a QR code from the backend, use it
    if (digitalIdData.qrCode) {
        const img = document.createElement('img');
        img.src = digitalIdData.qrCode;
        img.style.width = '100px';
        img.style.height = '100px';
        qrCode.appendChild(img);
        return;
    }
    
    // Otherwise generate one client-side
    const qrData = {
        id: digitalIdData.digitalId,
        hash: digitalIdData.blockchainHash,
        fullName: digitalIdData.fullName,
        nationality: digitalIdData.nationality,
        passportNumber: digitalIdData.passportNumber,
        issueDate: digitalIdData.issueDate,
        expiryDate: digitalIdData.expiryDate,
        status: digitalIdData.status
    };
    
    // Generate QR code
    QRCode.toCanvas(qrCode, JSON.stringify(qrData), function(error) {
        if (error) {
            console.error('QR Code error:', error);
            showNotification('Failed to generate QR code', 'error');
        }
    });
}

/**
 * Load existing digital ID
 */
async function loadDigitalID() {
    try {
        // First try to get from localStorage
        const storedDigitalId = localStorage.getItem('digitalId');
        if (storedDigitalId) {
            const digitalIdData = JSON.parse(storedDigitalId);
            updateIDPreview(digitalIdData, digitalIdData.fullName, digitalIdData.nationality, '');
            return;
        }
        
        // If not in localStorage, try to get from API
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/digital-id', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const result = await response.json();
            const digitalIdData = result.data;
            updateIDPreview(digitalIdData, digitalIdData.fullName, digitalIdData.nationality, '');
        }
    } catch (error) {
        console.error('Error loading digital ID:', error);
    }
}

/**
 * Initialize buttons
 */
function initButtons() {
    // Download button
    const downloadBtn = document.getElementById('downloadId');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadDigitalID);
    }
    
    // Share button
    const shareBtn = document.getElementById('shareId');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareDigitalID);
    }
    
    // Regenerate button
    const regenerateBtn = document.getElementById('regenerateQR');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', regenerateQRCode);
    }
    
    // Verify button
    const verifyBtn = document.getElementById('verifyQR');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', openVerificationPage);
    }
}

/**
 * Download Digital ID
 */
function downloadDigitalID() {
    try {
        const digitalIdData = JSON.parse(localStorage.getItem('digitalId') || '{}');
        if (!digitalIdData.digitalId) {
            showNotification('No digital ID found. Please create one first.', 'error');
            return;
        }

        const idCard = document.querySelector('.digital-id-card');
        if (!idCard) {
            showNotification('Digital ID card not found', 'error');
            return;
        }

        html2canvas(idCard).then(canvas => {
            const link = document.createElement('a');
            link.download = `digital-id-${digitalIdData.digitalId}.png`;
            link.href = canvas.toDataURL();
            link.click();
            showNotification('Digital ID downloaded successfully!', 'success');
        }).catch(error => {
            console.error('Download error:', error);
            showNotification('Failed to download Digital ID', 'error');
        });
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to download Digital ID', 'error');
    }
}

/**
 * Share Digital ID
 */
function shareDigitalID() {
    const digitalIdData = JSON.parse(localStorage.getItem('digitalId') || '{}');
    if (!digitalIdData.digitalId) {
        showNotification('No digital ID found. Please create one first.', 'error');
        return;
    }

    if (navigator.share) {
        navigator.share({
            title: 'My Digital ID - Kavach360',
            text: `Digital ID: ${digitalIdData.digitalId}`,
            url: window.location.href
        }).then(() => {
            showNotification('Digital ID shared successfully!', 'success');
        }).catch(error => {
            console.error('Share error:', error);
            // Fallback to copy to clipboard
            copyToClipboard();
        });
    } else {
        // Fallback to copy to clipboard
        copyToClipboard();
    }
}

/**
 * Copy to clipboard fallback
 */
function copyToClipboard() {
    const digitalIdData = JSON.parse(localStorage.getItem('digitalId') || '{}');
    const text = `Digital ID: ${digitalIdData.digitalId}\nBlockchain Hash: ${digitalIdData.blockchainHash}\nIssue Date: ${formatDate(digitalIdData.issueDate)}`;
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Digital ID information copied to clipboard!', 'success');
    }).catch(error => {
        console.error('Copy error:', error);
        showNotification('Failed to copy Digital ID information', 'error');
    });
}

/**
 * Regenerate QR Code
 */
async function regenerateQRCode() {
    try {
        const digitalIdData = JSON.parse(localStorage.getItem('digitalId') || '{}');
        if (!digitalIdData.digitalId) {
            showNotification('No digital ID found. Please create one first.', 'error');
            return;
        }

        // Try to regenerate from API first
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:3000/api/digital-id/regenerate-qr', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success') {
                        // Update QR code
                        const qrCode = document.getElementById('qrCode');
                        if (qrCode) {
                            qrCode.innerHTML = '';
                            if (data.data.qrCode) {
                                const img = document.createElement('img');
                                img.src = data.data.qrCode;
                                img.style.width = '100px';
                                img.style.height = '100px';
                                qrCode.appendChild(img);
                            } else {
                                QRCode.toCanvas(qrCode, data.data.qrData, function(error) {
                                    if (error) console.error('QR Code error:', error);
                                });
                            }
                            showNotification('QR code regenerated successfully!', 'success');
                            return;
                        }
                    }
                }
            } catch (error) {
                console.warn('API regeneration failed, falling back to client-side', error);
                // Continue with client-side regeneration
            }
        }

        // Client-side fallback
        generateQRCode(digitalIdData);
        showNotification('QR code regenerated successfully!', 'success');
        
    } catch (error) {
        console.error('Error regenerating QR code:', error);
        showNotification('Failed to regenerate QR code', 'error');
    }
}

/**
 * Open verification page
 */
function openVerificationPage() {
    window.open('verify.html', '_blank');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid date
    }
    
    return date.toLocaleDateString();
}
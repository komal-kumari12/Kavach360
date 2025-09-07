// Multilingual support for Tourism Safety Dashboard

// Import translations
import translations from './translations.js';

// Default language
let currentLanguage = localStorage.getItem('preferredLanguage') || 'en';

// Initialize language selector
function initLanguageSelector() {
    // Create language selector in header if it doesn't exist
    if (!document.getElementById('languageSelector')) {
        const header = document.querySelector('.dashboard-header .header-actions');
        if (header) {
            // Create language selector dropdown
            const languageSelector = document.createElement('div');
            languageSelector.className = 'language-selector';
            languageSelector.innerHTML = `
                <button class="language-button">
                    <i class="fas fa-globe"></i>
                    <span>${currentLanguage.toUpperCase()}</span>
                </button>
                <div class="language-dropdown">
                    <a href="#" data-lang="en">English</a>
                    <a href="#" data-lang="hi">हिन्दी</a>
                    <a href="#" data-lang="bn">বাংলা</a>
                    <a href="#" data-lang="ta">தமிழ்</a>
                </div>
            `;
            
            // Insert before the last child (assuming notification bell is last)
            header.insertBefore(languageSelector, header.lastChild);
            
            // Add event listeners to language options
            const languageOptions = languageSelector.querySelectorAll('.language-dropdown a');
            languageOptions.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.preventDefault();
                    const lang = this.getAttribute('data-lang');
                    changeLanguage(lang);
                });
            });
            
            // Toggle dropdown
            const languageButton = languageSelector.querySelector('.language-button');
            languageButton.addEventListener('click', function() {
                languageSelector.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!languageSelector.contains(e.target)) {
                    languageSelector.classList.remove('active');
                }
            });
        }
    }
    
    // Apply current language
    applyTranslations();
}

// Change language
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        
        // Update language button text
        const languageButton = document.querySelector('.language-button span');
        if (languageButton) {
            languageButton.textContent = lang.toUpperCase();
        }
        
        // Apply translations
        applyTranslations();
        
        // Show notification
        showNotification('Language changed successfully', 'success');
    }
}

// Apply translations to the page
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
    
    // Update placeholders
    const inputElements = document.querySelectorAll('[data-i18n-placeholder]');
    inputElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.placeholder = translations[currentLanguage][key];
        }
    });
    
    // Update buttons
    const buttonElements = document.querySelectorAll('button[data-i18n-value]');
    buttonElements.forEach(element => {
        const key = element.getAttribute('data-i18n-value');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.value = translations[currentLanguage][key];
        }
    });
}

// Voice recognition for emergency commands
let recognition;
let isListening = false;

// Initialize voice recognition
function initVoiceRecognition() {
    // Create voice command button in header
    const header = document.querySelector('.dashboard-header .header-actions');
    if (header) {
        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-command-button';
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.setAttribute('title', 'Emergency Voice Commands');
        
        // Insert before language selector
        const languageSelector = document.querySelector('.language-selector');
        if (languageSelector) {
            header.insertBefore(voiceButton, languageSelector);
        } else {
            header.insertBefore(voiceButton, header.lastChild);
        }
        
        // Add click event
        voiceButton.addEventListener('click', toggleVoiceRecognition);
        
        // Add help button
        const helpButton = document.createElement('button');
        helpButton.className = 'voice-help-button';
        helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
        helpButton.setAttribute('title', 'Voice Command Help');
        
        header.insertBefore(helpButton, voiceButton.nextSibling);
        
        // Add click event for help
        helpButton.addEventListener('click', showVoiceCommandHelp);
    }
    
    // Check if browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Set language based on current UI language
        recognition.lang = currentLanguage === 'en' ? 'en-US' : 
                          currentLanguage === 'hi' ? 'hi-IN' : 
                          currentLanguage === 'bn' ? 'bn-IN' : 
                          currentLanguage === 'ta' ? 'ta-IN' : 'en-US';
        
        // Handle results
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            processVoiceCommand(transcript);
        };
        
        recognition.onend = function() {
            isListening = false;
            const voiceButton = document.querySelector('.voice-command-button');
            if (voiceButton) {
                voiceButton.classList.remove('listening');
            }
        };
        
        recognition.onerror = function(event) {
            isListening = false;
            const voiceButton = document.querySelector('.voice-command-button');
            if (voiceButton) {
                voiceButton.classList.remove('listening');
            }
            console.error('Speech recognition error', event.error);
        };
    }
}

// Toggle voice recognition
function toggleVoiceRecognition() {
    if (!recognition) {
        showNotification(translations[currentLanguage]['voice_not_supported'] || 'Voice recognition not supported in your browser', 'error');
        return;
    }
    
    const voiceButton = document.querySelector('.voice-command-button');
    
    if (isListening) {
        recognition.stop();
        isListening = false;
        voiceButton.classList.remove('listening');
    } else {
        recognition.start();
        isListening = true;
        voiceButton.classList.add('listening');
        showNotification(translations[currentLanguage]['listening'] || 'Listening...', 'info');
    }
}

// Process voice commands
function processVoiceCommand(command) {
    console.log('Voice command:', command);
    
    // Emergency commands in different languages
    const helpCommands = ['help', 'मदद', 'সাহায্য', 'உதவி'];
    const policeCommands = ['police', 'पुलिस', 'পুলিশ', 'காவல்'];
    const medicalCommands = ['medical', 'मेडिकल', 'মেডিকেল', 'மருத்துவம்'];
    const sosCommands = ['sos', 'एसओएस', 'এসওএস', 'எஸ்ஓஎஸ்'];
    
    // Check for emergency commands
    if (helpCommands.some(cmd => command.includes(cmd))) {
        triggerEmergencyResponse('help');
    } else if (policeCommands.some(cmd => command.includes(cmd))) {
        triggerEmergencyResponse('police');
    } else if (medicalCommands.some(cmd => command.includes(cmd))) {
        triggerEmergencyResponse('medical');
    } else if (sosCommands.some(cmd => command.includes(cmd))) {
        triggerEmergencyResponse('sos');
    }
}

// Trigger emergency response
function triggerEmergencyResponse(type) {
    // Show emergency UI
    const emergencyOverlay = document.createElement('div');
    emergencyOverlay.className = 'emergency-overlay';
    
    let message = '';
    let icon = '';
    
    switch (type) {
        case 'help':
            message = translations[currentLanguage]['emergency_activated'] || 'Emergency mode activated';
            icon = 'fa-hands-helping';
            break;
        case 'police':
            message = translations[currentLanguage]['police_alert'] || 'Police alert triggered';
            icon = 'fa-shield-alt';
            break;
        case 'medical':
            message = translations[currentLanguage]['medical_help'] || 'Medical help requested';
            icon = 'fa-ambulance';
            break;
        case 'sos':
            message = translations[currentLanguage]['sos_triggered'] || 'SOS signal sent to all nearby authorities';
            icon = 'fa-exclamation-triangle';
            break;
    }
    
    emergencyOverlay.innerHTML = `
        <div class="emergency-content">
            <div class="emergency-icon">
                <i class="fas ${icon}"></i>
            </div>
            <h2>${message}</h2>
            <p>${translations[currentLanguage]['contacting_authorities'] || 'Contacting authorities...'}</p>
            <div class="emergency-actions">
                <button class="btn btn-primary emergency-close">${translations[currentLanguage]['cancel'] || 'Cancel'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(emergencyOverlay);
    
    // Add close event
    emergencyOverlay.querySelector('.emergency-close').addEventListener('click', function() {
        document.body.removeChild(emergencyOverlay);
    });
    
    // Create an alert
    if (window.createTestAlert) {
        const alertData = {
            type: type === 'sos' ? 'danger' : type === 'police' ? 'warning' : 'info',
            title: `Emergency ${type.toUpperCase()} triggered`,
            location: 'Current location',
            tourist_id: 'EMERGENCY',
            timestamp: new Date().toISOString()
        };
        
        // Add to alerts table if function exists
        if (typeof addAlertToTable === 'function') {
            addAlertToTable(alertData);
        }
    }
}

// Show voice command help modal
function showVoiceCommandHelp() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${translations[currentLanguage]['voice_command_help'] || 'Voice Command Help'}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <h4>${translations[currentLanguage]['available_commands'] || 'Available Commands'}</h4>
                <ul class="voice-commands-list">
                    <li>
                        <i class="fas fa-hands-helping"></i>
                        <span>${translations[currentLanguage]['command_help'] || 'Say "Help" for emergency assistance'}</span>
                    </li>
                    <li>
                        <i class="fas fa-shield-alt"></i>
                        <span>${translations[currentLanguage]['command_police'] || 'Say "Police" to contact local police'}</span>
                    </li>
                    <li>
                        <i class="fas fa-ambulance"></i>
                        <span>${translations[currentLanguage]['command_medical'] || 'Say "Medical" for medical emergency'}</span>
                    </li>
                    <li>
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>${translations[currentLanguage]['command_sos'] || 'Say "SOS" to trigger emergency alert'}</span>
                    </li>
                </ul>
                <div class="note">
                    <p><i class="fas fa-info-circle"></i> These commands work in all supported languages (English, Hindi, Bengali, Tamil)</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button
    modal.querySelector('.modal-close').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Initialize multilingual support
document.addEventListener('DOMContentLoaded', function() {
    initLanguageSelector();
    initVoiceRecognition();
});

// Export functions for use in other modules
export { 
    changeLanguage, 
    applyTranslations, 
    initLanguageSelector, 
    initVoiceRecognition,
    toggleVoiceRecognition,
    showVoiceCommandHelp
};
// Translations for multilingual support
const translations = {
    'en': {
        // Navigation
        'nav_dashboard': 'Dashboard',
        'nav_digital_id': 'Digital Tourist ID',
        'nav_geofencing': 'Geofencing',
        'nav_alerts': 'Alerts',
        'nav_anomalies': 'Anomalies',
        'nav_efir': 'E-FIR',
        'nav_settings': 'Settings',
        
        // Dashboard
        'dashboard_title': 'Tourism Safety Dashboard',
        'dashboard_welcome': 'Welcome to the Tourism Safety Management System',
        'safety_score': 'Safety Score',
        'active_tourists': 'Active Tourists',
        'safe_zones': 'Safe Zones',
        'alerts_today': 'Alerts Today',
        
        // Digital ID
        'digital_id_title': 'Digital Tourist ID',
        'generate_id': 'Generate New ID',
        'tourist_name': 'Tourist Name',
        'nationality': 'Nationality',
        'passport': 'Passport/ID Number',
        'contact': 'Contact Number',
        'emergency_contact': 'Emergency Contact',
        'accommodation': 'Accommodation',
        'visit_duration': 'Visit Duration',
        'generate_button': 'Generate ID',
        'download_qr': 'Download QR Code',
        'share_id': 'Share ID',
        'regenerate': 'Regenerate',
        'recent_ids': 'Recently Generated IDs',
        
        // Geofencing
        'geofencing_title': 'Geofencing Management',
        'add_zone': 'Add Safe Zone',
        'zone_name': 'Zone Name',
        'zone_type': 'Zone Type',
        'coordinates': 'Coordinates',
        'radius': 'Radius (meters)',
        'save_zone': 'Save Zone',
        'cancel': 'Cancel',
        'search_zones': 'Search zones...',
        
        // Alerts
        'alerts_title': 'Alert Management',
        'alert_id': 'Alert ID',
        'alert_type': 'Type',
        'alert_status': 'Status',
        'alert_location': 'Location',
        'alert_time': 'Time',
        'alert_actions': 'Actions',
        'mark_read': 'Mark as Read',
        'mark_unread': 'Mark as Unread',
        'respond': 'Respond',
        'response_notes': 'Response Notes',
        'update_status': 'Update Status',
        'submit': 'Submit',
        
        // Anomalies
        'anomalies_title': 'Anomaly Detection',
        'anomaly_type': 'Anomaly Type',
        'confidence': 'Confidence',
        'detected_at': 'Detected At',
        'view_details': 'View Details',
        
        // E-FIR
        'efir_title': 'E-FIR Generation',
        'missing_person': 'Missing Person',
        'incident_report': 'Incident Report',
        'emergency_help': 'Emergency Help',
        'person_name': 'Person Name',
        'age': 'Age',
        'gender': 'Gender',
        'last_seen': 'Last Seen Location',
        'description': 'Description',
        'submit_efir': 'Submit E-FIR',
        
        // Notifications
        'notification_success': 'Success',
        'notification_error': 'Error',
        'notification_info': 'Information',
        
        // Emergency Voice Commands
        'voice_command_help': 'Voice Command Help',
        'available_commands': 'Available Commands',
        'command_help': 'Say "Help" for emergency assistance',
        'command_police': 'Say "Police" to contact local police',
        'command_medical': 'Say "Medical" for medical emergency',
        'command_sos': 'Say "SOS" to trigger emergency alert',
        'listening': 'Listening...',
        'voice_not_supported': 'Voice recognition not supported in your browser',
        'emergency_activated': 'Emergency mode activated',
        'contacting_authorities': 'Contacting authorities...',
        'medical_help': 'Medical help requested',
        'police_alert': 'Police alert triggered',
        'sos_triggered': 'SOS signal sent to all nearby authorities'
    },
    'hi': {
        // Navigation
        'nav_dashboard': 'डैशबोर्ड',
        'nav_digital_id': 'डिजिटल पर्यटक आईडी',
        'nav_geofencing': 'जियोफेंसिंग',
        'nav_alerts': 'अलर्ट',
        'nav_anomalies': 'असामान्यताएं',
        'nav_efir': 'ई-एफआईआर',
        'nav_settings': 'सेटिंग्स',
        
        // Dashboard
        'dashboard_title': 'पर्यटन सुरक्षा डैशबोर्ड',
        'dashboard_welcome': 'पर्यटन सुरक्षा प्रबंधन प्रणाली में आपका स्वागत है',
        'safety_score': 'सुरक्षा स्कोर',
        'active_tourists': 'सक्रिय पर्यटक',
        'safe_zones': 'सुरक्षित क्षेत्र',
        'alerts_today': 'आज के अलर्ट',
        
        // Digital ID
        'digital_id_title': 'डिजिटल पर्यटक आईडी',
        'generate_id': 'नई आईडी जनरेट करें',
        'tourist_name': 'पर्यटक का नाम',
        'nationality': 'राष्ट्रीयता',
        'passport': 'पासपोर्ट/आईडी नंबर',
        'contact': 'संपर्क नंबर',
        'emergency_contact': 'आपातकालीन संपर्क',
        'accommodation': 'आवास',
        'visit_duration': 'यात्रा अवधि',
        'generate_button': 'आईडी जनरेट करें',
        'download_qr': 'क्यूआर कोड डाउनलोड करें',
        'share_id': 'आईडी शेयर करें',
        'regenerate': 'पुनः जनरेट करें',
        'recent_ids': 'हाल ही में जनरेट की गई आईडी',
        
        // Geofencing
        'geofencing_title': 'जियोफेंसिंग प्रबंधन',
        'add_zone': 'सुरक्षित क्षेत्र जोड़ें',
        'zone_name': 'क्षेत्र का नाम',
        'zone_type': 'क्षेत्र का प्रकार',
        'coordinates': 'निर्देशांक',
        'radius': 'त्रिज्या (मीटर)',
        'save_zone': 'क्षेत्र सहेजें',
        'cancel': 'रद्द करें',
        'search_zones': 'क्षेत्र खोजें...',
        
        // Alerts
        'alerts_title': 'अलर्ट प्रबंधन',
        'alert_id': 'अलर्ट आईडी',
        'alert_type': 'प्रकार',
        'alert_status': 'स्थिति',
        'alert_location': 'स्थान',
        'alert_time': 'समय',
        'alert_actions': 'कार्रवाई',
        'mark_read': 'पढ़ा हुआ चिह्नित करें',
        'mark_unread': 'अपठित चिह्नित करें',
        'respond': 'प्रतिक्रिया दें',
        'response_notes': 'प्रतिक्रिया नोट्स',
        'update_status': 'स्थिति अपडेट करें',
        'submit': 'सबमिट करें',
        
        // Anomalies
        'anomalies_title': 'असामान्यता पहचान',
        'anomaly_type': 'असामान्यता प्रकार',
        'confidence': 'विश्वास स्तर',
        'detected_at': 'पहचाना गया',
        'view_details': 'विवरण देखें',
        
        // E-FIR
        'efir_title': 'ई-एफआईआर जनरेशन',
        'missing_person': 'लापता व्यक्ति',
        'incident_report': 'घटना रिपोर्ट',
        'emergency_help': 'आपातकालीन सहायता',
        'person_name': 'व्यक्ति का नाम',
        'age': 'उम्र',
        'gender': 'लिंग',
        'last_seen': 'आखिरी बार देखा गया स्थान',
        'description': 'विवरण',
        'submit_efir': 'ई-एफआईआर सबमिट करें',
        
        // Notifications
        'notification_success': 'सफलता',
        'notification_error': 'त्रुटि',
        'notification_info': 'जानकारी',
        
        // Emergency Voice Commands
        'voice_command_help': 'वॉयस कमांड सहायता',
        'available_commands': 'उपलब्ध कमांड',
        'command_help': 'आपातकालीन सहायता के लिए "मदद" कहें',
        'command_police': 'स्थानीय पुलिस से संपर्क करने के लिए "पुलिस" कहें',
        'command_medical': 'चिकित्सा आपातकाल के लिए "मेडिकल" कहें',
        'command_sos': 'आपातकालीन अलर्ट ट्रिगर करने के लिए "एसओएस" कहें',
        'listening': 'सुन रहा है...',
        'voice_not_supported': 'आपके ब्राउज़र में वॉयस रिकग्निशन समर्थित नहीं है',
        'emergency_activated': 'आपातकालीन मोड सक्रिय',
        'contacting_authorities': 'अधिकारियों से संपर्क किया जा रहा है...',
        'medical_help': 'चिकित्सा सहायता का अनुरोध किया गया',
        'police_alert': 'पुलिस अलर्ट ट्रिगर किया गया',
        'sos_triggered': 'एसओएस सिग्नल सभी निकटवर्ती अधिकारियों को भेजा गया'
    },
    'bn': {
        // Navigation
        'nav_dashboard': 'ড্যাশবোর্ড',
        'nav_digital_id': 'ডিজিটাল পর্যটক আইডি',
        'nav_geofencing': 'জিওফেন্সিং',
        'nav_alerts': 'সতর্কতা',
        'nav_anomalies': 'অস্বাভাবিকতা',
        'nav_efir': 'ই-এফআইআর',
        'nav_settings': 'সেটিংস',
        
        // Dashboard
        'dashboard_title': 'পর্যটন নিরাপত্তা ড্যাশবোর্ড',
        'dashboard_welcome': 'পর্যটন নিরাপত্তা ব্যবস্থাপনা সিস্টেমে স্বাগতম',
        'safety_score': 'নিরাপত্তা স্কোর',
        'active_tourists': 'সক্রিয় পর্যটক',
        'safe_zones': 'নিরাপদ অঞ্চল',
        'alerts_today': 'আজকের সতর্কতা',
        
        // Digital ID
        'digital_id_title': 'ডিজিটাল পর্যটক আইডি',
        'generate_id': 'নতুন আইডি তৈরি করুন',
        'tourist_name': 'পর্যটকের নাম',
        'nationality': 'জাতীয়তা',
        'passport': 'পাসপোর্ট/আইডি নম্বর',
        'contact': 'যোগাযোগের নম্বর',
        'emergency_contact': 'জরুরি যোগাযোগ',
        'accommodation': 'আবাসন',
        'visit_duration': 'ভ্রমণের সময়কাল',
        'generate_button': 'আইডি তৈরি করুন',
        'download_qr': 'QR কোড ডাউনলোড করুন',
        'share_id': 'আইডি শেয়ার করুন',
        'regenerate': 'পুনরায় তৈরি করুন',
        'recent_ids': 'সম্প্রতি তৈরি করা আইডি',
        
        // Geofencing
        'geofencing_title': 'জিওফেন্সিং ব্যবস্থাপনা',
        'add_zone': 'নিরাপদ অঞ্চল যোগ করুন',
        'zone_name': 'অঞ্চলের নাম',
        'zone_type': 'অঞ্চলের ধরন',
        'coordinates': 'স্থানাঙ্ক',
        'radius': 'ব্যাসার্ধ (মিটার)',
        'save_zone': 'অঞ্চল সংরক্ষণ করুন',
        'cancel': 'বাতিল করুন',
        'search_zones': 'অঞ্চল খুঁজুন...',
        
        // Alerts
        'alerts_title': 'সতর্কতা ব্যবস্থাপনা',
        'alert_id': 'সতর্কতা আইডি',
        'alert_type': 'ধরন',
        'alert_status': 'অবস্থা',
        'alert_location': 'অবস্থান',
        'alert_time': 'সময়',
        'alert_actions': 'পদক্ষেপ',
        'mark_read': 'পঠিত হিসাবে চিহ্নিত করুন',
        'mark_unread': 'অপঠিত হিসাবে চিহ্নিত করুন',
        'respond': 'প্রতিক্রিয়া জানান',
        'response_notes': 'প্রতিক্রিয়া নোট',
        'update_status': 'অবস্থা আপডেট করুন',
        'submit': 'জমা দিন',
        
        // Anomalies
        'anomalies_title': 'অস্বাভাবিকতা সনাক্তকরণ',
        'anomaly_type': 'অস্বাভাবিকতার ধরন',
        'confidence': 'আত্মবিশ্বাস',
        'detected_at': 'সনাক্ত করা হয়েছে',
        'view_details': 'বিস্তারিত দেখুন',
        
        // E-FIR
        'efir_title': 'ই-এফআইআর তৈরি',
        'missing_person': 'নিখোঁজ ব্যক্তি',
        'incident_report': 'ঘটনা রিপোর্ট',
        'emergency_help': 'জরুরি সাহায্য',
        'person_name': 'ব্যক্তির নাম',
        'age': 'বয়স',
        'gender': 'লিঙ্গ',
        'last_seen': 'সর্বশেষ দেখা গেছে',
        'description': 'বিবরণ',
        'submit_efir': 'ই-এফআইআর জমা দিন',
        
        // Notifications
        'notification_success': 'সফল',
        'notification_error': 'ত্রুটি',
        'notification_info': 'তথ্য',
        
        // Emergency Voice Commands
        'voice_command_help': 'ভয়েস কমান্ড সাহায্য',
        'available_commands': 'উপলব্ধ কমান্ড',
        'command_help': 'জরুরি সাহায্যের জন্য "সাহায্য" বলুন',
        'command_police': 'স্থানীয় পুলিশের সাথে যোগাযোগ করতে "পুলিশ" বলুন',
        'command_medical': 'চিকিৎসা জরুরি অবস্থার জন্য "মেডিকেল" বলুন',
        'command_sos': 'জরুরি সতর্কতা ট্রিগার করতে "এসওএস" বলুন',
        'listening': 'শুনছি...',
        'voice_not_supported': 'আপনার ব্রাউজারে ভয়েস রিকগনিশন সমর্থিত নয়',
        'emergency_activated': 'জরুরি মোড সক্রিয় করা হয়েছে',
        'contacting_authorities': 'কর্তৃপক্ষের সাথে যোগাযোগ করা হচ্ছে...',
        'medical_help': 'চিকিৎসা সাহায্য অনুরোধ করা হয়েছে',
        'police_alert': 'পুলিশ সতর্কতা ট্রিগার করা হয়েছে',
        'sos_triggered': 'এসওএস সিগন্যাল সকল কাছাকাছি কর্তৃপক্ষের কাছে পাঠানো হয়েছে'
    },
    'ta': {
        // Navigation
        'nav_dashboard': 'டாஷ்போர்டு',
        'nav_digital_id': 'டிஜிட்டல் சுற்றுலா அடையாளம்',
        'nav_geofencing': 'ஜியோஃபென்சிங்',
        'nav_alerts': 'எச்சரிக்கைகள்',
        'nav_anomalies': 'அசாதாரணங்கள்',
        'nav_efir': 'இ-எஃப்ஐஆர்',
        'nav_settings': 'அமைப்புகள்',
        
        // Dashboard
        'dashboard_title': 'சுற்றுலா பாதுகாப்பு டாஷ்போர்டு',
        'dashboard_welcome': 'சுற்றுலா பாதுகாப்பு மேலாண்மை அமைப்பிற்கு வரவேற்கிறோம்',
        'safety_score': 'பாதுகாப்பு மதிப்பெண்',
        'active_tourists': 'செயலில் உள்ள சுற்றுலா பயணிகள்',
        'safe_zones': 'பாதுகாப்பான மண்டலங்கள்',
        'alerts_today': 'இன்றைய எச்சரிக்கைகள்',
        
        // Digital ID
        'digital_id_title': 'டிஜிட்டல் சுற்றுலா அடையாளம்',
        'generate_id': 'புதிய அடையாளத்தை உருவாக்கு',
        'tourist_name': 'சுற்றுலா பயணியின் பெயர்',
        'nationality': 'தேசியம்',
        'passport': 'பாஸ்போர்ட்/அடையாள எண்',
        'contact': 'தொடர்பு எண்',
        'emergency_contact': 'அவசர தொடர்பு',
        'accommodation': 'தங்குமிடம்',
        'visit_duration': 'வருகை காலம்',
        'generate_button': 'அடையாளம் உருவாக்கு',
        'download_qr': 'QR குறியீட்டைப் பதிவிறக்கு',
        'share_id': 'அடையாளத்தைப் பகிர்',
        'regenerate': 'மீண்டும் உருவாக்கு',
        'recent_ids': 'சமீபத்தில் உருவாக்கப்பட்ட அடையாளங்கள்',
        
        // Geofencing
        'geofencing_title': 'ஜியோஃபென்சிங் மேலாண்மை',
        'add_zone': 'பாதுகாப்பான மண்டலம் சேர்',
        'zone_name': 'மண்டலப் பெயர்',
        'zone_type': 'மண்டல வகை',
        'coordinates': 'ஆயத்தொலைவுகள்',
        'radius': 'ஆரம் (மீட்டர்)',
        'save_zone': 'மண்டலத்தைச் சேமி',
        'cancel': 'ரத்து செய்',
        'search_zones': 'மண்டலங்களைத் தேடு...',
        
        // Alerts
        'alerts_title': 'எச்சரிக்கை மேலாண்மை',
        'alert_id': 'எச்சரிக்கை அடையாளம்',
        'alert_type': 'வகை',
        'alert_status': 'நிலை',
        'alert_location': 'இடம்',
        'alert_time': 'நேரம்',
        'alert_actions': 'செயல்கள்',
        'mark_read': 'படித்ததாகக் குறி',
        'mark_unread': 'படிக்காததாகக் குறி',
        'respond': 'பதிலளி',
        'response_notes': 'பதில் குறிப்புகள்',
        'update_status': 'நிலையைப் புதுப்பி',
        'submit': 'சமர்ப்பி',
        
        // Anomalies
        'anomalies_title': 'அசாதாரண கண்டறிதல்',
        'anomaly_type': 'அசாதாரண வகை',
        'confidence': 'நம்பகத்தன்மை',
        'detected_at': 'கண்டறியப்பட்ட நேரம்',
        'view_details': 'விவரங்களைக் காண்',
        
        // E-FIR
        'efir_title': 'இ-எஃப்ஐஆர் உருவாக்கம்',
        'missing_person': 'காணாமல் போன நபர்',
        'incident_report': 'சம்பவ அறிக்கை',
        'emergency_help': 'அவசர உதவி',
        'person_name': 'நபரின் பெயர்',
        'age': 'வயது',
        'gender': 'பாலினம்',
        'last_seen': 'கடைசியாகப் பார்த்த இடம்',
        'description': 'விளக்கம்',
        'submit_efir': 'இ-எஃப்ஐஆர் சமர்ப்பி',
        
        // Notifications
        'notification_success': 'வெற்றி',
        'notification_error': 'பிழை',
        'notification_info': 'தகவல்',
        
        // Emergency Voice Commands
        'voice_command_help': 'குரல் கட்டளை உதவி',
        'available_commands': 'கிடைக்கும் கட்டளைகள்',
        'command_help': 'அவசர உதவிக்கு "உதவி" என்று சொல்லுங்கள்',
        'command_police': 'உள்ளூர் காவல்துறையைத் தொடர்பு கொள்ள "காவல்" என்று சொல்லுங்கள்',
        'command_medical': 'மருத்துவ அவசரநிலைக்கு "மருத்துவம்" என்று சொல்லுங்கள்',
        'command_sos': 'அவசர எச்சரிக்கையைத் தூண்ட "எஸ்ஓஎஸ்" என்று சொல்லுங்கள்',
        'listening': 'கேட்கிறது...',
        'voice_not_supported': 'உங்கள் உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை',
        'emergency_activated': 'அவசரநிலை முறை செயல்படுத்தப்பட்டது',
        'contacting_authorities': 'அதிகாரிகளைத் தொடர்பு கொள்கிறது...',
        'medical_help': 'மருத்துவ உதவி கோரப்பட்டது',
        'police_alert': 'காவல்துறை எச்சரிக்கை தூண்டப்பட்டது',
        'sos_triggered': 'எஸ்ஓஎஸ் சிக்னல் அனைத்து அருகிலுள்ள அதிகாரிகளுக்கும் அனுப்பப்பட்டது'
    }
};

export default translations;
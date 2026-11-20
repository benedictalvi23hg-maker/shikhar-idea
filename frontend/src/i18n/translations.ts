export type SupportedLanguage = 'en' | 'hi' | 'ta'

export interface TranslationDict {
  [key: string]: {
    en: string
    hi: string
    ta: string
  }
}

export const translations: TranslationDict = {
  // Navigation / Pages
  'nav.dashboard': {
    en: 'Command Dashboard',
    hi: 'कमांड डैशबोर्ड',
    ta: 'கட்டுப்பாட்டு பலகை'
  },
  'nav.liveMap': {
    en: 'Live Logistics Map',
    hi: 'लाइव लॉजिस्टिक्स मैप',
    ta: 'நேரடி வரைபடம்'
  },
  'nav.inventory': {
    en: 'Smart Inventory',
    hi: 'स्मार्ट इन्वेंटरी (सामग्री भंडार)',
    ta: 'சரக்கு மேலாண்மை'
  },
  'nav.forecast': {
    en: 'AI Demand Forecast',
    hi: 'एआई मांग पूर्वानुमान',
    ta: 'AI தேவை கணிப்பு'
  },
  'nav.freshness': {
    en: 'Freshness & Expiry Monitor',
    hi: 'ताजगी एवं समाप्ति निगरानी',
    ta: 'புத்துணர்ச்சி மற்றும் காலாவதி'
  },
  'nav.isolation': {
    en: 'Winter Emergency Stock',
    hi: 'शीतकालीन आपातकालीन स्टॉक',
    ta: 'குளிர்கால அவசர இருப்பு'
  },
  'nav.warehouses': {
    en: 'All Warehouses & Depots',
    hi: 'सभी गोदाम एवं डिपो',
    ta: 'அனைத்து கிடங்குகள்'
  },
  'nav.transportation': {
    en: 'Convoy & Route Intel',
    hi: 'काफिला एवं मार्ग निगरानी',
    ta: 'வாகன அணிவகுப்பு மற்றும் வழி'
  },
  'nav.weather': {
    en: 'Climate & Weather Pass',
    hi: 'मौसम एवं दर्रा स्थिति',
    ta: 'வானிலை மற்றும் கணவாய் தகவல்'
  },
  'nav.suppliers': {
    en: 'Suppliers & Vendors',
    hi: 'आपूर्तिकर्ता एवं विक्रेता',
    ta: 'வழங்குநர்கள் மற்றும் சப்ளையர்கள்'
  },
  'nav.assistant': {
    en: 'AI Tactical Assistant',
    hi: 'एआई सामरिक सहायक',
    ta: 'AI ராணுவ உதவியாளர்'
  },
  'nav.challengerAi': {
    en: 'AI Recommendation Check',
    hi: 'एआई सिफारिश सत्यापन',
    ta: 'AI பரிந்துரை சரிபார்ப்பு'
  },
  'nav.digitalTwin': {
    en: 'Scenario Simulation',
    hi: 'परिदृश्य अनुकरण (सिमुलेशन)',
    ta: 'சூழ்நிலை மாதிரி உருவகப்படுத்துதல்'
  },
  'nav.iotOffline': {
    en: 'Offline Safe Mode',
    hi: 'ऑफ़लाइन सुरक्षित मोड (बिना इंटरनेट)',
    ta: 'இணையமற்ற ஆஃப்லைன் பயன்முறை'
  },
  'nav.reports': {
    en: 'Reports & Analytics',
    hi: 'रिपोर्ट और विश्लेषण',
    ta: 'அறிக்கைகள் மற்றும் பகுப்பாய்வு'
  },
  'nav.admin': {
    en: 'Security & Access',
    hi: 'सुरक्षा एवं नियंत्रण',
    ta: 'பாதுகாப்பு மற்றும் அணுகல்'
  },

  // Header
  'header.platformName': {
    en: 'PROJECT SHIKHAR',
    hi: 'प्रोजेक्ट शिखर',
    ta: 'திட்டம் சிகார்'
  },
  'header.platformSubtitle': {
    en: 'Unified Logistics Command • Northern Command',
    hi: 'एकीकृत रसद कमान • उत्तरी कमान',
    ta: 'ஒருங்கிணைந்த ராணுவ விநியோகம் • வடக்கு கட்டளை'
  },
  'header.onlineStatus': {
    en: 'SATCOM ONLINE',
    hi: 'उपग्रह संपर्क सक्रिय (ऑनलाइन)',
    ta: 'சாட்டிலைட் ஆன்லைன்'
  },
  'header.offlineStatus': {
    en: 'OFFLINE SAFE MODE',
    hi: 'ऑफ़लाइन सुरक्षित मोड',
    ta: 'இணையமற்ற ஆஃப்லைன்'
  },
  'header.readinessScore': {
    en: 'Overall Readiness',
    hi: 'समग्र तत्परता',
    ta: 'ஒட்டுமொத்த தயார்நிலை'
  },
  'header.isolationRisk': {
    en: 'Isolation Risk',
    hi: 'अलगाव का जोखिम',
    ta: 'தனிமைப்படுத்தல் ஆபத்து'
  },
  'header.searchPlaceholder': {
    en: 'Search depot, product SKU, convoy...',
    hi: 'डिपो, उत्पाद कोड, काफिला खोजें...',
    ta: 'கிடங்கு, பொருள் குறியீடு, வாகனத்தை தேடுக...'
  },
  'header.logout': {
    en: 'Logout',
    hi: 'लॉग आउट',
    ta: 'வெளியேறு'
  },

  // Strategic Asset Allocation (Dashboard Section)
  'assetAllocation.title': {
    en: 'Strategic Asset Allocation',
    hi: 'रणनीतिक सामग्री वितरण (Asset Allocation)',
    ta: 'ராணுவ விநியோக பங்கீடு (Asset Allocation)'
  },
  'assetAllocation.subtitle': {
    en: 'Live Breakdown of Defense Supplies Across All Categories',
    hi: 'सभी श्रेणियों में रक्षा सामग्री का लाइव विवरण',
    ta: 'அனைத்து பிரிவுகளிலும் உள்ள பாதுகாப்பு பொருட்கள் விவரம்'
  },
  'assetAllocation.description': {
    en: 'Shows the exact proportion of each essential supply category currently stored across Northern Command depots. Higher allocation to Rations and Medical stores ensures full winter isolation survival.',
    hi: 'यह दर्शाता है कि उत्तरी कमान के सभी डिपो में प्रत्येक आवश्यक आपूर्ति श्रेणी का कितना अनुपात संग्रहित है। राशन और दवाओं का उच्च भंडारण शीतकालीन सुरक्षा सुनिश्चित करता है।',
    ta: 'வடக்கு கட்டளை கிடங்குகளில் சேமிக்கப்பட்டுள்ள ஒவ்வொரு அத்தியாவசிய பொருட்களின் சரியான விகிதத்தை இது காட்டுகிறது. உணவு மற்றும் மருத்துவப் பொருட்களின் இருப்பு பனிக்கால பாதுகாப்பை உறுதி செய்கிறது.'
  },
  'assetAllocation.medical': {
    en: 'Class VIII Medical & Blood Plasma',
    hi: 'चिकित्सा आपूर्ति एवं रक्त प्लाज्मा',
    ta: 'மருத்துவ பொருட்கள் & ரத்த பிளாஸ்மா'
  },
  'assetAllocation.rations': {
    en: 'High-Altitude Food Rations & MRE',
    hi: 'उच्च ऊंचाई वाले खाद्य राशन (MRE)',
    ta: 'உயரமான இடங்களுக்கான உணவு ரேஷன் (MRE)'
  },
  'assetAllocation.fuel': {
    en: 'Class III POL & Sub-Zero Diesel',
    hi: 'ईंधन एवं आर्कटिक डीजल (POL)',
    ta: 'எரிபொருள் & ஆர்க்டிக் டீசல் (POL)'
  },
  'assetAllocation.ammunition': {
    en: 'Class V Defense Ordnance & Ammo',
    hi: 'गोला-बारूद एवं रक्षा सामग्री',
    ta: 'வெடிமருந்து & பாதுகாப்பு தளவாடங்கள்'
  },
  'assetAllocation.clothing': {
    en: 'Extreme Cold Combat Gear',
    hi: 'अत्यधिक ठंड के सैन्य वस्त्र',
    ta: 'கடும் குளிர்கால ராணுவ உடைகள்'
  },
  'assetAllocation.general': {
    en: 'General Field Supplies',
    hi: 'सामान्य सैन्य आपूर्ति',
    ta: 'பொது களப் பொருட்கள்'
  },

  // KPI Dashboard Cards
  'kpi.activeWarehouses': {
    en: 'Active Depots Monitored',
    hi: 'सक्रिय डिपो निगरानी',
    ta: 'கண்காணிக்கப்படும் கிடங்குகள்'
  },
  'kpi.totalInventory': {
    en: 'Total Verified Inventory',
    hi: 'कुल सत्यापित भंडार',
    ta: 'சரிபார்க்கப்பட்ட மொத்த இருப்பு'
  },
  'kpi.daysOfSupply': {
    en: 'Safe Supply Days Left',
    hi: 'सुरक्षित आपूर्ति दिवस शेष',
    ta: 'பாதுகாப்பான இருப்பு நாட்கள்'
  },
  'kpi.spoilageRisk': {
    en: 'Average Freshness Risk',
    hi: 'औसत ताजगी जोखिम',
    ta: 'சராசரி கெட்டுப்போகும் ஆபத்து'
  },

  // Simplified Easy Names (replacing U1-U18 codes)
  'terms.u1': {
    en: 'Safe Supply Days',
    hi: 'सुरक्षित आपूर्ति दिवस',
    ta: 'பாதுகாப்பான இருப்பு நாட்கள்'
  },
  'terms.u3': {
    en: 'Days Until Expiry',
    hi: 'समाप्ति तक शेष दिन',
    ta: 'காலாவதி வரை உள்ள நாட்கள்'
  },
  'terms.u7': {
    en: 'Offline Safe Mode',
    hi: 'ऑफ़लाइन सुरक्षित मोड',
    ta: 'ஆஃப்லைன் பாதுகாப்பான முறை'
  },
  'terms.u9': {
    en: 'Sensor Accuracy Score',
    hi: 'सेंसर सटीकता स्कोर',
    ta: 'சென்சார் துல்லிய மதிப்பெண்'
  },
  'terms.u10': {
    en: 'Scenario Simulation',
    hi: 'परिदृश्य सिमुलेशन',
    ta: 'சூழ்நிலை உருவகப்படுத்துதல்'
  },
  'terms.u13': {
    en: 'Temperature Freshness Tracker',
    hi: 'तापमान एवं ताजगी ट्रैकर',
    ta: 'வெப்பநிலை புத்துணர்ச்சி கண்காணிப்பு'
  },
  'terms.u15': {
    en: 'Warehouse Capabilities',
    hi: 'गोदाम क्षमता एवं सुविधाएं',
    ta: 'கிடங்கு வசதிகள் மற்றும் திறன்'
  },
  'terms.u18': {
    en: 'AI Safety Check',
    hi: 'एआई सुरक्षा जांच',
    ta: 'AI பாதுகாப்பு சரிபார்ப்பு'
  }
}

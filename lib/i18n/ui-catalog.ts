/** English UI strings — sidebar, header, and shared forms */

export const UI_CATALOG = {

  "app.name": "AgriMind",

  "app.tagline": "Your AI Farming Partner From Seed To Harvest",

  "nav.dashboard": "Dashboard",

  "nav.crops": "My Crops",

  "nav.diagnosis": "AI Diagnosis",

  "nav.diagnosisHistory": "Diagnosis History",

  "nav.voice": "Voice Assistant",

  "nav.market": "Market Prices",

  "nav.sellProduct": "Sell Products",

  "nav.weather": "Weather",

  "nav.chat": "AI Chat",

  "nav.reminders": "Reminders",

  "nav.settings": "Settings",

  "nav.profile": "Profile",

  "nav.signOut": "Sign Out",

  "header.search": "Search crops, diseases, guides...",

  "search.pages": "Pages",

  "search.noResults": "No pages found — try Ask AI below",

  "search.ai": "AI",

  "search.askAi": "Ask AI",

  "search.phrase.disease": "Find tomato leaf disease help...",

  "search.phrase.voice": "Open voice assistant...",

  "search.phrase.market": "Search market prices...",

  "search.phrase.sell": "Sell your harvest...",

  "sell.title": "Sell Products",

  "sell.subtitle": "List your harvest and reach buyers across South Asia.",

  "sell.comingSoon": "Coming soon",

  "sell.message":
    "We are preparing product selling tools for AgriMind AI farmers. You will be able to list crops, set prices, and connect with buyers — all in one place.",

  "sell.updateNote": "This feature will be updated in a future release. Thank you for your patience.",

  "sell.useMarket": "Until then, use Market Prices to see wholesale rates and plan the best time to sell.",

  "sell.viewMarket": "View market prices",

  "header.notifications": "Notifications",

  "lang.english": "English",

  "lang.hindi": "हिन्दी",

  "lang.marathi": "मराठी",

  "common.loading": "Translating…",

  "common.translateError": "Translation unavailable. Showing English.",

  "common.saving": "Saving...",

  "auth.signedOut": "Signed out successfully",

  "crops.addTitle": "Add Crop",

  "crops.addSubtitle": "Register a new field or crop plot.",

  "crops.detailsTitle": "Crop details",

  "crops.fieldName": "Field name",

  "crops.cropType": "Crop type",

  "crops.stage": "Stage",

  "crops.health": "Health %",

  "crops.status": "Status",

  "crops.plantedDate": "Planted date",

  "crops.expectedHarvest": "Expected harvest",

  "crops.area": "Area",

  "crops.unit": "Unit",

  "crops.location": "Location",

  "crops.nextTask": "Next task",

  "crops.notes": "Notes",

  "crops.selectCrop": "Select crop",

  "crops.createCrop": "Create Crop",

  "crops.saveCrop": "Save Crop",

  "crops.fieldLocationPh": "Field location",

  "crops.nextTaskPh": "Apply fertilizer",

  "crops.status.healthy": "Healthy",

  "crops.status.warning": "Warning",

  "crops.status.critical": "Critical",

  "crops.unit.acres": "Acres",

  "crops.unit.hectares": "Hectares",

  "crops.unit.perches": "Perches",

  "crops.stage.preparation": "Preparation",

  "crops.stage.planting": "Planting",

  "crops.stage.growing": "Growing",

  "crops.stage.flowering": "Flowering",

  "crops.stage.fruiting": "Fruiting",

  "crops.stage.harvesting": "Harvesting",

  "crops.sampleCrops": "Add 5 sample crops",

  "crops.sampleCropsHint":
    "Loads realistic Sri Lankan plots (tomato, rice, onion, chili, coconut) with up-to-date dates.",

  "crops.sampleTemplates": "Or fill the form from a template:",

  "landing.features": "Features",

  "landing.howItWorks": "How It Works",

  "landing.crops": "Crops",

  "landing.testimonials": "Testimonials",

  "landing.signIn": "Sign In",

  "landing.getStarted": "Get Started",
  "dashboard.greetingMorning": "Good morning",
  "dashboard.greetingAfternoon": "Good afternoon",
  "dashboard.greetingEvening": "Good evening",
  "dashboard.welcomeSubtitle":
    "Your farm at a glance — weather, crops, prices, and quick actions in one place.",
  "dashboard.scanCrop.title": "Scan Crop",
  "dashboard.scanCrop.desc":
    "Take a photo — AI detects diseases and suggests treatments instantly.",
  "dashboard.scanCrop.cta": "Start diagnosis",
  "dashboard.askAi.title": "Ask AI",
  "dashboard.askAi.desc":
    "Speak or type in Hindi, Marathi, or English — get farming help in seconds.",
  "dashboard.askAi.cta": "Open voice assistant",
  "diagnosis.title": "AI Crop Diagnosis",
  "diagnosis.subtitle":
    "Upload a crop photo — get help with disease, pests, nutrients, and step-by-step treatment plans.",
  "diagnosis.viewHistory": "View History",
  "diagnosis.issueDetails": "Issue Details",
  "diagnosis.cropType": "Crop Type",
  "diagnosis.selectCrop": "Select crop type",
  "diagnosis.otherCropPh": "Type crop name (optional)",
  "diagnosis.describeProblem": "Describe the Problem",
  "diagnosis.analyze": "Analyze with AI",
  "diagnosis.analyzing": "Analyzing...",
  "diagnosis.newDiagnosis": "New Diagnosis",
  "diagnosis.notPlantTitle": "Not a plant photo",
  "diagnosis.notPlantHint":
    "Please upload a clear photo of your crop — leaves, stems, or fruit in natural light.",
  "diagnosis.causeAnalysis": "Cause Analysis",
  "diagnosis.symptoms": "Identified Symptoms",
  "diagnosis.treatment": "AI Treatment Plan",
  "diagnosis.prevention": "Prevention Tips",
  "diagnosis.recovery": "Recovery Info",
  "diagnosis.estimatedRecovery": "Estimated Recovery",
  "diagnosis.treatmentCost": "Treatment Cost",
  "diagnosis.recoveryOutlook": "Recovery Outlook",
  "diagnosis.irrigation": "Irrigation & Water Management",
  "diagnosis.followUp": "Follow-up & Monitoring",
  "diagnosis.videos": "Video Tutorials",
  "diagnosis.severity": "Severity",
  "diagnosis.confidence": "Confidence",
  "diagnosis.translating": "Translating report…",

} as const



export type UiCatalogKey = keyof typeof UI_CATALOG



export const UI_CATALOG_KEYS = Object.keys(UI_CATALOG) as UiCatalogKey[]



/** Sidebar / shell navigation */

export const SHELL_NAV_ITEMS = [

  { key: "nav.dashboard" as const, href: "/dashboard", icon: "dashboard" },

  { key: "nav.crops" as const, href: "/dashboard/crops", icon: "crops" },

  { key: "nav.diagnosis" as const, href: "/dashboard/diagnosis", icon: "diagnosis" },

  {

    key: "nav.diagnosisHistory" as const,

    href: "/dashboard/diagnosis/history",

    icon: "history",

  },

  { key: "nav.voice" as const, href: "/dashboard/voice", icon: "voice" },

  { key: "nav.market" as const, href: "/dashboard/market", icon: "market" },

  { key: "nav.sellProduct" as const, href: "/dashboard/sell", icon: "sell" },

  { key: "nav.weather" as const, href: "/dashboard/weather", icon: "weather" },

  { key: "nav.chat" as const, href: "/dashboard/chat", icon: "chat" },

  { key: "nav.reminders" as const, href: "/dashboard/reminders", icon: "reminders" },

] as const



export const SHELL_BOTTOM_NAV_ITEMS = [

  { key: "nav.settings" as const, href: "/dashboard/settings", icon: "settings" },

  { key: "nav.profile" as const, href: "/dashboard/profile", icon: "profile" },

] as const



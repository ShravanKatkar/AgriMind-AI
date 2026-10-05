/** Static site map and feature docs for the website help chatbot */

export const SITE_HELP_OVERVIEW = `
AgriMind AI is an intelligent farming platform for Indian farmers.
Tagline: "Your AI Farming Partner From Seed To Harvest".

Public site:
- Home (/) — landing with Features, How It Works, supported Crops, Market preview, Testimonials, FAQ, Sign In / Get Started
- Login (/login) — farmer sign in and sign up (Firebase auth)

Farmer dashboard (requires login):
- /dashboard — overview, quick actions (diagnosis, voice, market)
- /dashboard/crops — manage crop fields and lifecycle
- /dashboard/crops/new — add a new crop
- /dashboard/crops/[id] — crop details and events
- /dashboard/diagnosis — upload crop photo for AI disease analysis (OpenAI Vision)
- /dashboard/diagnosis/history — past diagnosis reports
- /dashboard/voice — voice assistant (Hindi, Marathi, English)
- /dashboard/chat — text AI farming chat (OpenAI)
- /dashboard/market — Indian APMC wholesale crop prices and AI insights
- /dashboard/weather — weather forecasts for Indian cities and farming advice
- /dashboard/reminders — treatment and farming reminders
- /dashboard/settings — account and app settings
- /dashboard/profile — farmer profile

Admin panel (officers only):
- /admin/login — admin sign in
- /admin — dashboard stats
- /admin/farmers, /admin/reports, /admin/analytics, /admin/notifications, /admin/officers, /admin/ai-monitor

Supported crops: Rice, Wheat, Soybean, Cotton, Tomato, Chili, Onion, Banana, Corn, Sugarcane.
Languages: English, Hindi (हिन्दी), Marathi (मराठी) — UI translation and voice/chat.

Key features:
1. AI Diagnosis — photo upload, GPT-4o vision, treatment plans, PDF export
2. Voice Assistant — speak questions, get spoken answers in Hindi, Marathi, English
3. AI Chat — typed farming Q&A
4. Market Prices — wholesale APMC Mandi prices in India (₹/quintal, ₹/kg)
5. Weather — Indian city forecasts with AI farming tips (Kharif/Rabi/Zaid seasons)
6. Crop tracking — fields, stages, health, reminders

Sign up: Home or /login → Get Started → create account → dashboard.
`.trim()

export type SitePageInfo = {
  path: string
  name: string
  summary: string
  tips: string[]
}

export const SITE_PAGES: SitePageInfo[] = [
  {
    path: "/",
    name: "Home",
    summary:
      "Marketing landing page explaining AgriMind AI, features, how it works, crops, and FAQs. Use Sign In or Get Started to access the farmer dashboard.",
    tips: [
      "Scroll to #features, #how-it-works, #crops, #faq for sections",
      "Click Get Started or Sign In to go to /login",
    ],
  },
  {
    path: "/login",
    name: "Login / Sign up",
    summary:
      "Create a farmer account or sign in with email. After login you are redirected to the dashboard.",
    tips: ["Use Sign up link if you do not have an account yet"],
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    summary:
      "Main hub after login: stats, notifications, shortcuts to AI Diagnosis, Voice Assistant, and Market.",
    tips: [
      "Use sidebar (desktop) or bottom nav + Menu (mobile) to navigate",
    ],
  },
  {
    path: "/dashboard/diagnosis",
    name: "AI Diagnosis",
    summary:
      "Upload a clear photo of affected crop leaves/stems. Select crop type, optionally describe the problem. AI returns disease, treatment, and prevention.",
    tips: [
      "Use natural daylight and close-up plant photos",
      "View past reports under Diagnosis History",
    ],
  },
  {
    path: "/dashboard/voice",
    name: "Voice Assistant",
    summary:
      "Hold the mic and speak in Hindi, Marathi, or English. AgriMind transcribes and answers with voice playback.",
    tips: ["Allow microphone permission in the browser"],
  },
  {
    path: "/dashboard/chat",
    name: "AI Chat",
    summary:
      "Text chat for farming questions: diseases, fertilizer, pests, planting seasons (Kharif/Rabi), Indian agricultural practices.",
    tips: ["Choose language at top of chat page"],
  },
  {
    path: "/dashboard/market",
    name: "Market Prices",
    summary:
      "Wholesale APMC Mandi crop prices across Indian hubs (Pune, Nashik, Mumbai, Nagpur, Delhi) with AI demand insights.",
    tips: ["Set location filters if available on the page"],
  },
  {
    path: "/dashboard/weather",
    name: "Weather",
    summary:
      "Weather forecast for your Indian city/state with AI-generated farming recommendations.",
    tips: ["Select your nearest city for accurate forecast"],
  },
  {
    path: "/dashboard/crops",
    name: "My Crops",
    summary:
      "List and manage your registered fields and crops. Add new crops and track growth stages.",
    tips: ["Use Add Crop to register a new field"],
  },
  {
    path: "/dashboard/reminders",
    name: "Reminders",
    summary:
      "Farming and treatment reminders, including from diagnosis follow-ups.",
    tips: ["Check after completing an AI diagnosis for suggested reminders"],
  },
  {
    path: "/dashboard/settings",
    name: "Settings",
    summary: "Account preferences, language, and app configuration.",
    tips: [],
  },
  {
    path: "/dashboard/profile",
    name: "Profile",
    summary: "View and edit your farmer profile information.",
    tips: [],
  },
]

export function getPageInfoForPath(pathname: string): SitePageInfo | null {
  const exact = SITE_PAGES.find((p) => p.path === pathname)
  if (exact) return exact

  if (pathname.startsWith("/dashboard/crops/") && pathname !== "/dashboard/crops/new") {
    return {
      path: pathname,
      name: "Crop details",
      summary:
        "Detailed view for one crop: health, stage, events, and field notes.",
      tips: ["Edit crop info from this page if forms are shown"],
    }
  }
  if (pathname === "/dashboard/crops/new") {
    return {
      path: pathname,
      name: "Add crop",
      summary: "Form to register a new field or crop plot.",
      tips: ["Fill field name, crop type, planted date, and location"],
    }
  }
  if (pathname.startsWith("/dashboard/diagnosis")) {
    return SITE_PAGES.find((p) => p.path === "/dashboard/diagnosis") ?? null
  }
  if (pathname.startsWith("/admin")) {
    return {
      path: pathname,
      name: "Admin panel",
      summary:
        "Internal dashboard for agriculture officers: farmers, reports, analytics, AI monitoring.",
      tips: ["Requires admin login at /admin/login"],
    }
  }
  if (pathname.startsWith("/dashboard")) {
    return SITE_PAGES.find((p) => p.path === "/dashboard") ?? null
  }
  return null
}

export function buildSiteKnowledgeContext(pathname: string): string {
  const page = getPageInfoForPath(pathname)
  const parts = [SITE_HELP_OVERVIEW]
  if (page) {
    parts.push(
      `\nCurrent page: ${page.name} (${page.path})`,
      `About this page: ${page.summary}`,
      page.tips.length ? `Tips: ${page.tips.join("; ")}` : ""
    )
  } else if (pathname) {
    parts.push(`\nCurrent URL path: ${pathname}`)
  }
  return parts.filter(Boolean).join("\n")
}

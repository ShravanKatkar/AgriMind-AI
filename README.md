<div align="center">

# 🌾 AgriMind AI
### Comprehensive Multilingual Smart Agriculture & Crop Pathology Platform

*Empowering farmers with AI-driven visual disease diagnosis, natural bidirectional voice assistance, market price intelligence, and precision farm management.*

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ShravanKatkar/AgriMind-AI)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Supported Languages](#-supported-languages)
- [System Architecture](#-system-architecture)
- [Core Features & Modules](#-core-features--modules)
  - [1. AI Crop Pathology Diagnosis](#1-ai-crop-pathology-diagnosis)
  - [2. Multilingual Voice Assistant](#2-multilingual-voice-assistant)
  - [3. Precision Farm & Crop Management](#3-precision-farm--crop-management)
  - [4. Market Intelligence & Commodity Pricing](#4-market-intelligence--commodity-pricing)
  - [5. Multilingual PDF Report Generation](#5-multilingual-pdf-report-generation)
  - [6. Administrative & Officer Portal](#6-administrative--officer-portal)
- [Technology Stack](#-technology-stack)
- [Data Models & Schema](#-data-models--schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: One-Click Launcher (Windows)](#option-a-one-click-launcher-windows)
  - [Option B: Manual Installation](#option-b-manual-installation)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Author & Maintainer](#-author--maintainer)
- [License](#-license)

---

## 📖 Overview

**AgriMind AI** is an enterprise-grade smart agriculture ecosystem built to eliminate the technological, educational, and linguistic barriers faced by farmers. By combining state-of-the-art multimodal vision models (**OpenAI GPT-4o**), low-latency speech recognition, and native Devanagari script processing, AgriMind AI acts as a 24/7 personal agronomy expert in the farmer's pocket.

### Why AgriMind AI?
- **Immediate Triage**: Identify crop diseases in seconds from a single smartphone photo before outbreaks spread.
- **Language Inclusivity**: Farmers communicate naturally in their native language (**English**, **हिन्दी**, or **मराठी**) via speech or text.
- **Actionable Remediation**: Detailed chemical dosages, organic alternatives, cost breakdowns, and prevention protocols instead of generic recommendations.
- **Economic Empowerment**: Live commodity prices, trend forecasts, and optimal harvest sell windows.

---

## 🌐 Supported Languages

AgriMind AI is engineered from the ground up for strict regional localization:

| Language | Code | Native Script | Speech-to-Text (STT) | Text-to-Speech (TTS) | PDF Report Export |
|---|---|---|---|---|---|
| **English** | `en` | Latin | Web Speech / Valsea | OpenAI TTS / Browser | Standard Helvetica |
| **Hindi** | `hi` | हिन्दी (Devanagari) | Valsea / Browser | OpenAI TTS (`nova` / Indian nuance) | Noto Sans Devanagari |
| **Marathi** | `mr` | मराठी (Devanagari) | Valsea / Browser | OpenAI TTS (`nova` / Indian nuance) | Noto Sans Devanagari |

### Key Localization Highlights:
- **Instant Client Dictionaries**: Zero-delay UI switching powered by pre-bundled static translation catalogs ([`mr-ui.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/lib/i18n/bundled/mr-ui.ts) & [`hi-ui.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/lib/i18n/bundled/hi-ui.ts)).
- **Devanagari Script Detection**: Regex-based heuristic parser that instantly differentiates Marathi and Hindi markers from Latin inputs without network overhead.
- **PDF Glyph Integrity**: Custom Base64 font loader that embeds `NotoSansDevanagari-Regular.ttf` into `jsPDF` virtual filesystem to prevent unreadable box characters.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 + React 19)"]
        UI["Tailwind CSS + Framer Motion UI"]
        AudioRec["Browser MediaRecorder (Speech Audio)"]
        Camera["Photo Uploader / Camera Interface"]
        LangPicker["Instant i18n Catalog (EN, HI, MR)"]
    end

    subgraph Server["Next.js Server & API Routes"]
        Proxy["App Router & API Handlers"]
        AuthMiddleware["Auth & Session Controller"]
        LangRouter["Devanagari Script & Language Router"]
        PDFGen["jsPDF + Noto Sans Devanagari Engine"]
    end

    subgraph AIServices["External AI Engines"]
        OpenAIVision["OpenAI GPT-4o (Visual Disease Analysis)"]
        OpenAITTS["OpenAI TTS (Neural Audio Playback)"]
        ValseaSTT["Valsea.ai (Multilingual Audio Transcription)"]
    end

    subgraph DataStorage["Persistence & Cloud Services"]
        MongoDB[("MongoDB Atlas Database")]
        Cloudinary["Cloudinary / Firebase Image Bucket"]
        FirebaseAuth["Firebase Authentication Service"]
    end

    UI --> Proxy
    AudioRec -->|WebM / WAV Audio| Proxy
    Camera -->|Base64 / Multipart Photo| Proxy

    Proxy --> AuthMiddleware
    AuthMiddleware <--> FirebaseAuth
    Proxy --> LangRouter

    Proxy -->|Image URL + Prompt| OpenAIVision
    Proxy -->|Audio Buffer| ValseaSTT
    Proxy -->|Response Text + Voice Preset| OpenAITTS

    Proxy <-->|CRUD Operations| MongoDB
    Camera -->|Direct Upload| Cloudinary
    Proxy --> PDFGen
```

---

## 🚀 Core Features & Modules

### 1. AI Crop Pathology Diagnosis
- **Strict Image Validation**: Automatically screens uploads to ensure they depict real crops, stems, leaves, or fruits. Rejects handwriting, objects, landscapes, and human selfies with helpful guidance in the selected language.
- **Comprehensive Clinical Reports**:
  - Identified pathogen or deficiency name with confidence rating (40% - 98%).
  - Severity classification: `Low`, `Medium`, or `High`.
  - Cause & lifecycle analysis (8-12 comprehensive sentences).
  - 5+ discrete observable symptoms.
  - Step-by-step treatment schedule specifying exact commercial chemical fungicides, insecticides, organic bio-fertilizers, and water dilution ratios.
  - Cost estimates itemized for budget vs. comprehensive interventions.
  - 5+ long-term prevention strategies including crop rotation, field sanitation, and resistant seed varieties.
- **Localized Video Tutorials**: Dynamically queries curated agricultural video guides matching the diagnosed disease in English, Hindi, and Marathi.

### 2. Multilingual Voice Assistant
- **Hands-Free Field Experience**: Designed for farmers standing in fields with wet or soiled hands.
- **Real-Time Voice Turnaround**:
  1. Captures microphone stream via HTML5 MediaStreams.
  2. Sends audio to Valsea AI speech recognition or client Web Speech STT.
  3. Contextually routes query to OpenAI agronomy engine with current crop parameters.
  4. Synthesizes audio using OpenAI `tts-1` (`nova` voice) with custom regional pronunciation prompting.
  5. Plays audio response directly with interactive audio wave visualization.
- **Multi-Turn Conversation Memory**: Retains conversation history in MongoDB so farmers can ask sequential follow-up questions.

### 3. Precision Farm & Crop Management
- **Crop Registry**: Track cultivated crop varieties (Rice, Wheat, Tomato, Onion, Cotton, Sugarcane, Tea, Coconut, etc.).
- **Growth Stage Monitoring**: Log sowing dates, vegetative stages, flowering, fruiting, and anticipated harvest timelines.
- **Treatment Reminders**: Automated reminders for spraying schedules, irrigation cycles, and fertilizer applications.

### 4. Market Intelligence & Commodity Pricing
- **Live Mandi / Market Prices**: View latest wholesale and retail prices per quintal or kilogram across regional agricultural markets.
- **Price Trend Visualizations**: Responsive charts powered by Recharts showing historical price movements.
- **Sell Window Guidance**: Actionable tips on whether to hold, sell locally, or transport to central terminal markets.

### 5. Multilingual PDF Report Generation
- **Client & Server Compatible**: Instantly download diagnosis reports as publication-quality PDF documents.
- **Devanagari Font Rendering**: Incorporates `NotoSansDevanagari-Regular.ttf` so Marathi and Hindi text is rendered with correct ligatures, matras, and conjuncts.

### 6. Administrative & Officer Portal
- **Outbreak Heatmaps & Disease Trends**: Real-time monitoring of reported plant diseases across geographic zones.
- **Farmer Management**: View registered farmers, recent diagnosis submissions, and crop yields.
- **AI Latency & Cost Monitoring**: Track token consumption, API latencies, and service health across OpenAI and Valsea endpoints.

---

## 🛠️ Technology Stack

| Category | Technology | Description |
|---|---|---|
| **Framework** | Next.js 16.2.6 | Full-stack React framework (App Router, Webpack configuration) |
| **Language** | TypeScript 5.7 | Strict type safety across client, server, and data models |
| **Styling** | Tailwind CSS v4 | Cutting-edge utility styling with customized agricultural theme |
| **UI Components** | Radix UI Primitives | Accessible modals, dropdowns, accordions, and popovers |
| **Animation** | Framer Motion 12 | Smooth page transitions, voice wave pulses, and micro-interactions |
| **AI Vision** | OpenAI GPT-4o | Multi-modal image inspection and plant disease pathology |
| **AI Voice / TTS** | OpenAI TTS (`tts-1`) | Natural neural speech synthesis with accent optimization |
| **Speech STT** | Valsea.ai API | High-accuracy Asian regional language speech-to-text |
| **Database** | MongoDB Atlas / Mongoose 9 | Scalable document storage with Mongoose ODM |
| **Auth** | Firebase Auth 12 | Secure authentication with server-side Admin SDK verification |
| **Image Storage** | Cloudinary / Firebase | Cloud-hosted CDN delivery for crop diagnosis photographs |
| **PDF Engine** | jsPDF 4.2 | Custom VFS font-embedded vector PDF document generation |
| **Icons** | Lucide React | Modern, consistent stroke icons |

---

## 🗄️ Data Models & Schema

The platform persists structured entities in MongoDB through Mongoose:

### 1. `User` ([`models/User.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/models/User.ts))
```typescript
{
  uid: string;                 // Firebase UID
  email: string;
  displayName: string;
  role: "farmer" | "officer" | "admin";
  preferredLanguage: "en" | "hi" | "mr";
  farmLocation?: string;
  farmSizeAcres?: number;
  cropsGrown: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. `DiagnosisReport` ([`models/DiagnosisReport.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/models/DiagnosisReport.ts))
```typescript
{
  userId: string;
  cropType: string;
  imageUrl: string;
  language: "en" | "hi" | "mr";
  isValidPlantImage: boolean;
  disease: string;
  confidence: number;          // 0 to 100
  severity: "low" | "medium" | "high";
  cause: string;
  symptoms: string[];
  treatment: Array<{ step: number; action: string; timing: string; details: string }>;
  prevention: string[];
  estimatedRecovery: string;
  costEstimate: string;
  youtubeVideos: Array<{ title: string; searchQuery: string; language: string }>;
  createdAt: Date;
}
```

### 3. `VoiceConversation` ([`models/VoiceConversation.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/models/VoiceConversation.ts))
```typescript
{
  userId: string;
  language: "en" | "hi" | "mr";
  title: string;
  turns: Array<{
    role: "user" | "assistant";
    text: string;
    audioUrl?: string;
    timestamp: Date;
  }>;
  createdAt: Date;
}
```

### 4. `Crop` ([`models/Crop.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/models/Crop.ts))
```typescript
{
  userId: string;
  cropName: string;
  variety?: string;
  plantingDate: Date;
  expectedHarvestDate?: Date;
  stage: "sowing" | "vegetative" | "flowering" | "fruiting" | "harvested";
  areaAcres: number;
  notes?: string;
}
```

### 5. `MarketPrice` ([`models/MarketCrop.ts`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/models/MarketCrop.ts))
```typescript
{
  cropName: string;
  marketLocation: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceDate: Date;
  priceTrend: "up" | "down" | "stable";
}
```

---

## 🔌 API Reference

### AI & Diagnosis Endpoints

| Method | Endpoint | Description | Payload Summary |
|---|---|---|---|
| `POST` | `/api/ai/diagnose` | Run multimodal disease diagnosis on crop photo | `{ imageUrl, cropType, language }` |
| `POST` | `/api/ai/chat` | Contextual text farming assistant chat | `{ message, history, language, cropContext }` |
| `POST` | `/api/ai/assist` | Real-time streaming or short advice assistant | `{ prompt, language }` |
| `GET` | `/api/diagnosis` | Retrieve user's diagnosis history | Query: `?page=1&limit=10` |
| `GET` | `/api/diagnosis/[id]` | Fetch single diagnosis report by ID | Path parameter: `id` |
| `GET` | `/api/diagnosis/[id]/pdf` | Download formatted PDF diagnosis report | Returns binary `application/pdf` |

### Voice & Audio Endpoints

| Method | Endpoint | Description | Payload Summary |
|---|---|---|---|
| `POST` | `/api/voice/turn` | Process audio turn: STT → AI → TTS | FormData: `audio` (blob), `language` |
| `POST` | `/api/voice/speak` | Server-side neural TTS generation | `{ text, language }` → returns MP3 audio |
| `POST` | `/api/voice/detect-language`| Classifies language of speech transcript | `{ text }` → `{ language: "hi" \| "mr" \| "en" }` |
| `GET` | `/api/voice/conversations` | List user's saved voice chat sessions | Query: `?limit=20` |
| `POST` | `/api/voice/save-turn` | Append user/assistant turn to session | `{ conversationId, role, text }` |

### Farm & Market Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` / `POST` | `/api/crops` | List all active crops or register a new crop planting |
| `GET` / `DELETE`| `/api/crops/[id]` | View or archive a registered crop profile |
| `GET` | `/api/market` | Fetch real-time commodity prices and market trends |
| `GET` | `/api/market/alerts` | Get price volatility alerts for selected crops |
| `GET` / `POST` | `/api/reminders` | Manage farm reminders (spray, water, fertilizer) |

---

## ⚡ Getting Started

### Prerequisites

Ensure your system meets the following requirements:
- **Node.js**: v20.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **NPM**: v10.0.0 or higher
- **MongoDB**: MongoDB Atlas connection string (or local MongoDB v6+)
- **OpenAI API Key**: Valid API key from [platform.openai.com](https://platform.openai.com)

---

### Option A: One-Click Launcher (Windows)

The repository includes an automated Windows batch launcher:

1. Double-click **[`start.bat`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/start.bat)** in the root folder.
2. The launcher will automatically:
   - Check and display your Node.js version.
   - Generate `.env.local` from template if missing.
   - Run dependency installation if `node_modules` is not detected.
   - Launch `next dev --webpack` on `http://localhost:3000`.
   - Open your default browser to the web application.

---

### Option B: Manual Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ShravanKatkar/AgriMind-AI.git
   cd AgriMind-AI
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   # On Windows Command Prompt:
   copy .env.example .env.local

   # On macOS / Linux / PowerShell:
   cp .env.example .env.local
   ```
   Open `.env.local` in your editor and enter your `OPENAI_API_KEY` and `MONGODB_URI`.

4. **Seed Default Crops and Market Data (Optional):**
   ```bash
   npm run seed:crops
   npm run seed:market
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## ⚙️ Environment Configuration

Create `.env.local` in the project root:

```env
# =============================================================================
# AgriMind AI — Environment Configuration
# =============================================================================

# --- App Settings ---
NEXT_PUBLIC_APP_URL=http://localhost:3000

# --- MongoDB Atlas Connection ---
# Obtain from MongoDB Atlas -> Database -> Connect -> Drivers
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/agrimind?retryWrites=true&w=majority

# --- OpenAI (Mandatory for Disease Diagnosis, Chat & TTS) ---
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_VISION_MODEL=gpt-4o
OPENAI_MAX_TOKENS=1500
OPENAI_TTS_MODEL=tts-1
OPENAI_TTS_VOICE=nova

# --- Firebase Client SDK (Authentication) ---
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=agrimind.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=agrimind
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=agrimind.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000000000

# --- Firebase Admin SDK (Server Auth Verification) ---
FIREBASE_ADMIN_PROJECT_ID=agrimind
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@agrimind.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# --- Cloudinary (Diagnostic Leaf Image Storage) ---
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# --- Valsea AI (Optional: Regional Speech Transcription) ---
VALSEA_API_KEY=vl_live_xxxxxxxx
VALSEA_API_BASE_URL=https://api.valsea.ai
VALSEA_MAX_REQUESTS_PER_MINUTE=18

# --- Regional Officer WhatsApp Support ---
NEXT_PUBLIC_WHATSAPP_SUPPORT=919876543210
```

> [!NOTE]
> If Firebase credentials are not yet configured, the platform automatically enters **local mock session mode**, allowing you to explore the dashboard, AI diagnosis, and voice features without authentication failures.

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `npm run dev` | Runs dev server with Next.js Webpack engine (`next dev --webpack`) |
| `build` | `npm run build` | Compiles optimized production bundle |
| `start` | `npm run start` | Runs production server on port 3000 |
| `lint` | `npm run lint` | Analyzes code for ESLint issues |
| `seed:crops` | `npm run seed:crops` | Populates database with standard regional crop templates |
| `seed:market` | `npm run seed:market` | Seeds mock market prices and commodity locations |
| `fonts:pdf` | `npm run fonts:pdf` | Downloads the latest Noto Sans Devanagari font into `public/fonts/` |
| `db:inspect` | `npm run db:inspect` | Inspects connected MongoDB collections and document counts |

---

## 📁 Project Directory Structure

```
AgriMind-AI/
├── app/                                    # Next.js 16 App Router
│   ├── (auth)/login/page.tsx               # Farmer login & registration
│   ├── admin/                              # Administrative & officer dashboard
│   │   ├── ai-monitor/                     # Real-time AI token & latency metrics
│   │   ├── analytics/                      # Outbreak charts & usage statistics
│   │   ├── farmers/                        # Registered farmer registry
│   │   ├── notifications/                  # System broadcast management
│   │   └── reports/                        # Aggregated diagnosis audit
│   ├── api/                                # REST API route handlers
│   │   ├── ai/                             # Diagnosis, chat, and assistance APIs
│   │   ├── auth/                           # Session verification & logout
│   │   ├── crops/                          # Crop lifecycle CRUD endpoints
│   │   ├── diagnosis/                      # Diagnosis history & PDF generation
│   │   ├── market/                         # Commodity pricing & alerts
│   │   ├── reminders/                      # Farm activity scheduler
│   │   ├── valsea/                         # STT audio transcription bridge
│   │   └── voice/                          # Voice turn & TTS endpoints
│   └── dashboard/                          # Farmer portal pages
│       ├── chat/                           # AI Agronomist chat interface
│       ├── crops/                          # Field & crop manager
│       ├── diagnosis/                      # Visual leaf disease scanner
│       │   └── history/                    # Historical diagnosis records
│       ├── market/                         # Live price board & charts
│       ├── profile/                        # Farmer farm details & settings
│       ├── reminders/                      # Scheduled spray & watering tasks
│       └── voice/                          # Interactive voice assistant
├── components/                             # Modular UI component tree
│   ├── brand/agrimind-logo.tsx             # SVG branding & insignia
│   ├── dashboard/                          # Dashboard navigation & widgets
│   ├── i18n/language-picker.tsx            # Header language switcher (EN, HI, MR)
│   ├── landing/                            # Modern landing page sections
│   │   ├── hero-section.tsx                # Hero banner with quick start CTA
│   │   ├── crops-section.tsx               # Supported crop showcase
│   │   ├── voice-demo-section.tsx          # Interactive voice preview
│   │   └── cta-section.tsx                 # Regional conversion call-to-action
│   └── ui/                                 # Radix UI design primitives
├── contexts/                               # Global React context providers
│   ├── auth-context.tsx                    # Firebase session & mock user provider
│   └── language-context.tsx                # App-wide localization state
├── lib/                                    # Core utilities & engines
│   ├── i18n/                               # Localization catalogs & language maps
│   │   ├── bundled/mr-ui.ts                # Native Marathi UI catalog
│   │   ├── bundled/hi-ui.ts                # Native Hindi UI catalog
│   │   ├── languages.ts                    # Language definitions & BCP-47 tags
│   │   └── static-ui.ts                    # Fast catalog resolver
│   ├── openai/prompts.ts                   # System prompts for vision & agronomy
│   ├── pdf/                                # jsPDF font setup & report formatting
│   │   ├── font-setup.ts                   # Devanagari VFS font loader
│   │   └── pdf-labels.ts                   # Multilingual report header labels
│   └── voice/                              # TTS policy, browser voices & detection
│       ├── detect-language.ts              # Devanagari script detection
│       ├── tts-policy.ts                   # Neural voice selection policy
│       └── tts.ts                          # Dual-tier audio player engine
├── models/                                 # Mongoose ODM schema definitions
│   ├── Crop.ts                             # Farm crop records
│   ├── DiagnosisReport.ts                  # Plant disease pathology reports
│   ├── MarketCrop.ts                       # Commodity pricing data
│   ├── User.ts                             # User profile & language preferences
│   └── VoiceConversation.ts                # Voice session transcripts
├── public/                                 # Static assets & fonts
│   ├── fonts/NotoSansDevanagari-Regular.ttf# Embedded font for Marathi & Hindi PDFs
│   └── images/                             # Illustration & placeholder assets
├── scripts/                                # Maintenance & database seeding tools
├── start.bat                               # Windows 1-click batch launcher
├── package.json                            # Package dependencies & npm scripts
└── tsconfig.json                           # TypeScript compiler configuration
```

---

## ❓ Troubleshooting & FAQs

### 1. `start.bat` reports SWC or Turbopack binary errors on Windows
- **Cause**: Next.js 16 default Turbopack can encounter native Windows SWC compilation conflicts on certain Windows architecture configurations.
- **Solution**: AgriMind AI is explicitly configured to use `next dev --webpack` and `next build --webpack` in [`package.json`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/package.json), ensuring 100% stability on Windows.

### 2. Can I run the application without Firebase credentials?
- **Yes**: The authentication layer in [`contexts/auth-context.tsx`](file:///c:/Users/shara/Downloads/AgriMind-AI-main/AgriMind-AI-main/contexts/auth-context.tsx) gracefully handles missing or unconfigured Firebase keys by initiating a resilient guest mock session. You can freely test disease diagnosis, voice features, and dashboard views.

### 3. Hindi and Marathi characters look like squares in PDF exports
- **Solution**: Run `npm run fonts:pdf` to download `NotoSansDevanagari-Regular.ttf` into `public/fonts/`. The application automatically registers this font into the `jsPDF` virtual filesystem for flawless Devanagari text generation.

### 4. How do I enable Valsea AI speech recognition?
- Add your Valsea API key to `.env.local`:
  ```env
  VALSEA_API_KEY=vl_live_your_key_here
  ```
  If not supplied, the voice assistant will automatically fall back to the native browser Speech Recognition API.

---

## 👨‍💻 Author & Maintainer

**Shravan Katkar**
- GitHub: [@ShravanKatkar](https://github.com/ShravanKatkar)
- Repository: [AgriMind-AI](https://github.com/ShravanKatkar/AgriMind-AI)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**AgriMind AI** — *Empowering Agriculture Through Artificial Intelligence.*

</div>

<div align="center">
  <img src="AGENTIC_AI/health-navigator - Antigravity/src/assets/iconn.png" alt="VytalCare Logo" width="120" height="120" />
  <h1 align="center">VytalCare</h1>
  <strong>The Agentic AI Health Companion</strong>
  <br />
  <br />
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" /></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini_AI-4285F4?logo=google&logoColor=white" /></a>
  <a href="https://n8n.io/"><img src="https://img.shields.io/badge/n8n-EA4AAA?logo=n8n&logoColor=white" /></a>
  <br />
  <br />
  <p align="center">
    An intelligent health monitoring system that doesn't just track—it acts. VytalCare autonomously manages your wellness through AI-powered insights, automated workflows, and proactive health interventions.
    <br />
    <br />
    <a href="https://github.com/AnanyaRaghuveer/VytalCare-agenticAI-Capabl"><strong>View Repository »</strong></a>
    <br />
    <br />
    <a href="#-getting-started">Quick Start</a>
    ·
    <a href="#-key-features">Features</a>
    ·
    <a href="#-tech-stack">Tech Stack</a>
  </p>
</div>

---

## 🚀 Key Features

### 🧠 Agentic AI Capabilities

VytalCare goes beyond passive tracking—it takes autonomous actions on your behalf:

- **🔗 Automated Workflow Triggers**: Automatically sends webhooks to n8n when medications are created, triggering external workflows like caregiver notifications or pharmacy orders
- **📅 Smart Calendar Sync**: Autonomously schedules medication reminders and health check-ups in your Google Calendar
- **🔔 Proactive Notifications**: Browser-based alerts triggered intelligently based on medication schedules and health patterns
- **🎯 Predictive Health Scoring**: AI-powered health score (0-100) calculated using weighted algorithms across multiple health dimensions
- **👁️ Gemini Vision Analysis**: Upload health documents, lab reports, or food images for instant AI-powered analysis and recommendations
- **🤖 Context-Aware Decision Making**: Uses RAG (Retrieval-Augmented Generation) to provide personalized health advice based on your complete health history

### 📊 Comprehensive Health Tracking

Real-time integration with Google Fit for complete wellness monitoring:

- **👟 Activity Metrics**: Steps, distance, calories burned with 3-hour interval visualizations
- **💤 Sleep Analysis**: Duration patterns, sleep quality tracking, and trend analysis
- **❤️ Heart Rate Monitoring**: Continuous heart rate tracking with min/max/average calculations
- **📈 Interactive Visualizations**: Recharts-powered graphs for steps, heart rate trends, weekly distance, and sleep patterns
- **💧 Hydration Tracker**: Daily water intake monitoring with customizable goals and automatic daily resets
- **⚖️ BMI Calculator**: Body Mass Index tracking with health category classification
- **📊 Historical Data**: View and analyze health trends over days, weeks, and months

### 💬 Intelligent Chat & Voice

Advanced conversational AI for personalized health guidance:

- **🗣️ Voice Input**: Speak naturally to the chatbot using browser speech recognition
- **🌍 Multilingual Support**: Communicate in your preferred language with automatic translation
- **🧠 RAG-Powered Responses**: Retrieval-Augmented Generation ensures answers are grounded in your actual health data
- **💾 Persistent Chat History**: All conversations saved to Firestore for continuity across sessions
- **📋 Structured AI Insights**: Gemini 2.5 Flash generates wellness analysis in clear, tabular formats
- **🔍 Context-Aware Conversations**: AI remembers your health profile, medications, and previous discussions

### 🏥 Advanced Medication Management

Complete prescription tracking and adherence monitoring:

- **💊 Full CRUD Operations**: Create, read, update, and delete prescriptions with ease
- **⏰ Smart Reminders**: Browser notifications triggered at scheduled medication times
- **✅ Adherence Logging**: "Mark as Taken" functionality logs every dose to `medication_logs`
- **📊 Compliance Tracking**: Visual dashboard showing medication adherence rates over time
- **🔗 External Integrations**: n8n webhook automatically triggered on prescription creation for caregiver alerts
- **📱 Cross-Device Sync**: All medication data synced via Firestore for access anywhere

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 18**: Modern UI with hooks-based architecture
- **Vite**: Lightning-fast bundler and development server
- **Tailwind CSS**: Utility-first responsive styling system
- **Lucide React**: Comprehensive icon library for UI elements

### Data Visualization
- **Recharts**: Interactive charts for health metrics visualization
- **Custom Components**: Line charts, bar charts, and area charts for activity data

### Backend & Database
- **Firebase SDK**: Authentication, Firestore database, and cloud storage
- **Firestore**: NoSQL database for user profiles, medications, chats, and hydration logs
- **Firebase Auth**: Secure authentication with Google OAuth 2.0

### AI & Machine Learning
- **Google Gemini 2.5 Flash**: Generative AI for health insights and conversational chat
- **RAG Integration**: Retrieval-Augmented Generation for context-aware responses
- **Gemini Vision API**: Image analysis for lab reports and health documents

### Health Data Integration
- **Google Fitness API**: Real-time activity, sleep, heart rate, and location data
- **OAuth 2.0**: Secure authorization with required fitness scopes
- **REST API Integration**: Aggregate and session endpoints for metric retrieval

### Automation & Workflows
- **n8n**: Workflow automation platform for medication triggers and external integrations
- **Webhooks**: Real-time event notifications to external systems

### Additional Libraries
- **React Router**: Client-side routing for SPA navigation
- **Date-fns**: Date manipulation and formatting utilities
- **Browser APIs**: Notifications API, Speech Recognition API

---

## ⚡ Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js v16+** installed on your system
- **npm** or **yarn** package manager
- **Google Cloud Console** project with:
  - Fitness API enabled
  - Generative Language API (Gemini) enabled
  - OAuth 2.0 credentials configured
- **Firebase Project** created with:
  - Firestore database initialized
  - Authentication enabled (Google provider)
- **n8n Instance** (optional, for workflow automation)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnanyaRaghuveer/VytalCare-agenticAI-Capabl.git
   cd VytalCare-agenticAI-Capabl
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Google OAuth 2.0
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   
   # Gemini AI
   VITE_GEMINI_API_KEY=your_gemini_api_key
   
   # n8n Webhook (optional)
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/new-medication
   ```

4. **Set up Google Cloud Console**
   
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable **Fitness API** and **Generative Language API**
   - Create OAuth 2.0 credentials with authorized redirect URIs:
     - `http://localhost:5173` (development)
     - Your production domain (if deploying)
   - Add required scopes:
     - `https://www.googleapis.com/auth/fitness.activity.read`
     - `https://www.googleapis.com/auth/fitness.heart_rate.read`
     - `https://www.googleapis.com/auth/fitness.sleep.read`
     - `https://www.googleapis.com/auth/fitness.location.read`

5. **Configure Firebase**
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Enable **Firestore Database** (start in production mode)
   - Enable **Google Authentication** in Authentication settings
   - Copy your Firebase config and add to `.env`

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

7. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 📁 Project Structure

```
VytalCare/
├── src/
│   ├── assets/           # Images, icons, and static files
│   │   └── iconn.png     # App logo
│   ├── components/       # React components
│   │   ├── Dashboard.jsx
│   │   ├── MedicationTracker.jsx
│   │   ├── ChatBot.jsx
│   │   ├── Profile.jsx
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   ├── firebase.js   # Firebase configuration
│   │   ├── googleFit.js  # Google Fit API integration
│   │   └── gemini.js     # Gemini AI integration
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── .env                  # Environment variables (not committed)
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md             # This file
```

---

## 🗄️ Database Schema

VytalCare uses Firebase Firestore with the following structure:

**Base Path**: `/artifacts/{appId}/users/{userId}/`

| Collection / Document | Fields | Description |
|----------------------|--------|-------------|
| **profile** (Doc) | `userName`, `userAge`, `userGender`, `caregiverName`, `caregiverPhone`, `height`, `weight`, `bmi`, `createdAt`, `updatedAt` | User demographic and health profile information |
| **medications** (Collection) | `name`, `dose`, `frequency`, `times[]`, `startDate`, `endDate`, `notes`, `createdAt`, `updatedAt` | Active prescriptions and medication schedules |
| **medication_logs** (Collection) | `medicationId`, `medicationName`, `status`, `takenAt`, `dateKey`, `scheduledTime` | Medication adherence logs for tracking compliance |
| **hydration** (Collection) | `amount`, `goal`, `unit`, `dateKey`, `updatedAt` | Daily water intake tracking with customizable goals |
| **chats** (Collection) | `role`, `text`, `sources`, `createdAt`, `userId` | Chatbot conversation history with AI responses |
| **health_scores** (Collection) | `score`, `breakdown`, `date`, `calculatedAt` | Historical health scores with component breakdowns |

### Example Document Structures

**Profile Document:**
```json
{
  "userName": "John Doe",
  "userAge": 35,
  "userGender": "male",
  "caregiverName": "Jane Doe",
  "caregiverPhone": "+1234567890",
  "height": 175,
  "weight": 75,
  "bmi": 24.5,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Medication Document:**
```json
{
  "name": "Aspirin",
  "dose": "100mg",
  "frequency": "daily",
  "times": ["09:00", "21:00"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "notes": "Take with food",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## 🔌 External API Integration

### Google Fitness API

**Aggregate Endpoint:**
```
POST https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate
```

**Sessions Endpoint:**
```
GET https://www.googleapis.com/fitness/v1/users/me/sessions
```

**Data Sources:**
- `derived:com.google.step_count.delta:com.google.android.gms:estimated_steps`
- `derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm`
- `derived:com.google.sleep.segment:com.google.android.gms:merged`
- `derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended`
- `derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta`

### Gemini AI API

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**Features Used:**
- Text generation for health insights
- Vision API for document analysis
- Conversational chat with context
- Structured output generation

### n8n Webhook

**Medication Creation Webhook:**
```
POST https://AdityaPrakash781-vytalcare-n8n.hf.space/webhook/new-medication
```

**Payload:**
```json
{
  "medicationName": "Aspirin",
  "dose": "100mg",
  "times": ["09:00", "21:00"],
  "userName": "John Doe",
  "caregiverPhone": "+1234567890"
}
```

---

## 🧮 Health Score Algorithm

VytalCare calculates a comprehensive health score (0-100) using weighted components:

```javascript
Health Score = (
  Steps Score × 0.25 +
  Sleep Score × 0.25 +
  Heart Rate Score × 0.20 +
  Hydration Score × 0.15 +
  Medication Adherence × 0.15
)
```

**Component Calculations:**

- **Steps Score**: Based on daily step goal (10,000 steps = 100%)
- **Sleep Score**: Based on recommended 7-9 hours (8 hours = 100%)
- **Heart Rate Score**: Based on resting heart rate zones (60-100 bpm optimal)
- **Hydration Score**: Based on daily water intake goal (2L = 100%)
- **Medication Adherence**: Based on percentage of doses taken on time

---

## 🔒 Security & Privacy

- **OAuth 2.0**: Secure authentication with Google
- **Firebase Security Rules**: Firestore rules ensure users can only access their own data
- **Environment Variables**: Sensitive keys stored securely, never committed to version control
- **HTTPS Only**: All API calls use encrypted connections
- **Data Encryption**: Firebase encrypts data at rest and in transit
- **Minimal Permissions**: App requests only necessary Google Fit scopes

**Recommended Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy automatically on every push to main branch

### Manual Deployment

```bash
# Build the production bundle
npm run build

# The dist/ folder contains your production-ready app
# Deploy dist/ to any static hosting service (Netlify, Vercel, Firebase Hosting, etc.)
```

**Update OAuth Redirect URIs:**
- Add your production domain to Google Cloud Console OAuth credentials
- Update Firebase authorized domains in Firebase Console

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Ananya Raghuveer** - *Initial Development* - [@AnanyaRaghuveer](https://github.com/AnanyaRaghuveer)
- **Aditya Prakash** - *Contributor* - [@AdityaPrakash781](https://github.com/AdityaPrakash781)

---

## 📧 Contact

For questions, feedback, or collaboration:

- **GitHub Issues**: [Create an issue](https://github.com/AnanyaRaghuveer/VytalCare-agenticAI-Capabl/issues)
- **Email**: Contact through GitHub profile

---

## 🙏 Acknowledgments

- Google Fitness API for comprehensive health data
- Google Gemini for powerful AI capabilities
- Firebase for robust backend infrastructure
- n8n community for workflow automation tools
- React and Vite teams for amazing developer experience

---

<div align="center">
  <strong>Built with ❤️ for better health management</strong>
  <br />
  <br />
  <sub>⭐ Star this repo if you find it helpful!</sub>
</div>

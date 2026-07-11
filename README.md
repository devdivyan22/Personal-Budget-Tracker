
# 🚀 ApexBudget - Personal Budget & Expense Tracker
A modern, high-performance, and visually stunning personal finance dashboard. ApexBudget allows you to manage expenses, track custom savings goals, view real-time category spending analytics, and share your budget summaries directly with other devices on your local network.
---
## 🏗️ Project Architecture & Structure
This repository is structured as a monorepo containing both the Java backend and React frontend:
```text
pet4/
├── backend/                  # Spring Boot Java Backend
│   ├── src/                  # Java Sources (Controllers, Models, Serde)
│   └── pom.xml               # Maven dependencies configuration
├── frontend/                 # React + Vite Client Application
│   ├── src/                  # React components, style sheets, and routing
│   ├── vercel.json           # Vercel SPA routing rewrites configuration
│   └── package.json          # npm script dependencies
└── README.md                 # Project documentation (this file)
```
---
## ⚡ Tech Stack & Libraries
### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vite.dev/) (lightning-fast dev server)
- **Styling**: Modern CSS3 (featuring responsive design, Dark/Light modes, glassmorphism, transitions)
- **Icons**: [Lucide React](https://lucide.dev/icons/)
- **Hosting**: [Vercel](https://vercel.com/) (Single Page App rewrite configured)
### Backend
- **Framework**: [Spring Boot 3](https://spring.io/projects/spring-boot) (Java 17+)
- **Build Tool**: [Maven](https://maven.apache.org/)
- **Data Persistence**: In-memory data store with persistent LocalStorage browser backup
---
## 💻 Local Development Setup
### 1. Run the Spring Boot Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and run the project using Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will boot up and listen for requests on **`http://localhost:8080`**.*
### 2. Run the Vite Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite local development server:
   ```bash
   npm run dev
   ```
   *This starts the frontend in **network-exposed mode** (`--host`), automatically exposing it on your local network IP (e.g., `http://192.168.1.XX:5173`) so other devices on your Wi-Fi can access the dashboard.*
---
## 🌐 Dynamic API Wrapper Routing
To enable seamless multi-device access over a local area network (LAN), the API client in `frontend/src/api.js` is fully dynamic:
```javascript
const BASE_URL = `http://${window.location.hostname}:8080/api`;
```
This dynamically maps the API request location to the hostname of the loading device, preventing CORS issues or connection timeouts when loading from secondary devices like mobile phones or tablets on the same network.
---
## ☁️ Deployment on Vercel
The frontend is deployed to Vercel. SPA wildcard routing has been configured in `vercel.json` to prevent `404` errors when reloading subroutes (like `/transactions` or `/analytics`):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
### To Redeploy the Frontend manually:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Deploy directly:
   ```bash
   npx vercel --prod
   ```
---
## 🌟 Premium Features Implemented
* **Real-time Budget Alerts**: Smart notification center signaling overspending risks, savings metrics, and optimization paths.
* **Inline Details Drawer**: Click any ledger record row to slide open detailed information panels.
* **Cross-Tab Filtering**: Select category progress bars inside the main dashboard to jump directly into the Transactions Ledger filtered for that specific category.
* **Instant Dashboard Sharing**: One-click sharing via browser-native sharing sheets.
* **Responsive Styling**: Tailwind-free hand-crafted CSS designed for optimal mobile, tablet, and desktop layouts.

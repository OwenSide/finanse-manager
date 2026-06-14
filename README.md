# 💸 Finance Manager PWA

<div align="center">
  <img src="public/pwa-192x192.png" alt="App Logo" width="120" />
</div>

<br />

<!-- <div align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/IndexedDB-4D4D4D?style=for-the-badge&logo=databricks&logoColor=white" alt="IndexedDB" />
</div> -->

**Finance Manager** is a modern Progressive Web Application (PWA) designed for convenient tracking of personal finances, multi-currency wallets, and detailed analytics. The app works completely offline, utilizes local device storage, and is optimized to look and feel like a native app on iOS and Android.

🔗 **Demo:** [Open App](https://owenside.github.io/finanse-manager/) 

---

## 📑 Table of Contents
- [📸 Screenshots](#-screenshots)
- [🔒 Privacy First](#-privacy-first)
- [✨ Key Features](#-key-features)
- [🏗 Tech Stack](#-tech-stack)
- [🚀 Installation and Setup](#-installation-and-setup)
- [📦 Build and Deploy](#-build-and-deploy)
- [📱 How to Install on Phone (PWA)](#-how-to-install-on-phone-pwa)
- [📂 Project Structure](#-project-structure)
- [📄 License](#-license)

---

## 📸 Screenshots

<table align="center">
  <tr>
    <td align="center"><b>Home / Dashboard</b></td>
    <td align="center"><b>Wallet Carousel</b></td>
    <td align="center"><b>Analytics & Charts</b></td>
  </tr>
  <tr>
    <td><img src="" alt="Home Screen" width="250"/></td>
    <td><img src="" alt="Wallets Screen" width="250"/></td>
    <td><img src="" alt="Stats Screen" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><b>Add Transaction</b></td>
    <td align="center"><b>Categories / Icons</b></td>
    <td align="center"><b>Biometric PIN Lock</b></td>
  </tr>
  <tr>
    <td><img src="" alt="Add Transaction" width="250"/></td>
    <td><img src="" alt="Categories" width="250"/></td>
    <td><img src="" alt="Lock Screen" width="250"/></td>
  </tr>
</table>

> *Responsive design: The UI automatically adapts to a sidebar layout on desktop devices.*

---

## 🔒 Privacy First
This application is **100% Client-Side**.
* **No Servers:** All financial data is stored securely and locally on your device using IndexedDB.
* **No Tracking:** No analytics, no cookies, no data collection. Your money is your business.
* **Biometric Security:** Features a local PIN/Biometric lock screen UI to protect your data from prying eyes.
* **Ownership:** You maintain full control over your financial data without relying on third-party cloud services.

---

## ✨ Key Features

### 🛠 Functionality
* **Offline Mode:** Fully functional without internet access (PWA + Service Workers).
* **Multi-Currency Support:** Fetch real-time exchange rates via the **NBP Web API** (National Bank of Poland) to automatically calculate your total net worth in a base currency.
* **Wallets Management:** Create and manage cash, bank accounts, and crypto wallets. Easily switch between them using a gesture-friendly carousel.
* **Transactions & Categories:** Log income and expenses. Filter by periods (daily, monthly, yearly).
* **Recurring Payments:** Built-in engine to handle and automate recurring transactions.
* **Analytics:** Interactive charts and highlights to visualize spending habits.
* **Multi-Language (i18n):** Dynamically switch between English, Polish, and Ukrainian.

### 🎨 UI/UX (Interface)
* **Mobile-First Design:** Looks and behaves exactly like a native app (Bottom Navigation, Safe Areas, hidden browser bars).
* **Desktop Support:** Adapts to a Sidebar layout on larger screens.
* **Animations:** Smooth page transitions, animated numbers, and micro-interactions.
* **Themes:** Clean, modern interface styled with Tailwind CSS.

---

## 🏗 Tech Stack

* **Core:** React 18+, Vite
* **Styling:** Tailwind CSS
* **Database:** IndexedDB (Local Browser Storage)
* **PWA:** `vite-plugin-pwa` (Manifest, Service Workers, Offline capabilities)
* **State & Data Fetching:** Custom React Hooks, Context API
* **Charts:** `recharts`
* **Animations:** `framer-motion`
* **Localization:** `react-i18next`, `i18next-browser-languagedetector`
* **Utilities:** `@hello-pangea/dnd` (Drag-and-Drop), `date-fns` (Date formatting), `lucide-react` (Icons)

---

## 🚀 Installation and Setup

To run the project locally, you will need Node.js installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OwenSide/finanse-manager.git
   cd finanse-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

*The application will be available at `http://localhost:5173`.*

---

## 📦 Build and Deploy

The project is configured for static deployment (perfect for GitHub Pages).

**Build the project:**
```bash
npm run build
```

**Deploy (automated script)::**
```bash
npm run deploy
```

*This command will build the project and push the `dist` folder to the `gh-pages` branch.*

---

## 📱 How to Install on Phone (PWA)

The app does not require downloading from the App Store or Google Play.

**🍏 iOS (iPhone/iPad)**
1. Open the [Demo Link](https://owenside.github.io/finanse-manager/) in **Safari**.
2. Tap the **"Share"** button (square with an upward arrow at the bottom).
3. Select **"Add to Home Screen"**.
4. The app will now work like a native application (without the browser address bar).

**🤖 Android**
1. Open the [Demo Link](https://owenside.github.io/finanse-manager/) in **Chrome**.
2. Tap the menu (three dots) or wait for the pop-up banner.
3. Select **"Install App"** or **"Add to Home screen"**.

---

## 📂 Project Structure

<details>
<summary><b>Click to view file structure</b></summary>

```text
src/
├── api/                   # External API logic
│   └── exchangeRates.js   # NBP Web API integration
├── components/            # React components
│   ├── analytics/         # Recharts and statistical UI
│   ├── layout/            # App Shell, BottomNav, Sidebar
│   ├── modals/            # Modals (Add Transaction, Edit Category)
│   ├── transactions/      # Transaction lists and filters
│   ├── ui/                # Shared UI (BiometricLock, Icons)
│   └── wallets/           # Wallet Carousel and Selection
├── context/               # Global state (PreferencesContext)
├── hooks/                 # Custom React Hooks (useMonthlyStats)
├── locales/               # i18n JSON files
│   ├── en/                # English
│   ├── pl/                # Polish
│   └── uk/                # Ukrainian
├── pages/                 # Route Views (Home, Wallets, Stats, Categories)
├── utils/                 # Helper functions
│   ├── formatters.js      # Number & Date formatting
│   ├── recurringEngine.js # Recurring logic
│   └── syncExchangeRates.js # Background sync for rates
├── db.js                  # IndexedDB configuration & CRUD operations
├── i18n.js                # i18next initialization
├── App.jsx                # Main layout wrapper
├── main.jsx               # App entry point
└── index.css              # Global Tailwind styles
```
</details>

---

## 📄 License

This project is licensed under the GPLv3 License.

---

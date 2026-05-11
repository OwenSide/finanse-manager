import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import BottomNav from "./components/layout/BottomNav.jsx"; 
import AddTransaction from "./pages/AddTransaction.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Wallets from "./pages/Wallets.jsx";
import { PreferencesProvider } from './context/PreferencesContext.jsx'
import StatsPage from "./pages/StatsPage.jsx";
import BiometricLock from './components/ui/BiometricLock.jsx'; 

import SettingsPage from "./pages/SettingsPage.jsx"; 

export default function App() {
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem("useBiometrics") === "true";
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && localStorage.getItem("useBiometrics") === "true") {
        setIsLocked(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <PreferencesProvider>
      {isLocked ? (
        <BiometricLock onUnlock={() => setIsLocked(false)} />
      ) : (
        <Router>
          <div className="flex min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-indigo-500/30">
            <Sidebar />
            <main className="flex-1 w-full min-h-screen relative transition-all duration-300">
              <div className="md:pl-64 pb-24 md:pb-0 h-full">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/stats" element={<StatsPage/>} />
                  <Route path="/add-transaction" element={<AddTransaction />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            </main>
            <BottomNav />
          </div>
        </Router>
      )}
    </PreferencesProvider>
  );
}
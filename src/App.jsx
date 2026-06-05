import { useState, useEffect, Suspense, lazy } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar.jsx";
import BottomNav from "./components/layout/BottomNav.jsx"; 
import { PreferencesProvider } from './context/PreferencesContext.jsx';
import BiometricLock from './components/ui/BiometricLock.jsx'; 

const Home = lazy(() => import("./pages/Home.jsx"));
const StatsPage = lazy(() => import("./pages/StatsPage.jsx"));
const AddTransaction = lazy(() => import("./pages/AddTransaction.jsx"));
const Categories = lazy(() => import("./pages/Categories.jsx"));
const Wallets = lazy(() => import("./pages/Wallets.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));

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

  const PageLoader = () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="animate-pulse text-indigo-400 font-medium tracking-wider">
        Ładowanie...
      </div>
    </div>
  );

  return (
    <PreferencesProvider>
      {isLocked ? (
        <BiometricLock onUnlock={() => setIsLocked(false)} />
      ) : (
        <Router>
          <div className="flex min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-indigo-500/30">
            <Sidebar />
            
            <main className="flex-1 w-full min-h-screen relative transition-opacity duration-300">
              <div className="md:pl-64 pb-24 md:pb-0 h-full">
                
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/stats" element={<StatsPage/>} />
                    <Route path="/add-transaction" element={<AddTransaction />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/wallets" element={<Wallets />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Suspense>

              </div>
            </main>
            
            <BottomNav />
          </div>
        </Router>
      )}
    </PreferencesProvider>
  );
}
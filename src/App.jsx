import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import BottomNav from "./components/BottomNav.jsx"; 
import AddTransaction from "./pages/AddTransaction.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Wallets from "./pages/Wallets.jsx";
import { PreferencesProvider } from './context/PreferencesContext.jsx'
import StatsPage from "./pages/StatsPage.jsx";

import SettingsPage from "./pages/SettingsPage.jsx"; 

export default function App() {
  return (
    <PreferencesProvider>
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
                
                {/* <Route path="/more" element={<div className="p-10"></div>} /> */}
              </Routes>
            </div>
          </main>

          <BottomNav />

        </div>
      </Router>
    </PreferencesProvider>
  );
}
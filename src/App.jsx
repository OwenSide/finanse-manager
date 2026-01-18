import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import BottomNav from "./components/BottomNav.jsx"; 
import AddTransaction from "./pages/AddTransaction.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Wallets from "./pages/Wallets.jsx";

// 🔥 ИСПРАВЛЕНИЕ: Импортируем SettingsPage (так мы назвали файл в прошлом шаге)
import SettingsPage from "./pages/SettingsPage.jsx"; 

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-indigo-500/30">
        
        {/* Сайдбар (ПК) */}
        <Sidebar />

        {/* Основной контент */}
        <main className="flex-1 w-full min-h-screen relative transition-all duration-300">
          <div className="md:pl-64 pb-24 md:pb-0 h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Заглушка для статистики, пока нет отдельной страницы, ведем на главную */}
              <Route path="/stats" element={<div className="p-10">Strona w budowie (stats)</div>} />
              
              <Route path="/add-transaction" element={<AddTransaction />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/wallets" element={<Wallets />} />
              
              {/* 🔥 ИСПРАВЛЕНИЕ: Используем SettingsPage */}
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Заглушки для новых кнопок меню */}
              <Route path="/achievements" element={<div className="p-10">Strona w budowie (achievements)</div>} />
              <Route path="/more" element={<div className="p-10">Strona w budowie (more)</div>} />
            </Routes>
          </div>
        </main>

        {/* Нижнее меню (Телефон) */}
        <BottomNav />

      </div>
    </Router>
  );
}
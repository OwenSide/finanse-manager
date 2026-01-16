import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import BottomNav from "./components/BottomNav.jsx"; // Импортируем нижнее меню
import AddTransaction from "./pages/AddTransaction.jsx";
import Home from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Wallets from "./pages/Wallets.jsx";

export default function App() {
  // Нам больше не нужны стейты для меню и свайпов, 
  // так как навигация теперь разделена (Sidebar для ПК, BottomNav для телефона)

  return (
    <Router>
      {/* Глобальный контейнер: Темный фон, белый текст */}
      <div className="flex min-h-screen bg-[#0B0E14] text-white font-sans selection:bg-indigo-500/30">
        
        {/* 1. Сайдбар (Слева). 
            Внутри него уже прописан класс 'hidden md:flex', 
            поэтому он сам скроется на телефоне. */}
        <Sidebar />

        {/* 2. Основной контент */}
        <main className="flex-1 w-full min-h-screen relative transition-all duration-300">
          
          {/* Отступы контента:
              md:pl-64 -> На ПК сдвигаем контент вправо (место под Sidebar)
              pb-24    -> На телефоне добавляем отступ снизу (место под BottomNav)
          */}
          <div className="md:pl-64 pb-24 md:pb-0 h-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/stats" element={<Home />} />
              <Route path="/add-transaction" element={<AddTransaction />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/wallets" element={<Wallets />} />
            </Routes>
          </div>
        </main>

        {/* 3. Нижнее меню (Снизу).
            Внутри него прописан класс 'md:hidden',
            поэтому оно покажется только на телефоне. */}
        <BottomNav />

      </div>
    </Router>
  );
}
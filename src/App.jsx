import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar.jsx";
import DodajTransakcje from "./pages/DodajTransakcje.jsx";
import Stats from "./pages/Home.jsx";
import Categories from "./pages/Categories.jsx";
import Wallets from "./pages/Wallets.jsx";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  function handleTouchStart(e) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchMove(e) {
    setTouchEndX(e.touches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchEndX - touchStartX;

      if (window.innerWidth < 640) {
        if (diff > 50) {
          // свайп вправо — открыть меню
          setMenuOpen(true);
        } else if (diff < -50) {
          // свайп влево — закрыть меню
          setMenuOpen(false);
        }
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  }

  return (
    <Router>
      <div
        className="flex"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div className="flex-1 p-4 sm:ml-64">
          {/* Mobile menu button */}
          <div className="flex">
            <div className="sm:hidden mb-4 flex items-center justify-between">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 border rounded text-gray-700"
              >
                <Menu />
              </button>
              <h1 className="text-xl font-bold text-black ml-4">
                Menedżer finansów
              </h1>
            </div>

            {/* Для десктопа — заголовок отдельно */}
            <div className="hidden sm:block mb-6">
              <h1 className="text-3xl font-extrabold text-black-700 flex items-center gap-2">
                Menedżer finansów
              </h1>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<Stats />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/add-transaction" element={<DodajTransakcje />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/wallets" element={<Wallets />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

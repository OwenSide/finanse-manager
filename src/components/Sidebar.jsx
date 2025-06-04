import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ menuOpen, setMenuOpen }) {
  return (
    <div
      className={`fixed z-20 top-0 left-0 w-64 bg-white shadow h-full transition-transform duration-300 ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      } sm:relative sm:translate-x-0`}
    >
      <div className="p-4 border-b font-bold text-xl flex justify-between items-center">
        Menu
        <button className="sm:hidden" onClick={() => setMenuOpen(false)}>
          <X />
        </button>
      </div>
      <nav className="p-4 space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            (isActive ? "underline font-semibold " : "hover:underline ") + "block p-0.5"
          }
          onClick={() => setMenuOpen(false)}
        >
          🏠 Strona główna
        </NavLink>
        <NavLink
            to="/add-transaction"
            className={({ isActive }) =>
            (isActive ? "underline font-semibold " : "hover:underline ") + "block p-0.5"
            }
            onClick={() => setMenuOpen(false)}
        >
            ➕ Dodaj transakcję
        </NavLink>
        <NavLink
            to="/categories"
            className={({ isActive }) =>
            (isActive ? "underline font-semibold " : "hover:underline ") + "block p-0.5"
            }
            onClick={() => setMenuOpen(false)}
        >
            📂 Kategorie
        </NavLink>
        <NavLink
            to="/wallets"
            className={({ isActive }) =>
            (isActive ? "underline font-semibold " : "hover:underline ") + "block p-0.5"
            }
            onClick={() => setMenuOpen(false)}
        >
            💼 Portfele
        </NavLink>
        </nav>
    </div>
  );
}

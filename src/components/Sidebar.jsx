import { X } from "lucide-react";

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
        <div className="hover:underline cursor-pointer">📊 Statystyki</div>
        <div className="hover:underline cursor-pointer">➕ Dodaj transakcję</div>
        <div className="hover:underline cursor-pointer">📂 Kategorie</div>
        <div className="hover:underline cursor-pointer">💼 Portfele</div>
      </nav>
    </div>
  );
}

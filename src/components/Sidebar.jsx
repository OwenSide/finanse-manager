import { LayoutDashboard, PlusCircle, Tags, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    // hidden md:flex -> Скрыт на мобильных, Виден как Flex на экранах > 768px
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0B0E14] border-r border-white/5 z-20">
      
      {/* Заголовок */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
           <Wallet size={20} />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">Manager</span>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Strona główna" />
        <NavItem to="/add-transaction" icon={<PlusCircle size={20} />} label="Dodaj transakcję" />
        <NavItem to="/wallets" icon={<Wallet size={20} />} label="Portfele" />
        <NavItem to="/categories" icon={<Tags size={20} />} label="Kategorie" />
      </nav>

      {/* Футер сайдбара (можно добавить версию или выход) */}
      <div className="p-4 border-t border-white/5 text-xs text-gray-500 text-center">
        v1.0.0
      </div>
    </aside>
  );
}

// Вспомогательный компонент для ссылки (чтобы не дублировать классы)
function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center p-3 rounded-xl transition-all duration-300 group ${
          isActive
            ? "bg-indigo-600/10 text-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.1)] border border-indigo-500/20"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <span className="mr-3 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}
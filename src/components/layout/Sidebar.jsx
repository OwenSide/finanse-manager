import { LayoutDashboard, PlusCircle, Tags, Wallet, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0B0E14] border-r border-white/5 z-20">
      
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
           <Wallet size={20} />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">FinManager</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem to="/" icon={<LayoutDashboard size={20} />} label={t('nav.homeDesktop')} />
        <NavItem to="/add-transaction" icon={<PlusCircle size={20} />} label={t('nav.addTransaction')} />
        <NavItem to="/wallets" icon={<Wallet size={20} />} label={t('nav.wallets')} />
        <NavItem to="/categories" icon={<Tags size={20} />} label={t('nav.categories')} />
        <NavItem to="/stats" icon={<BarChart3 size={20} />} label={t('nav.analytics')} />
      </nav>

      <div className="p-4 border-t border-white/5 text-xs text-gray-500 text-center">
        Finance Manager
      </div>
    </aside>
  );
}

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
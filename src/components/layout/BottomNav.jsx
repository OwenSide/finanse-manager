import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Plus, Tags, Wallet, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 left-0 w-full px-6 z-50 md:hidden flex justify-center">
      <nav className="
        relative
        flex items-center justify-between 
        w-full max-w-sm 
        h-[72px] 
        px-1
        bg-[#0B0E14]/80 
        backdrop-blur-2xl 
        border border-white/10 
        rounded-[24px] 
        shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
      ">
        
        <div className="flex items-center justify-around flex-1">
            <BottomNavItem to="/" icon={<LayoutDashboard size={20} />} label={t('nav.home')} aria-label="Dashboard" />
            <BottomNavItem to="/wallets" icon={<Wallet size={20} />} label={t('nav.wallets')} aria-label="Wallets" />
        </div>

        <div className="mx-1 -mt-8 relative z-10 flex flex-col items-center">
            <NavLink 
                to="/add-transaction"
                aria-label="Add transaction" 
                className={({ isActive }) => `
                    flex items-center justify-center
                    w-14 h-14
                    rounded-full
                    bg-gradient-to-tr from-indigo-600 to-violet-600
                    text-white
                    shadow-[0_10px_20px_rgba(79,70,229,0.4)]
                    border-[4px] border-[#0B0E14]
                    transition-transform duration-200 active:scale-90
                    ${isActive ? "ring-2 ring-white/20" : ""}
                `}
            >
                <Plus size={28} strokeWidth={3} />
            </NavLink>
        </div>

        <div className="flex items-center justify-around flex-1">
            <BottomNavItem to="/categories" icon={<Tags size={20} />} label={t('nav.categories')} aria-label="Categories" />
            <BottomNavItem to="/stats" icon={<BarChart3 size={20} />} label={t('nav.analytics')} aria-label="Analytics" />
        </div>

      </nav>
    </div>
  );
}

function BottomNavItem({ to, icon, label, "aria-label": ariaLabel }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      aria-label={ariaLabel || label} 
      className={`relative flex flex-col items-center justify-center w-14 h-full transition-colors group ${
          isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute top-[2] w-12 h-12 bg-white/5 rounded-xl -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div className={`transition-all duration-300 mb-0.5 ${isActive ? "scale-110 -translate-y-0.5" : ""}`}>
        {icon}
      </div>

      <span className={`text-[8px] font-medium tracking-wide transition-all duration-300 ${isActive ? "text-white font-bold" : "text-gray-500"}`}>
        {label}
      </span>
    </NavLink>
  );
}
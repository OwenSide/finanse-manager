import { NavLink, useLocation } from "react-router-dom";
// 🔥 Добавил MoreHorizontal
import { LayoutDashboard, Plus, Tags, Wallet, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomNav() {
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
        
        {/* Левая группа */}
        <div className="flex items-center justify-around flex-1">
            <BottomNavItem to="/" icon={<LayoutDashboard size={20} />} label="Główna" />
            <BottomNavItem to="/wallets" icon={<Wallet size={20} />} label="Portfele" />
        </div>

        {/* Центральная кнопка (Акцентная) */}
        <div className="mx-1 -mt-8 relative z-10 flex flex-col items-center">
            <NavLink 
                to="/add-transaction"
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

        {/* Правая группа */}
        <div className="flex items-center justify-around flex-1">
            <BottomNavItem to="/categories" icon={<Tags size={20} />} label="Kategorie" />
            
            {/* 🔥 КНОПКА "ЕЩЁ" */}
            <BottomNavItem to="/menu" icon={<MoreHorizontal size={20} />} label="Więcej" />
        </div>

      </nav>
    </div>
  );
}

function BottomNavItem({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`relative flex flex-col items-center justify-center w-14 h-full transition-colors group ${
          isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {/* Анимированный фон (оставляем, но делаем его менее заметным или убираем, если мешает подписям. Тут оставил легкий эффект) */}
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute top-[2] w-11 h-11 bg-white/5 rounded-xl -z-10"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Иконка */}
      <div className={`transition-all duration-300 mb-0.5 ${isActive ? "scale-110 -translate-y-0.5" : ""}`}>
        {icon}
      </div>

      {/* Подпись */}
      <span className={`text-[9px] font-medium tracking-wide transition-all duration-300 ${isActive ? "text-white font-bold" : "text-gray-500"}`}>
        {label}
      </span>
      
      {/* Лампа/Точка (теперь она очень маленькая под текстом, если нужно, или можно убрать, так как текст стал жирным) */}
      {/* {isActive && (
        <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-1.5 w-0.5 h-0.5 rounded-full bg-indigo-500 shadow-[0_0_8px_2px_rgba(99,102,241,0.8)]" 
        />
      )} */}
    </NavLink>
  );
}
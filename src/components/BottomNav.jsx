import { NavLink } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Tags, Wallet } from "lucide-react";

export default function BottomNav() {
  return (
    // fixed bottom-4 -> Прибит к низу с отступом
    // md:hidden -> Скрыт на компьютерах
    <div className="fixed bottom-4 left-0 w-full px-4 z-50 md:hidden">
      <nav className="
        glass-panel 
        h-16 
        rounded-[2rem] 
        flex items-center justify-between 
        px-6 
        bg-[#151A23]/90 
        backdrop-blur-xl 
        border border-white/10 
        shadow-2xl
      ">
        <BottomNavItem to="/" icon={<LayoutDashboard size={22} />} />
        <BottomNavItem to="/wallets" icon={<Wallet size={22} />} />
        
        {/* Центральная кнопка "Добавить" (Акцентная) */}
        <NavLink 
          to="/add-transaction"
          className={({ isActive }) => `
            w-12 h-12 rounded-full flex items-center justify-center 
            transition-all duration-300 -mt-8 border-4 border-[#0B0E14]
            ${isActive 
              ? "bg-indigo-500 text-white shadow-[0_0_20px_indigo]" 
              : "bg-[#1E2330] text-gray-400 border border-white/10 hover:bg-indigo-500 hover:text-white"
            }
          `}
        >
          <PlusCircle size={26} />
        </NavLink>

        <BottomNavItem to="/categories" icon={<Tags size={22} />} />
        {/* Можно добавить еще пункт, например настройки */}
        <div className="w-6" /> {/* Заглушка для симметрии, если кнопок нечетное кол-во */}
      </nav>
    </div>
  );
}

function BottomNavItem({ to, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center transition-all duration-300 ${
          isActive ? "text-indigo-400 scale-110" : "text-gray-500 hover:text-gray-300"
        }`
      }
    >
      {icon}
      {/* Точка под активной иконкой */}
      <span className="w-1 h-1 rounded-full bg-current mt-1 opacity-0 aria-[current=page]:opacity-100 transition-opacity" />
    </NavLink>
  );
}
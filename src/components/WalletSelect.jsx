import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WalletFlag from "../utils/flags";
import { useTranslation } from 'react-i18next';

// 🔥 НОВОЕ: Функция для сокращения текста в середине
const truncateMiddle = (text, maxLength = 16) => {
    if (!text || text.length <= maxLength) return text;
    // Берем первые 8 символов, ставим троеточие и берем последние 5 символов
    return `${text.slice(0, 8)}...${text.slice(-5)}`;
};

export default function WalletSelect({ 
    wallets, 
    value, 
    onChange, 
    showAllOption = false,
    bgClass = "bg-[#151A23]",
    textClass = "text-white", 
    placeholderClass = "text-gray-400" //
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const currentWallet = wallets.find(w => w.id === value);

    return (
        <div className="relative z-50 w-full" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full ${bgClass} border rounded-xl overflow-hidden cursor-pointer transition-colors h-[50px] flex items-center justify-between px-3 ${
                    isOpen ? "border-indigo-500/50" : "border-white/5 hover:border-white/10"
                }`}
            >
                {/* Выбранный кошелек */}
                <div className="flex items-center gap-3 min-w-0">
                    {currentWallet ? (
                        <>
                            <WalletFlag currency={currentWallet.currency} className="w-6 h-6 shadow-sm shrink-0" />
                            {/* 🔥 ИСПОЛЬЗУЕМ textClass */}
                            <span className={`${textClass} text-sm truncate`}>
                                {currentWallet.currency} • {truncateMiddle(currentWallet.name, 18)}
                            </span>
                        </>
                    ) : (
                        // 🔥 ИСПОЛЬЗУЕМ placeholderClass
                        <span className={`${placeholderClass} text-xs truncate`}>
                            {showAllOption ? t('walletSelect.allWallets') : t('walletSelect.selectWallet')}
                        </span>
                    )}
                </div>
                
                <ChevronDown 
                    className={`text-gray-600 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-400" : ""}`} 
                    size={16} 
                />
            </div>

            {/* Выпадающий список */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[100%] left-0 w-full mt-2 bg-[#1A1F2B] border border-white/10 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 scrollbar-hide ring-1 ring-black/50"
                    >
                        {/* Кнопка сброса */}
                        {showAllOption && (
                            <div
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                }}
                                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors border-b border-white/5 ${
                                    value === "" ? "bg-indigo-500/10 text-indigo-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <div className="w-7 h-7 flex items-center justify-center bg-white/5 rounded-full border border-white/10 shrink-0">
                                    <Wallet size={14} />
                                </div>
                                <span className="text-sm font-bold truncate">{t('walletSelect.allWallets')}</span>
                            </div>
                        )}

                        {/* Список кошельков */}
                        {wallets.map((w) => (
                            <div
                                key={w.id}
                                onClick={() => {
                                    onChange(w.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${
                                    value === w.id ? "bg-indigo-500/10" : "hover:bg-white/5"
                                }`}
                            >
                                <WalletFlag currency={w.currency} className="w-7 h-7 shadow-sm shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    {/* 🔥 ИСПОЛЬЗУЕМ ФУНКЦИЮ ЗДЕСЬ */}
                                    <span className={`text-sm font-bold truncate ${value === w.id ? "text-indigo-400" : "text-white"}`}>
                                        {truncateMiddle(w.name, 20)}
                                    </span>
                                    <span className="text-[10px] text-gray-500 font-mono">
                                        {w.currency}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
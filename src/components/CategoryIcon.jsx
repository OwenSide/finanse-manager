import React from 'react';
import { 
  // Базовые и Разное
  Tag, HelpCircle, MoreHorizontal,
  // Финансы
  Wallet, DollarSign, CreditCard, Briefcase, Landmark, PiggyBank, TrendingUp,
  // Покупки и Одежда
  ShoppingCart, ShoppingBag, Gift, Package, Shirt,
  // Еда
  Coffee, Utensils, Beer, Wine, 
  // Транспорт
  Home, Car, Bus, Plane, Fuel, Bike, CarFront,
  // Техника и Сервисы
  Zap, Wifi, Phone, Smartphone, Tv, Hammer, Wrench,
  // Подписки и Развлечения
  Gamepad2, Music, Film, Heart, Smile, Book, GraduationCap,
  Youtube, Clapperboard, Ticket,
  // Здоровье, Красота, Жизнь
  Dumbbell, Stethoscope, Baby, Dog, Palette, Globe, Scissors
} from 'lucide-react';

// Карта иконок
const iconMap = {
  // --- Финансы ---
  "tag": Tag,
  "wallet": Wallet,
  "dollar-sign": DollarSign,
  "credit-card": CreditCard,
  "briefcase": Briefcase,
  "bank": Landmark,
  "piggy": PiggyBank,
  "invest": TrendingUp,   // Инвестиции / Рост

  // --- Покупки ---
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  "gift": Gift,
  "package": Package,
  "clothes": Shirt,       // Одежда / Мода

  // --- Еда ---
  "coffee": Coffee,
  "utensils": Utensils,
  "beer": Beer,
  "wine": Wine,

  // --- Транспорт ---
  "home": Home,
  "car": Car,
  "taxi": CarFront,       // Такси / Uber
  "bus": Bus,
  "plane": Plane,
  "fuel": Fuel,
  "bike": Bike,

  // --- Услуги ---
  "zap": Zap,
  "wifi": Wifi,
  "phone": Phone,
  "smartphone": Smartphone,
  "tv": Tv,
  "repair": Hammer,
  "service": Wrench,

  // --- Развлечения ---
  "youtube": Youtube,
  "netflix": Clapperboard,
  "cinema": Ticket,
  "gamepad": Gamepad2,
  "music": Music,
  "film": Film,
  
  // --- Жизнь ---
  "gym": Dumbbell,
  "health": Stethoscope,
  "beauty": Scissors,     // Парикмахерская / Салон красоты
  "baby": Baby,
  "pet": Dog,
  "art": Palette,
  "travel": Globe,
  
  "heart": Heart,
  "smile": Smile,
  "book": Book,
  "graduation-cap": GraduationCap,
  "other": MoreHorizontal, // Другое
  
  // --- Fallback ---
  "help-circle": HelpCircle
};

export default function CategoryIcon({ iconName, size = 20, className = "" }) {
  const IconComponent = iconMap[iconName] || iconMap[iconName?.toLowerCase()] || Tag;
  return <IconComponent size={size} className={className} />;
}